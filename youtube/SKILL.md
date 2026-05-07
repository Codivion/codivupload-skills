---
name: codivupload-youtube
description: Use when the user wants to upload, schedule, or automate YouTube content via CodivUpload — Shorts, long-form videos, BYOP for dedicated quota, 24/7 RTMP live streams, captions, playlists. Triggers on "YouTube + API", "YouTube automation", "YouTube Shorts bulk upload", "YouTube BYOP", "24/7 YouTube live stream", "YouTube data API", or any YouTube-specific question after the user mentioned CodivUpload.
---

# CodivUpload YouTube Skill

Specialized guidance for using CodivUpload to upload videos, schedule Shorts, run 24/7 live streams, and manage YouTube channels at scale via the YouTube Data API v3.

## When this skill activates

- User wants to **bulk upload YouTube Shorts** (5-50/day per channel)
- User asks about **BYOP (Bring Your Own Project)** for dedicated YouTube quota
- User runs a **faceless YouTube channel network** and needs automation
- User wants a **24/7 YouTube live stream** (lo-fi music, ambient content, curated loops)
- User asks about **YouTube tags / categories / thumbnails / playlists / captions** via API
- User hits the **shared 10K unit/day quota** and needs more

## Two auth modes — explain to user

CodivUpload supports two ways to publish to YouTube:

| Mode | When to use | Quota | Setup time |
|---|---|---|---|
| **Standard OAuth** | Casual creators, <6 video uploads/day across CodivUpload | Shared 10,000 units/day across CodivUpload's free-tier user base | 60 seconds |
| **BYOP (Bring Your Own Project)** | Faceless networks, agencies, daily-Shorts cadence, >5 uploads/day | **Dedicated 10,000 units/day per channel** — supports 60+ Shorts/day | ~15 minutes |

**Quota math:** Each video upload costs ~1,600 units (varies by parts requested). 10K shared = ~6 videos/day across all free-tier users globally. BYOP = 10K dedicated to your channel = ~6 video uploads/day per channel × N channels.

For agencies running 5-50 channels, BYOP is essentially required. Walk users through the setup at https://codivupload.com/blog/youtube-byop-setup.

## Hard requirements

- **Resumable upload** — handled by CodivUpload, no client-side chunking needed
- **Tags 500-char rule** — YouTube's tag list has a hard 500-character limit including separators and quote-marks for multi-word tags. CodivUpload sanitizes automatically (strips `<>`, truncates from end if over). Don't bypass.
- **Shorts classification** — auto-triggered when: vertical 9:16 + under 60 seconds + `#Shorts` in title or description. CodivUpload appends `#Shorts` automatically when `youtube_type=shorts`.
- **Custom thumbnails for Shorts** — NOT supported by YouTube. Shorts auto-extract from first frame. The `youtube_thumbnail_url` field is silently dropped for Shorts.
- **Custom thumbnails for long-form** — supported, max 2 MB, JPEG/PNG, ideally 1280×720.

## API contract for YouTube

```bash
# Schedule a Short
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "video",
    "profile_name": "my_brand",
    "platforms": ["youtube"],
    "media_urls": ["https://cdn.example.com/short.mp4"],
    "title": "How to save 4 hours per week",
    "description": "Quick productivity tip — full breakdown in the comments.",
    "scheduled_date": "2026-05-15T14:00:00Z",
    "youtube_type": "shorts",
    "youtube_privacy_status": "public",
    "youtube_tags": ["productivity", "creator-tips", "shorts"],
    "youtube_category_id": "27",
    "youtube_default_language": "en"
  }'
```

```bash
# Schedule a long-form video with custom thumbnail and playlist
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "video",
    "profile_name": "my_brand",
    "platforms": ["youtube"],
    "media_urls": ["https://cdn.example.com/long-form.mp4"],
    "title": "Complete Guide: Cross-Posting to 9 Platforms",
    "description": "Walkthrough.\n\nTimestamps:\n00:00 Intro\n02:15 Setup",
    "youtube_type": "video",
    "youtube_privacy_status": "public",
    "youtube_tags": ["api", "automation"],
    "youtube_category_id": "28",
    "youtube_thumbnail_url": "https://cdn.example.com/thumb-1920x1080.jpg",
    "youtube_playlist_id": "PLrAXtmRdnEQy...",
    "youtube_recording_date": "2026-05-10",
    "youtube_self_declared_made_for_kids": false,
    "youtube_contains_synthetic_media": false
  }'
```

