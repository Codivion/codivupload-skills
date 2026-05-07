# ChatGPT Connector Setup — CodivUpload

ChatGPT Pro and Enterprise users can register CodivUpload as a Connector to give ChatGPT social media posting tools natively. This is the modern (post-Plugin Store) way to give ChatGPT external tools — it speaks the same MCP protocol that Claude Desktop and Cursor use.

## Quick install (recommended)

If you already have the [CodivUpload MCP Server](https://www.npmjs.com/package/codivupload-mcp) running locally:

```bash
npx codivupload-mcp
```

Then in ChatGPT:

1. Open **chat.openai.com** → Settings → **Connectors**
2. Click **+ Add Connector**
3. Choose **MCP Server**
4. Enter the local server URL (default: `http://localhost:8765`) OR paste the configuration below

## Configuration JSON

```json
{
  "name": "CodivUpload",
  "description": "Social media publishing across 11 platforms — schedule, cross-post, analyze",
  "type": "mcp",
  "command": "npx",
  "args": ["-y", "codivupload-mcp"],
  "env": {
    "CODIVUPLOAD_API_KEY": "cdv_your_api_key_here"
  }
}
```

Replace `cdv_your_api_key_here` with your actual key from [Dashboard → API Keys](https://app.codivupload.com).

## What ChatGPT can do once connected

After enabling, ChatGPT has access to ~30 tools:

| Tool | Description |
|---|---|
| `create_post` | Publish or schedule a post to 1-11 platforms with platform-specific overrides |
| `get_post` | Check status of a scheduled or published post |
| `list_posts` | Paginated list with status/profile filters |
| `update_post` | Edit a scheduled or draft post before publishing |
| `delete_post` | Remove a scheduled or draft post |
| `retry_failed` | Re-queue only failed destinations from a partially_failed post |
| `upload_media` | URL-to-CDN upload, returns CDN URL for use in `media_urls` |
| `list_profiles` | Show connected social media profiles in the workspace |
| `create_profile` | (Agency tier) Create a new profile/tenant |
| `get_analytics` | Engagement, reach, growth across platforms |
| `get_best_times` | Best posting time recommendations from 90-day history |
| `generate_caption` | AI caption generator (4 modes, 10 languages) |
| `create_youtube_broadcast` | Set up 24/7 RTMP live stream |

The full tool list is auto-generated from the [OpenAPI spec](https://api.codivupload.com/public-openapi.json) and grows as new endpoints ship.

## Example prompts ChatGPT can answer

- "Schedule this video on TikTok and Instagram for tomorrow at 10am ET, with caption 'Quick productivity tip'."
- "Create a post for our Buffer announcement targeting LinkedIn (Company Page 123456) and X."
- "Show me which client's posts had the highest engagement last week."
- "Re-queue the failed destinations from post abc123."
- "Set up a 24/7 lo-fi music live stream using https://my-cdn.com/lofi-loop.m3u8."

## Custom GPT alternative (legacy)

If you don't have ChatGPT Pro / Enterprise, you can build a Custom GPT instead:

1. Visit [chat.openai.com/gpts/editor](https://chat.openai.com/gpts/editor)
2. **Configure** tab:
   - **Name:** CodivUpload Social Media Manager
   - **Description:** Schedule and publish to 11 social platforms via CodivUpload
   - **Instructions:** Copy the [generic SKILL.md](./generic/SKILL.md) content here
3. **Actions** tab → **Create new action**
4. Paste the OpenAPI URL: `https://api.codivupload.com/public-openapi.json`
5. **Authentication** → API Key → Bearer Token → paste your `cdv_*` key
6. Save → Publish to your account or to the public GPT Store

Custom GPTs have ~20 free uses/day for non-paying users; for unlimited use, upgrade to ChatGPT Plus or higher.

## Per-platform Custom GPTs (advanced)

For specialized workflows, create per-platform Custom GPTs:
- "CodivUpload Instagram Specialist" — uses [`instagram/SKILL.md`](./instagram/SKILL.md) as instructions
- "CodivUpload YouTube BYOP Helper" — uses [`youtube/SKILL.md`](./youtube/SKILL.md)
- "CodivUpload Agency Workspace Assistant" — uses [`agency/SKILL.md`](./agency/SKILL.md)

Each one's Actions tab points at the same OpenAPI; the difference is the instructions file (which gives ChatGPT focused context for that platform's quirks).

## Troubleshooting

- **Connector status: red / unauthorized** — Verify `CODIVUPLOAD_API_KEY` is set in env. Test directly: `curl -H "Authorization: Bearer $CODIVUPLOAD_API_KEY" https://api.codivupload.com/v1/posts`
- **Tools not appearing in chat** — Restart the chat. Connectors are loaded on chat init.
- **Custom GPT action 401** — API key wasn't saved as Bearer token. Re-add in Authentication tab and re-save.
- **MCP server connection failed** — Ensure `npx codivupload-mcp` is running locally and reachable from ChatGPT (use ngrok or Cloudflare Tunnel for remote testing).

## Distribution

CodivUpload's MCP server is published as `codivupload-mcp` on npm. The skills (markdown files in this repo) provide platform-specific context that gives ChatGPT/Claude better intuition about how to use the tools effectively.

When the OpenAPI spec changes:
- The MCP server automatically reflects new endpoints (it reads the spec at startup)
- Skill markdown files may need a manual pass to add platform-specific guidance (Layer 10 of the project's [13-layer consistency checklist](https://codivupload.com))
