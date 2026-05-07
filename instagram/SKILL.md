---
name: codivupload-instagram
description: Use when the user wants to schedule, automate, or programmatically publish Instagram content via CodivUpload — Reels, carousels, feed posts, alt text, geotagging, collaborator invites. Triggers on "Instagram + API", "Instagram automation", "Instagram Reels via API", "Instagram scheduler", "Instagram bulk upload", or any Instagram-specific question after the user mentioned CodivUpload.
---

# CodivUpload Instagram Skill

Specialized guidance for using CodivUpload to publish to Instagram Business and Creator accounts via Meta's Graph API. CodivUpload's app is approved — no Meta app review required from the user.

## When this skill activates

- User asks how to **schedule Instagram posts** via CodivUpload
- User wants to **automate Instagram Reels / carousels / feed posts**
- User asks about **Instagram cover frames** for Reels (`instagram_cover_url`)
- User asks about **collaborator invites**, **geotagging**, **alt text**
- User wonders why their **Personal Instagram account doesn't work** (it's a Meta API limitation)

## Hard requirements (read first)

Meta Graph API constraints — these are not CodivUpload limits, they're Meta's:

| Requirement | Detail |
|---|---|
| Account type | **Business or Creator only.** Personal accounts cannot post via API. Tell user to convert in IG mobile app: Settings → Account → Switch account type |
| FB Page link | Instagram account **must be linked to a Facebook Page** (Meta requirement, not optional) |
| Stories | **Cannot be scheduled via API.** Only Reels, carousels, and feed posts are programmable. Tell user Stories must be posted live from the IG mobile app |
| Reel max duration via API | **90 seconds.** UI allows 3 minutes; API path is shorter for content-safety reasons |
| Carousel children | **Same aspect ratio for every item.** Mixed ratios get rejected with `media_type_required` |
| Image format | JPEG or PNG, max 8 MB |
| Video format | MP4 H.264 + AAC, max 100 MB |
| Rate limit | 200 calls/hour per Page (Meta cap; CodivUpload auto-defers if hit) |

## API contract for Instagram

Always use `profile_name` (CodivUpload profile display name) + `platforms: ["instagram"]`. Never `social_account_id` — that doesn't exist.

### Reel (vertical 9:16 video)

```bash
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "video",
    "profile_name": "my_brand",
    "platforms": ["instagram"],
    "media_urls": ["https://your-cdn.example.com/reel.mp4"],
    "description": "New product drop — link in bio. ✨ #productivity",
    "scheduled_date": "2026-05-12T15:00:00Z",
    "instagram_share_to_feed": true,
    "instagram_cover_url": "https://your-cdn.example.com/cover-1080x1920.jpg",
    "instagram_alt_text": "Person typing on laptop with productivity tool dashboard visible"
  }'
```

### Carousel (multi-image, up to 10)

```bash
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "image",
    "profile_name": "my_brand",
    "platforms": ["instagram"],
    "media_urls": [
      "https://cdn.example.com/slide-1.jpg",
      "https://cdn.example.com/slide-2.jpg",
      "https://cdn.example.com/slide-3.jpg"
    ],
    "description": "5 productivity hacks I learned the hard way 👇",
    "instagram_alt_text": "5 numbered tips for productivity, white text on dark background"
  }'
```

### Feed video (single video, not Reel)

Same as Reel but without `instagram_share_to_feed=true`. Note: most Instagram automation today uses Reels — feed videos are deprecated UX.

## Instagram-specific override fields

| Field | Type | Purpose |
|---|---|---|
| `instagram_share_to_feed` | bool | When true, a Reel also lands on the main feed grid |
| `instagram_cover_url` | string | Custom Reel cover frame (1080×1920 portrait recommended) |
| `instagram_alt_text` | string | Accessibility text for screen readers and image search |
| `instagram_collaborators` | array of usernames | Invite up to 3 collaborators on a post |
| `instagram_location_id` | string | Geotag the post (use Meta's location search to find IDs) |
| `instagram_media_type` | enum | Override: `photo`, `video`, `carousel` |
| `instagram_media_urls` | array | Per-platform media override — use different aspect ratio for IG vs other platforms |

## Common mistakes to catch

1. **Setting `instagram_thumbnail_url`** — that field does not exist. The correct name is `instagram_cover_url`.
2. **Mixed aspect ratios in carousel** — Meta rejects with `media_type_required`. Crop all carousel images to the same ratio (4:5 portrait is the safest universal).
3. **Using a Personal account** — convert to Business/Creator first. CodivUpload returns `400 business_account_required` from the underlying Meta error.
4. **Trying to schedule a Story** — not supported by Meta's API. Stories must be posted live from the mobile app.
5. **Reel longer than 90 seconds** — API path caps at 90 sec. Trim with FFmpeg or use the longer-form upload via mobile app.

## Cross-post recipe — same Reel to Instagram + TikTok + YouTube Shorts

Vertical 9:16 video under 60 seconds works on all three platforms. Single API call:

```python
client.posts.create(
    post_type="video",
    profile_name="my_brand",
    platforms=["instagram", "tiktok", "youtube"],
    media_urls=["https://cdn.example.com/reel.mp4"],
    description="Save 4 hours per week with this workflow.",
    instagram_share_to_feed=True,
    instagram_cover_url="https://cdn.example.com/cover.jpg",
    tiktok_privacy_level="PUBLIC_TO_EVERYONE",
    tiktok_disable_comment=False,
    youtube_type="shorts",
    youtube_privacy_status="public",
    youtube_tags=["productivity", "creators"],
)
```

## Resources

- Step-by-step: https://codivupload.com/how-to/schedule-instagram-posts-api
- Instagram platform page: https://codivupload.com/platforms/instagram
- Free tools: https://codivupload.com/tools/instagram-handle-checker, /instagram-caption-generator
