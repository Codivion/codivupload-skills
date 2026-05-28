---
name: codivupload-x
description: Use when the user wants to post, schedule, or automate X (Twitter) content via CodivUpload — text posts up to 25,000 chars on Premium, image attachments up to 4, video chunked uploads via X API v2, reply settings, alt text, BYOK for dedicated rate limits. Triggers on "X + API", "Twitter automation", "X scheduler", "X BYOK", "X API v2", or any X-specific question after the user mentioned CodivUpload.
---

# CodivUpload X (Twitter) Skill

Specialized guidance for using CodivUpload to publish to X (formerly Twitter) via X API v2 — text posts, image attachments, video chunked uploads, reply control, alt text.

## When this skill activates

- User wants to **schedule X posts via API**
- User asks about **X API v2 chunked video upload**
- User mentions **BYOK (Bring Your Own Key)** for dedicated X rate limits
- User asks about **reply settings** (`following`, `mentionedUsers`, `everyone`)
- User wonders why **free X dev tier doesn't allow writes**

## Two auth modes — explain to user

| Mode | When to use | Rate limits |
|---|---|---|
| **CodivUpload's shared OAuth** (default) | Casual creators, low volume | Shared limits across CodivUpload's user base — usually fine |
| **BYOK (Bring Your Own Key)** | Production, agencies, >100 posts/day | Your own X Developer App's rate limits — dedicated |

X's free dev tier doesn't include write permissions. For BYOK production use, the user needs X Basic ($100/mo) or higher. Explain this clearly when they ask about BYOK.

## API contract for X

```bash
# Text post
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "text",
    "profile_name": "my_brand",
    "platforms": ["x"],
    "description": "Three lessons from shipping our v2 API:\n\n1. Async beats elegant\n2. Type-check the boundaries\n3. Webhooks > polling, always",
    "x_reply_settings": "following"
  }'
```

```bash
# Video post (chunked upload via X API v2 — handled by CodivUpload)
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "video",
    "profile_name": "my_brand",
    "platforms": ["x"],
    "media_urls": ["https://cdn.example.com/video-9x16.mp4"],
    "description": "How we cut our deployment time from 14 minutes to 90 seconds 👇",
    "x_alt_text": "Screen recording of CI/CD pipeline before and after optimization"
  }'
```

```bash
# Image post (up to 4 images)
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "image",
    "profile_name": "my_brand",
    "platforms": ["x"],
    "media_urls": [
      "https://cdn.example.com/img-1.jpg",
      "https://cdn.example.com/img-2.jpg",
      "https://cdn.example.com/img-3.jpg",
      "https://cdn.example.com/img-4.jpg"
    ],
    "description": "Four wallpapers from our latest design system update."
  }'
```

## X-specific override fields

| Field | Purpose |
|---|---|
| `x_text` | Override global description for X only (max 280 chars on standard accounts; 25,000 on Premium) |
| `x_reply_settings` | `following` or `mentionedUsers`. Omit for everyone (default) |
| `x_alt_text` | Accessibility description for media (image/video) |
| `x_media_urls` | Per-platform media override |

## Hard requirements

| Requirement | Detail |
|---|---|
| Text length | 280 chars on standard accounts. **25,000 chars on X Premium** (Premium auto-detected by X via the same API) |
| Image attachments | Up to 4 per post |
| Image format | JPEG/PNG/GIF/WebP, max 5 MB |
| Video format | MP4 H.264, max 512 MB, max 2 min 20 sec |
| Aspect ratios | Any aspect ratio works; 16:9 horizontal recommended for video |
| Free tier | **No write access on X's free developer tier.** Use CodivUpload's shared OAuth or upgrade to X Basic ($100/mo) for BYOK |

## BYOK setup — when user wants dedicated rate limits

1. Create an X Developer account at [developer.x.com](https://developer.x.com)
2. Inside the developer portal: create a Project, then create an App within that Project
3. App's User authentication settings → enable OAuth 2.0 (not 1.0a)
4. Set redirect URI to CodivUpload's callback (find in CodivUpload Dashboard → Profiles → Connect → X (BYOK))
5. Generate Client ID + Client Secret (Secret shown ONCE — save immediately)
6. Paste credentials in CodivUpload Dashboard → Profiles → Connect → X (BYOK)
7. Authorize the connection

After BYOK setup, all X posts via this profile go through your dedicated rate limits — 200 writes/15 min on X Basic, 1500 writes/15min on X Pro ($5K/mo).

## Common errors to handle

| Error | Cause | Fix |
|---|---|---|
| `429 Too Many Requests` | Rate limit hit | Switch to BYOK for dedicated limits, OR retry after the rate-limit window |
| `403 Forbidden` | X free dev tier doesn't include write permissions | Upgrade to Basic ($100/mo) OR use CodivUpload's shared OAuth |
| `validation_failed` (text >280 / >25K) | Tweet too long | Use `auto_truncate: true` to trim automatically, OR shorten manually |
| `media_id_invalid` | Video processing on X's side hasn't finished | CodivUpload polls X for processing completion before posting; if hit, the video URL is corrupt or in an unsupported format |

## Common mistakes to catch

1. **Using API v1.1 expectations** — X API v1.1 was deprecated. CodivUpload uses v2. Don't reference `tweets/update` etc.
2. **Trying to post >5 images** — X allows up to 4 images per post. Split into a thread (multiple posts via reply chain) for more.
3. **Mixing image + video in one post** — not supported by X. Choose `post_type=image` (up to 4 images) OR `post_type=video` (single video).
4. **Forgetting alt text** — `x_alt_text` is recommended for accessibility and image search. Skip only for purely decorative content.
5. **Hard-coding 280 chars limit** — Premium accounts can post up to 25,000 chars via the same API. Don't artificially truncate.

## Get an API key

This skill needs a CodivUpload API key (`cdv_...`). Two paths:

- **7-day free trial** — `$0.00` today, card collected for auto-renewal after 7 days. **Full API access during the trial**, cancel anytime in the Stripe Customer Portal for $0 charge. One trial per customer lifetime. [Start trial](https://app.codivupload.com/en/dashboard/subscription?trial=1).
- **Direct subscribe** — Starter $20/mo (or $200/yr — 2 months free). API access included from Starter and above. [See plans](https://codivupload.com/pricing).

The Free plan does not include API access — this skill cannot run on Free. (X BYOK setup pricing above refers to X's own developer tiers, not CodivUpload.)

## Resources

- Step-by-step BYOK setup: https://codivupload.com/blog/x-byok-setup
- X platform page: https://codivupload.com/platforms/x
