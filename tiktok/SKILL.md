---
name: codivupload-tiktok
description: Use when the user wants to upload, schedule, or automate TikTok content via CodivUpload — Direct Post or Draft mode, privacy levels, brand content disclosure, AI-generated content flag, comment/duet/stitch toggles. Triggers on "TikTok + API", "TikTok automation", "TikTok scheduler", "TikTok Direct Post", "TikTok Draft mode", or any TikTok-specific question after the user mentioned CodivUpload.
---

# CodivUpload TikTok Skill

Specialized guidance for using CodivUpload to publish to TikTok via TikTok's Content Posting API. CodivUpload's app is approved for Direct Post — no per-app review required from the user.

## When this skill activates

- User wants to **schedule TikTok videos via API**
- User asks about **Direct Post vs Draft mode** (client-approval workflows)
- User asks about **privacy levels**, **comments/duets/stitches** controls
- User mentions **brand content disclosure** or **AI-generated content** (TikTok policy)
- User wants to **automate TikTok publishing** at scale

## Two post modes — explain to user

CodivUpload supports both modes via the `tiktok_post_mode` field:

| Mode | What happens | Use case |
|---|---|---|
| `DIRECT_POST` (default) | Video publishes immediately or at `scheduled_date` | Standard automation — agencies posting on behalf of clients with delegation |
| `DRAFT` | Video uploads to user's TikTok inbox; user finalizes manually from the mobile app | Client-approval flows — agency uploads, client reviews + posts when ready |

Default is `DIRECT_POST`. Set `tiktok_post_mode: "DRAFT"` for the client-approval pattern.

## API contract for TikTok

```bash
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "video",
    "profile_name": "my_brand",
    "platforms": ["tiktok"],
    "media_urls": ["https://cdn.example.com/clip.mp4"],
    "title": "How I automate my workflow",
    "description": "How I automate my workflow ✨ #productivity #automation",
    "tiktok_privacy_level": "PUBLIC_TO_EVERYONE",
    "tiktok_disable_comment": false,
    "tiktok_disable_duet": false,
    "tiktok_disable_stitch": false
  }'
```

## CRITICAL — disable not allow

The TikTok API uses **disable** flags, not **allow**. Common mistake.

| ❌ Wrong | ✅ Correct |
|---|---|
| `tiktok_allow_comment: true` | `tiktok_disable_comment: false` |
| `tiktok_allow_duet: true` | `tiktok_disable_duet: false` |
| `tiktok_allow_stitch: true` | `tiktok_disable_stitch: false` |

Default behavior: nothing disabled (everything allowed). Pass `disable_*: true` only when you want to block that interaction.

## TikTok-specific override fields

Privacy:
- `tiktok_privacy_level` — `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIEND`, or `SELF_ONLY`. Use `SELF_ONLY` for testing.

Interaction controls:
- `tiktok_disable_comment` (bool, default false)
- `tiktok_disable_duet` (bool, default false)
- `tiktok_disable_stitch` (bool, default false)

Brand content disclosure (REQUIRED for sponsored content):
- `tiktok_brand_content_toggle` (bool) — set true if this is a paid partnership with a third-party advertiser (the FTC-disclosure case)
- `tiktok_brand_organic_toggle` (bool) — set true if this is your own brand promoting itself organically

AI / synthetic media disclosure (REQUIRED for AI content involving real people):
- `tiktok_is_aigc` (bool) — TikTok adds an automatic AI-generated label

Post mode:
- `tiktok_post_mode` — `DIRECT_POST` (default) or `DRAFT`

Other:
- `tiktok_text` — overrides global description for TikTok only (max 2,200 chars)
- `tiktok_media_urls` — per-platform media override (different aspect ratio for TT vs IG)

## Hard requirements

| Requirement | Detail |
|---|---|
| Video format | MP4 or MOV, H.264 codec, max 287 MB, 3-180 seconds, max 1080p |
| Aspect ratio | 9:16 portrait recommended (16:9 gets pillarboxed and kills engagement) |
| Account types | Personal, Creator, Business — all supported |
| Daily upload cap | 100/day per account |
| Per-token rate limit | 6 calls/minute per access token |

## Direct Post permission timing

TikTok requires Direct Post permission to be granted per-app AND per-account. CodivUpload's app is approved app-wide. New TikTok Business accounts sometimes spend 24-48 hours in TikTok's onboarding window where Direct Post is silently disabled — every video lands in drafts during that period. This self-resolves. If a user reports "all my posts are drafts even though I set DIRECT_POST", check the account is older than 48 hours.

## Common mistakes to catch

1. **Using `tiktok_allow_*`** — fields don't exist. Switch to `tiktok_disable_*` boolean negation.
2. **Horizontal video uploads** — technically allowed but pillarboxes inside vertical viewport, kills engagement. Always crop to 9:16.
3. **Skipping brand disclosure** — for paid content, `tiktok_brand_content_toggle: true` is required by TikTok policy. Account-level penalties for non-disclosure.
4. **Skipping AI disclosure** — `tiktok_is_aigc: true` required for AI-generated content involving real people. Synthetic media policy violation otherwise.
5. **Trying to post to multiple TikTok accounts in one call** — each account has its own profile. Send one POST /v1/posts per `profile_name`. Parallelize the calls; no shared rate-limit penalty across profiles.

## Cross-post recipe — Reel + TikTok + YouTube Shorts

Single 9:16 vertical video under 60 seconds, single API call:

```python
client.posts.create(
    post_type="video",
    profile_name="my_brand",
    platforms=["instagram", "tiktok", "youtube"],
    media_urls=["https://cdn.example.com/clip.mp4"],
    description="Quick productivity tip ✨ #productivity",
    instagram_share_to_feed=True,
    tiktok_privacy_level="PUBLIC_TO_EVERYONE",
    tiktok_disable_comment=False,
    youtube_type="shorts",
    youtube_privacy_status="public",
)
```

## Resources

- Step-by-step: https://codivupload.com/how-to/auto-post-tiktok-videos
- Blog post: https://codivupload.com/blog/tiktok-api-posting
- TikTok platform page: https://codivupload.com/platforms/tiktok
- Free tools: https://codivupload.com/tools/tiktok-hashtag-generator, /tiktok-name-generator, /tiktok-username-checker, /tiktok-caption-generator
