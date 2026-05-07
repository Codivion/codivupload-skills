# CodivUpload Social Manager (via codivupload.com)

Autonomously manage social media posting via the [CodivUpload](https://codivupload.com) API — schedule, publish, cross-post, and analyze content across YouTube, Instagram, Facebook, X, TikTok, Threads, and Pinterest from one OpenClaw skill.

[![ClawHub](https://img.shields.io/badge/ClawHub-codivupload--social--manager-cyan)](https://clawhub.ai/codivion/codivupload-social-manager)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Codivion/codivupload-skills/blob/main/LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-7%2B-green)](https://codivupload.com/use-case/ai-skills/openclaw)
[![MCP](https://img.shields.io/badge/MCP-supported-violet)](https://www.npmjs.com/package/codivupload-mcp)
[![Get an API key](https://img.shields.io/badge/Get_API_key-codivupload.com-indigo)](https://app.codivupload.com)

> **Quick start:** sign up at [codivupload.com](https://codivupload.com) (free plan = 10 uploads/mo, no credit card) → Dashboard → Settings → API Keys → create a **per-workspace** key → `openclaw config set CODIVUPLOAD_API_KEY=cdv_…` → ask your agent "schedule this video to TikTok and Instagram for tomorrow at 9am".

---

A comprehensive social media manager skill for OpenClaw. Turns your local AI assistant into an autonomous social media manager for **YouTube, Instagram, X (Twitter), Facebook, TikTok, Threads, and Pinterest** — **7+ platforms launched** (with Bluesky in active rollout).

## YouTube · Instagram · X · Facebook — first-class support

This skill puts the **most-used platforms** front and center, with deeper integration than any rival skill:

### YouTube
- **Schedule + publish** long-form videos, Shorts, livestreams
- **24/7 managed live streams** with FFmpeg relay (zero CPU on your machine)
- **BYOP** (Bring Your Own Project) → unlimited daily upload quota via your own Google Cloud project (vs shared 10K-unit limit on rival skills)
- **Made-For-Kids** (MFK / COPPA) flag handled correctly per upload
- Premiere scheduling, end screens, cards
- Bulk upload 60+ Shorts per day per channel with BYOP

### Instagram
- **Reels + Stories + Carousels + Feed posts** — full coverage
- Auto-schedule without the push-notification-on-phone dance
- Business + Creator account support (no Personal-account limitation)
- Per-post platform overrides (caption, hashtags, first-comment)
- Cross-post tag, location, music sync
- Up to 10-image carousels with mixed photo + video

### X (Twitter)
- **Long-form posts** (25K chars on X Premium / Premium+)
- **Threads** with native reply chains, polls, scheduled
- **BYOK** (Bring Your Own Keys) → unlimited free-tier posts via your own X Developer App (rival skills cap you on shared keys)
- Quote posts, reposts, image/video attachments
- X Premium feature awareness — agent suggests Premium tier when needed

### Facebook
- **Page posts** (Personal not supported by Meta API anywhere — this is API-level, not skill-level)
- Reels, video, image, link previews
- Multi-page support for agencies (manage 100+ Pages)
- Scheduled posts via Meta Graph API (proper, not browser automation)
- Group posting via authenticated Page admin

Plus **TikTok, Threads, and Pinterest** all launched with the same depth. **Bluesky** is in active rollout — skill auto-detects new platforms via the API.

## Why this skill (vs alternatives)

| Capability | CodivUpload Skill | Post Bridge Skill | Other social skills |
|---|---|---|---|
| **Platform count (launched)** | **7+** | 5 | 3-7 |
| **MCP server** | ✅ `codivupload-mcp` | ❌ | ❌ |
| **24/7 live streaming** | ✅ Managed FFmpeg relay | ❌ | ❌ |
| **BYOP** (dedicated YouTube quota) | ✅ | ❌ | ❌ |
| **BYOK** (dedicated X rate limit) | ✅ | ❌ | ❌ |
| **Agency multi-tenant** | ✅ Workspace cascade + RBAC | ❌ | ❌ |
| **Whitelabel branded OAuth** | ✅ Pro+ | ❌ | ❌ |
| **TypeScript SDK** | ✅ npm: `codivupload` | ❌ | partial |
| **Python SDK** | ✅ PyPI: `codivupload` | ❌ | partial |
| **Free plan** | ✅ 10 uploads/mo, all launched platforms | varies | varies |
| **Open-source skill files** | ✅ MIT, fork-friendly | ✅ | ✅ |
| **Active development** | Weekly releases | varies | varies |

**Bottom line:** CodivUpload Skill is the only OpenClaw skill that turns your local AI agent into a **full-stack social media operations system** — not just a basic scheduler. Live streams, agency workspaces, BYOP/BYOK, MCP-native — all in one skill.

## What this skill does

When installed, your OpenClaw agent (running locally on Mac / Linux / Windows) gains the ability to:

- **Schedule posts** to any of the 7+ launched social platforms (with Bluesky in active rollout) — platform-specific overrides per platform
- **Help draft and queue** YouTube Shorts, TikToks, and Reels via the REST API (the skill defaults to scheduled / draft modes; bulk operations require explicit user confirmation up front)
- **Set up 24/7 YouTube live streams** with managed FFmpeg relay (always confirmation-gated; the skill includes the `DELETE /v1/livestreams/{id}` stop instruction whenever it starts a stream)
- **Pull cross-platform analytics** for engagement, growth, best-time-to-post (read-only)
- **Manage agency client profiles** with whitelabel branding
- **Use BYOP** (Bring Your Own Project) for dedicated YouTube quota
- **Use BYOK** (Bring Your Own Keys) for dedicated X rate limits

The skill prefers calling [CodivUpload's MCP server](https://www.npmjs.com/package/codivupload-mcp) when configured, falling back to direct REST API calls otherwise.

### Safety defaults baked into the skill
SKILL.md ships with a **Safety & confirmation defaults** section (read by the LLM at activation) that requires explicit user confirmation before any immediate publish, bulk operation (≥3 posts), live stream start, profile/account change, or spending-impacting action. The skill prefers scheduled/draft modes over immediate publish, prefers single-platform smoke tests before fan-out, and never logs or echoes the API key. See `SKILL.md` → "Safety & confirmation defaults" for the full list.

## Installation

```bash
# Drop SKILL.md into your OpenClaw skills workspace
mkdir -p ~/.openclaw/workspace/skills/codivupload
cp SKILL.md ~/.openclaw/workspace/skills/codivupload/SKILL.md

# Optional: install the MCP server (gives the agent direct tool access).
# IMPORTANT: use an EXACT version pin — no caret, no tilde, no `latest`.
# A credentialed runtime (the MCP server inherits CODIVUPLOAD_API_KEY)
# should never resolve a floating range.
npm install -g codivupload-mcp@2.0.0

# Verify before relying on it:
npm view codivupload-mcp publisher        # → codivion <accounts@codivion.com>
npm view codivupload-mcp@2.0.0 dist.integrity
# expected: sha512-pK0r8XkR2M/brfn1Nsy6Uh7nGDx5qpx9h3pLgZljYkU3pv0BXKb7uJapBOFL11mBIQhWAl0hASxxCSLE11SDfA==
```

The skill works **without** the MCP server (it falls back to direct REST API + the official TypeScript / Python SDKs) — install only if you want fewer agent tokens spent on tool descriptions. Skip it to keep the supply-chain surface to zero. **Avoid `npx -y codivupload-mcp` without a pinned exact version** — `-y` auto-accepts whatever the registry resolves, which is a bad fit for a credentialed runtime.

## Configuration

Set your CodivUpload API key in OpenClaw config (this is the only place the skill reads it from — the skill never asks for the key in chat and never echoes it back):

```bash
openclaw config set CODIVUPLOAD_API_KEY=cdv_your_api_key_here
```

### Issue the **narrowest** key the skill needs (this is the most important security setting)

The CodivUpload API enforces per-key scope **server-side** — pick the narrowest tier that fits your use case:

| Tier | Authority | When to use | How to create |
|---|---|---|---|
| **Single-platform** | Publish to ONE platform on ONE profile. No analytics, no profile mgmt, no billing. | Skill will only post to (e.g.) Instagram for one brand. | Dashboard → API Keys → New → Limit platform + profile |
| **Per-workspace (RECOMMENDED DEFAULT)** | Publish + analytics within ONE workspace. No cross-workspace, no billing. | Skill manages one brand or one client across multiple platforms. | Dashboard → Workspaces → \[workspace\] → API Keys → New |
| **Posting-only** | Publish + analytics across all workspaces. **No** profile mgmt, **no** billing. | Power user with multiple brands but doesn't want the agent touching settings. | Dashboard → API Keys → New → Toggle off "Profile management" + "Billing actions" |
| **Global account key** | Everything: publish across all workspaces, profile mgmt, billing changes. | **Avoid for agent use.** Only when you intentionally want the agent to add seats / change plan. | Dashboard → API Keys → New (default) |

**The skill expects a per-workspace key by default.** If you provide a global account key, the skill will warn you before allowing any billing-impacting or cross-workspace action and require explicit acknowledgement. This is the only effective mitigation against an over-broad credential — confirmation gates are second-line; **scope is first-line**.

If you ever paste the key into chat by mistake, rotate it from Dashboard → API Keys → Revoke + reissue. Full credential-handling rules are spelled out in `SKILL.md` → "Required key scope" + "Credential handling" so the agent enforces them on your behalf.

If you don't have an account yet, sign up at [codivupload.com](https://codivupload.com) — free plan covers **10 uploads / month** with all 7+ launched platforms (no credit card). Paid tiers — Starter $20/mo ($200/yr), Pro $40/mo ($400/yr), Business $140/mo ($1,400/yr), Enterprise $400/mo ($4,000/yr) — yearly billing = pay 10 months, get 12 (**2 months free**). Full breakdown: [codivupload.com/pricing](https://codivupload.com/pricing).

## Usage examples

After installation, you can ask your OpenClaw agent things like:

```
"Schedule this video to post on TikTok, Instagram, and YouTube tomorrow at 9am"
"Cross-post my latest blog announcement to X and Threads"
"Pull engagement stats for my Instagram for the last 30 days"
"Set up a 24/7 YouTube live stream with this MP4 source"
"List my connected social profiles"
"What's the best time to post for my TikTok audience?"
```

The skill will activate automatically when these phrases match the trigger description in `SKILL.md`.

## How it integrates with OpenClaw

OpenClaw's skill system reads the YAML frontmatter to determine **when** to activate this skill, then injects the markdown body as context for the LLM (Claude / GPT / local model). The body includes:

- Complete API contract for `POST /v1/posts`
- Platform-specific override parameters (per-platform tables)
- Worked examples for common patterns (cross-post, scheduling, BYOP, live stream)
- MCP integration setup if available
- Error handling + retry guidance

The agent uses this knowledge to either:
1. **Call MCP tools directly** if `codivupload-mcp` is registered as an MCP server (each tool call is subject to OpenClaw's per-tool approval prompt + the skill's confirmation gates).
2. **Generate `curl` / SDK code for the user to review and run** — the skill's safety defaults instruct the LLM to surface every publish/bulk/livestream command to the user for explicit confirmation before any execution via OpenClaw's `exec` tool. Raw, un-confirmed execution of publishing commands is **disallowed by SKILL.md**.

## Files in this package

```
openclaw-skill/
├── SKILL.md          # Main skill definition (YAML frontmatter + agent instructions)
└── README.md         # This file
```

## Compatibility

- **OpenClaw**: All recent versions (skills system stable since v0.1)
- **Operating systems**: macOS, Linux, Windows
- **Backing LLMs**: Works with Claude (3.5+), GPT-4o+, local models with tool-use support
- **Optional MCP server**: `codivupload-mcp` (`npx codivupload-mcp` to test)

## Related

- **CodivUpload MCP server**: [npmjs.com/package/codivupload-mcp](https://www.npmjs.com/package/codivupload-mcp)
- **CodivUpload TypeScript SDK**: [npmjs.com/package/codivupload](https://www.npmjs.com/package/codivupload)
- **CodivUpload Python SDK**: [pypi.org/project/codivupload](https://pypi.org/project/codivupload/)
- **REST API docs**: [api.codivupload.com](https://api.codivupload.com)
- **Claude / ChatGPT / Cursor / Zed Skills version**: see the sibling directories in the same repo — [Codivion/codivupload-skills](https://github.com/Codivion/codivupload-skills) (per-platform skill files for the launched platforms)

## License

MIT — fork it, adapt it, ship it.

## Support

- Docs: [docs.codivupload.com](https://docs.codivupload.com)
- Issues: [github.com/Codivion/codivupload-skills/issues](https://github.com/Codivion/codivupload-skills/issues)
- Email: support@codivupload.com
