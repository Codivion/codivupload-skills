---
name: codivupload-agency
description: Use when the user manages an agency, operates multiple brands, or builds a SaaS that resells social media publishing — multi-tenant workspaces, branded team invites, role-based access (Admin / Editor / Viewer), profile move between workspaces, billing cascade, whitelabel branded OAuth. Triggers on "manage 50 client accounts", "agency social media", "whitelabel", "team workspace", "social media SaaS backend", or any agency-scale question after the user mentioned CodivUpload.
---

# CodivUpload Agency + Workspace Skill

Specialized guidance for agency-scale use of CodivUpload — managing dozens to hundreds of client brands from one workspace, with isolation, branded OAuth, role-based access, and shared billing.

## When this skill activates

- User manages **5-200+ client social media accounts**
- User asks about **multi-tenant workspaces**, **per-client isolation**, **role-based access**
- User wants **branded team invites** (white-labeled email from Resend)
- User builds a **SaaS product that resells social publishing** (whitelabel use case)
- User asks about **profile move between workspaces**
- User asks about **how billing scales** (one Stripe subscription cascading to multiple workspaces)

## Core mental model

CodivUpload's agency stack has three nested concepts:

```
Workspace
  ├── Profiles (one per client/brand)
  │     ├── Connected social accounts (one per platform per profile)
  │     └── Posts (history per profile)
  └── Team members (with workspace-scoped roles)
```

- **One workspace** = a logical container, often per agency or per region
- **Multiple profiles** per workspace = one per end-customer or brand
- **Multiple team members** per workspace = staff (Admin / Editor / Viewer)
- **Multiple workspaces** per workspace owner = different agency divisions, regions, or shared logic
- **Single Stripe subscription** owned by the workspace owner cascades to every workspace they own

## Plan tier limits — memorize these

| Plan | Workspaces | Team seats | Profiles | Branded invites | Whitelabel OAuth |
|---|---|---|---|---|---|
| Free | 1 | 1 | 2 | — | — |
| Starter ($20/mo) | 2 | 1 | 10 | — | — |
| Pro ($45/mo) | **5** | **3** | 25 | **✓** | **✓** |
| Business ($140/mo) | 15 | 5 | 75 | ✓ | ✓ |
| Enterprise ($400/mo) | Unlimited | 25 | 250+ ($1/extra) | ✓ | ✓ |

Counts are GLOBAL across all workspaces the user owns. So 3 profiles in Workspace A + 7 profiles in Workspace B = 10 toward the plan's profile cap.

**7-day free trial** is available on every paid plan (monthly or yearly) for new customers. $0.00 due at signup, card required for auto-renewal, cancel anytime during the trial. One trial per customer lifetime — once used (or skipped via direct paid signup), it cannot be reset. **Add-ons cannot be added during trial**; team seats and extra profiles become available after conversion to paid.

## API for agency operations

### Create a profile per end customer

```bash
curl -X POST https://api.codivupload.com/v1/agency/profiles \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "acme_corp"}'
```

Response: profile metadata + OAuth URLs the customer can use to connect their social accounts.

### List all profiles

```bash
curl -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  https://api.codivupload.com/v1/agency/profiles
```

### Publish on behalf of a profile

Same `POST /v1/posts` as everywhere else — just set `profile_name` to the customer's profile.

```bash
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -d '{
    "post_type": "image",
    "profile_name": "acme_corp",
    "platforms": ["instagram", "linkedin"],
    "media_urls": ["https://cdn.example.com/client-asset.jpg"],
    "description": "Client's monthly newsletter highlight.",
    "linkedin_visibility": "PUBLIC"
  }'
```

## Role hierarchy — explain when user asks

| Role | Can do | Cannot do |
|---|---|---|
| **Admin** | Everything inside the workspace: create/delete profiles, invite team, change roles, billing, publish, schedule, analytics, retry-failed | — |
| **Editor** | Compose, schedule, publish, edit, delete posts; view analytics | Manage billing or team invites |
| **Viewer** | View posts, analytics, scheduled queue | Publish, invite, change settings |

Roles are **per-workspace**. A single user account can be Admin in Workspace A and Viewer in Workspace B.