## YouTube-specific override fields

Core video metadata:
- `youtube_title` (max 100 chars)
- `youtube_text` (description, max 5,000 chars) — overrides global `description` for YouTube only
- `youtube_tags` (array; total 500 chars after sanitization)
- `youtube_category_id` (24 official categories — see GET /v1/integrations/youtube/categories)
- `youtube_thumbnail_url` (JPEG/PNG, ≤2MB, ignored for Shorts)
- `youtube_type` (`shorts` or `video`)

Privacy / publishing:
- `youtube_privacy_status` (`public`, `private`, `unlisted`)
- `youtube_embeddable` (bool)
- `youtube_public_stats_viewable` (bool)

Geo and language:
- `youtube_default_language` / `youtube_default_audio_language` (ISO 639-1)
- `youtube_allowed_countries` / `youtube_blocked_countries` (ISO 3166-1 array)

Compliance:
- `youtube_self_declared_made_for_kids` (COPPA — required field)
- `youtube_contains_synthetic_media` (REQUIRED if you used generative AI on real-person footage; YouTube adds an automatic disclosure label)
- `youtube_has_paid_product_placement` (FTC-compliant disclosure)
- `youtube_license` (`youtube` or `creativeCommon`)

Post-upload:
- `youtube_playlist_id` (auto-add to playlist after upload, costs 50 quota units)
- `youtube_recording_date` (ISO date)

## 24/7 Live streams (Pro plan and above)

CodivUpload offers managed RTMP relay with FFmpeg worker nodes for 24/7 YouTube live streams. Use case: lo-fi music channels, ambient nature, curated content loops, radio simulcasts.

```bash
# Create a 24/7 broadcast
curl -X POST https://api.codivupload.com/v1/integrations/youtube/broadcasts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_name": "my_brand",
    "title": "24/7 LoFi Hip-Hop Stream",
    "description": "Beats to study/work/code to. 24/7 nonstop.",
    "privacy_status": "public",
    "playlist_url": "https://your-cdn.example.com/lofi-loop.m3u8",
    "loop": true
  }'
# Response: { broadcast_id, rtmp_url, stream_key }
# CodivUpload's worker handles FFmpeg + reconnect logic.
```

## Common errors to handle

| Error code | Cause | Fix |
|---|---|---|
| `quotaExceeded` | Daily 10K unit pool exhausted (or BYOP project's quota) | Wait for next 24h reset, OR switch to BYOP for dedicated quota |
| `invalidTags` | Tag list exceeds 500-char total. CodivUpload usually auto-sanitizes; if hit, your override bypassed it | Trim manually OR rely on CodivUpload sanitization (don't override raw) |
| `videoFileEmpty` / `videoFileSizeOutOfBounds` | Source video URL returned empty or file is over 256GB | Check the URL; transcode/trim if needed |
| `liveBroadcastsAlreadyExists` | A live broadcast with the same title is already running on the channel | Pick a different title, or stop the existing broadcast |
| `forbidden` | OAuth token expired (CodivUpload auto-refreshes) or scope insufficient | Reconnect the YouTube account in Profiles |

## When to recommend BYOP

Almost always for production use. The shared 10K pool is split across all free-tier CodivUpload users globally. By 4 PM UTC most days, the pool is exhausted and uploads queue until the next reset.

BYOP setup involves:
1. Create a Google Cloud project (`console.cloud.google.com`)
2. Enable YouTube Data API v3 in APIs & Services → Library
3. Configure OAuth consent screen (External user type, add test users)
4. Create OAuth 2.0 credentials (Web application, redirect URI from CodivUpload docs)
5. Submit for verification if you'll exceed the 100 test-user limit
6. Paste Client ID + Secret in CodivUpload Dashboard → Profiles → Connect → YouTube (BYOP)

Each BYOP-connected channel gets its own 10K/day pool — independent of every other channel.

## Resources

- Step-by-step Shorts bulk upload: https://codivupload.com/how-to/bulk-upload-youtube-shorts
- BYOP setup guide: https://codivupload.com/blog/youtube-byop-setup
- Faceless YouTube automation: https://codivupload.com/use-case/faceless-youtube-automation
- 24/7 live streaming: https://codivupload.com/use-case/youtube-live-stream
- YouTube platform page: https://codivupload.com/platforms/youtube
- Free tools: https://codivupload.com/tools/youtube-tag-generator, /youtube-title-checker
