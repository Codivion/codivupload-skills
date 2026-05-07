---
name: codivupload-facebook-linkedin
description: Use when the user wants to post or schedule to Facebook Pages or LinkedIn (personal profiles + Company Pages) via CodivUpload. Triggers on "Facebook Page automation", "Facebook Reels API", "LinkedIn API", "LinkedIn Company Page", "LinkedIn personal vs company", or any FB/LinkedIn-specific question after the user mentioned CodivUpload.
---

# CodivUpload Facebook + LinkedIn Skill

Specialized guidance for the two B2B-leaning platforms — Facebook Pages and LinkedIn personal/Company. Both use Meta-style permission models with their own quirks.

## When this skill activates

- User wants to **automate Facebook Page posts** (text, image, video, Reels)
- User wants to **schedule to LinkedIn personal profile** OR **Company Page**
- User asks about **`linkedin_page_id`** for Organization shares
- User wants **multi-platform B2B announcements** (FB + LinkedIn + X simultaneously)

---

## Facebook — hard rules

| Rule | Detail |
|---|---|
| Personal profiles | **NOT supported by Meta's API.** Must connect a Facebook Page |
| Page admin role | User needs admin or content-creator role on the Page they connect |
| Reels via API | Vertical 9:16, max 90 sec — same constraints as Instagram Reels |
| Text post format | Up to 63,206 chars (effectively unlimited), but engagement drops sharply over ~500 chars |

### Facebook API contract

```bash
# Page post with image
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "image",
    "profile_name": "my_brand",
    "platforms": ["facebook"],
    "media_urls": ["https://cdn.example.com/announcement.jpg"],
    "description": "We just shipped a new feature — read the full announcement on our blog.",
    "scheduled_date": "2026-05-13T10:00:00Z"
  }'
```

```bash
# Facebook Reel
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "video",
    "profile_name": "my_brand",
    "platforms": ["facebook"],
    "media_urls": ["https://cdn.example.com/reel.mp4"],
    "description": "Behind the scenes from our team retreat.",
    "facebook_media_type": "reel"
  }'
```

### Facebook-specific override fields

- `facebook_text` — overrides global description for FB only (max 63,206 chars)
- `facebook_media_type` — `photo`, `video`, `reel`, `link`
- `facebook_media_urls` — per-platform media override

### Facebook common errors

| Error | Cause | Fix |
|---|---|---|
| `personal_profile_unsupported` | Connected account is a personal profile | Connect a Page instead — Personal profiles are not supported by Meta API |
| `page_admin_required` | User lost admin role on the Page | Re-grant role in FB Page settings |
| `unsupported_post_type` | Trying to post a Reel with non-vertical video | Crop source to 9:16 portrait |
| `link_attachment_invalid` | Link URL doesn't have OG tags | Set OG title/description/image on destination page |

---

## LinkedIn — hard rules

LinkedIn has TWO distinct posting endpoints:

| Endpoint | When | How CodivUpload routes |
|---|---|---|
| UGC Posts (personal profile) | `linkedin_page_id` is omitted | Default — uses the connected user's personal profile |
| Organization Shares (Company Page) | `linkedin_page_id` is set to a numeric Org ID | CodivUpload routes to org endpoint automatically |

CodivUpload abstracts both behind a single `platforms: ["linkedin"]` entry. The presence of `linkedin_page_id` flips the routing.

### Where to find the Company Page ID

LinkedIn's Org IDs are numeric. Find yours in the Company Page admin URL: `linkedin.com/company/123456789` → page ID is `123456789`.

### LinkedIn API contract

```bash
# Post to personal profile
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "text",
    "profile_name": "my_brand",
    "platforms": ["linkedin"],
    "description": "Three lessons from shipping our v2 API:\n\n1. Async beats elegant.\n2. Type-check the boundaries.\n3. Webhooks > polling, always.",
    "linkedin_visibility": "PUBLIC"
  }'
```

```bash
# Post to Company Page
curl -X POST https://api.codivupload.com/v1/posts \
  -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "image",
    "profile_name": "my_brand",
    "platforms": ["linkedin"],
    "media_urls": ["https://cdn.example.com/launch-banner.jpg"],
    "description": "Today we shipped CodivUpload v2.",
    "linkedin_visibility": "PUBLIC",
    "linkedin_page_id": "123456789"
  }'
```

### LinkedIn-specific override fields

- `linkedin_text` — overrides global description for LI only (max 3,000 chars)
- `linkedin_visibility` — `PUBLIC` or `CONNECTIONS`
- `linkedin_page_id` — Organization URN's numeric ID (omit for personal profile)

### LinkedIn supported post types

- `post_type=text` — text-only post
- `post_type=image` — single image OR multi-image carousel (up to 9 on personal, tiled differently on Company Pages)
- `post_type=video` — single MP4, max 5 GB, max 10 minutes
- `post_type=document` — PDF carousels (up to 300 pages)

GIFs are NOT supported by LinkedIn's API — convert to MP4.

### LinkedIn rate limits

100 calls/user/day for personal UGC posts. Separate 100/day per Organization for Company Page shares. CodivUpload tracks usage per profile and surfaces remaining quota in Dashboard.

### LinkedIn common errors

| Error | Cause | Fix |
|---|---|---|
| Company Page missing from `linkedin_page_id` options | User isn't admin/content-admin on the Page | Verify role in LinkedIn → Page → Admin tools, then disconnect+reconnect LinkedIn in CodivUpload to refresh available Pages |
| 429 rate limit | 100/day cap hit | Wait for next day's reset (UTC midnight) |
| Comments not disable-able via API | LinkedIn doesn't expose this | Moderate post-publish from LinkedIn UI |

---

## Cross-post recipe — B2B announcement to FB + LinkedIn + X

```python
client.posts.create(
    post_type="image",
    profile_name="my_brand",
    platforms=["facebook", "linkedin", "x"],
    media_urls=["https://cdn.example.com/announcement.jpg"],
    description="Today we shipped CodivUpload v2 — three first-class interfaces in one product.",
    linkedin_visibility="PUBLIC",
    linkedin_page_id="123456789",  # post to Company Page
    x_reply_settings="following",
)
```

## Resources

- Step-by-step LinkedIn: https://codivupload.com/how-to/post-to-linkedin-api
- Facebook platform page: https://codivupload.com/platforms/facebook
- LinkedIn platform page: https://codivupload.com/platforms/linkedin