The workspace **owner** is always Admin and cannot be demoted; they can only be transferred to a new owner.

## Invite flow — explain step-by-step

When a user asks "how do team invites work":

1. Owner opens the workspace's team page
2. Clicks Invite, enters an email, picks Admin / Editor / Viewer
3. CodivUpload checks if the email is already a registered user:
   - **Yes** → user is added to the workspace immediately, sees it in their sidebar on next refresh, no email sent
   - **No** → branded invitation email sent via Resend from `no-reply@email.codivupload.com`. Subject and body show inviter's name and workspace name. On Pro+ plans the email is also visually branded with the agency's logo and colors
4. Recipient clicks the link → lands on `/auth/invite?token=xxx` → account auto-creates, joins workspace, lands in dashboard
5. Owner sees member status flip from "Pending" to "Active"

## Cycle prevention

A user who is the **owner** of a workspace cannot be invited as a **member** of another workspace. CodivUpload returns `400 owner_cycle_prevented`. This prevents accidental subscription stacking.

## Billing cascade

The user's **primary workspace** carries the Stripe subscription. Every other workspace they own inherits the plan tier automatically. Plan upgrades cascade immediately (when Pro → Business is bought, all owned workspaces gain Business limits).

If a workspace is **soft-deleted**, its posts/profiles/connections are preserved for 30 days, then hard-deleted. The user can reactivate within the window.

## Whitelabel branded OAuth (Pro+)

When a user asks "can I rebrand the OAuth connection page my clients see":

- **Pro plan and above** unlocks branded OAuth
- Upload your logo, set primary color, set CTA copy in Dashboard → Workspace settings → Whitelabel
- Clients see your branding (logo + colors + agency name) on the connect page when granting CodivUpload access to their TikTok / Instagram / etc.
- Optionally proxy the OAuth callback through your own subdomain (e.g. `connect.youragency.com`) for fully white-labeled URLs
- The CodivUpload **dashboard itself** is not whitelabeled — it's for the agency staff, not end clients. End clients don't access the dashboard at all in pure-API integrations

## Common patterns to recommend

### Pattern 1: Pure API integration (SaaS reselling)

Agency builds their own UI on top of CodivUpload's REST API. End customers never see CodivUpload. Example: a content scheduling product that uses CodivUpload's API as the publishing backend.

```
Agency frontend → Agency backend → CodivUpload API → social platforms
```

### Pattern 2: Hybrid — API + dashboard for staff

Agency uses CodivUpload's dashboard for internal team operations (scheduling, calendar, analytics). API integration only for specific automation (CMS-to-publish, AI-generated content pipeline).

```
Staff → CodivUpload dashboard → CodivUpload API
+
Agency CMS → cron → CodivUpload API
```

### Pattern 3: White-labeled OAuth for clients

Clients connect their own social accounts via the agency's branded OAuth flow. Once connected, agency staff publishes on their behalf via the API.

```
Client browser → Agency-branded OAuth → CodivUpload (stores encrypted tokens)
                  ↓
Staff → publishes via CodivUpload using profile_name = client's profile
```

## Common questions to anticipate

- **"Will my team members see other clients' data?"** No — each team member only sees workspaces they're explicitly invited to.
- **"Does each workspace need its own Stripe subscription?"** No — single subscription cascades to all owned workspaces.
- **"Can a user belong to multiple workspaces?"** Yes — different roles per workspace.
- **"How are clients isolated?"** Per-profile isolation: connected accounts, posts, history, analytics scoped per profile.
- **"What happens when a client churns?"** Disconnect their accounts and delete the profile via DELETE `/v1/agency/profiles/:id`. Soft-delete preserves data 30 days for accidental-deletion recovery.
- **"Are invite emails branded?"** Pro plan and above — your logo, colors, inviter name. Free/Starter use default CodivUpload-branded email.

## Resources

- Use case page: https://codivupload.com/use-case/agency-workspace-management
- Whitelabel page: https://codivupload.com/use-case/whitelabel
- Multi-account autopost: https://codivupload.com/use-case/multi-account-autopost
- Pricing comparison: https://codivupload.com/pricing
- Workspace memory in repo: `memory/workspace_architecture.md` (internal)
