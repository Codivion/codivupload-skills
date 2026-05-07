# CodivUpload Social Manager — OpenClaw Skill

[![ClawHub](https://img.shields.io/badge/ClawHub-codivupload--social--manager-cyan)](https://clawhub.ai/codivion/codivupload-social-manager)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Codivion/codivupload-skills/blob/main/LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-7%2B-green)]()
[![MCP](https://img.shields.io/badge/MCP-supported-violet)]()

A comprehensive social media manager skill for OpenClaw. Drop-in OpenClaw skill that turns your local AI assistant into an autonomous social media manager for **YouTube, Instagram, X (Twitter), Facebook, TikTok, Threads, Pinterest, and Bluesky** — **7+ platforms launched**, with LinkedIn, Snapchat, and Google Business Profile in active rollout.

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

Plus **TikTok, Threads, and Pinterest** all launched with the same depth. **Bluesky, LinkedIn, Snapchat, and Google Business Profile** are in active rollout — skill auto-detects new platforms via the API.

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

- **Schedule posts** to any of 11 social platforms with platform-specific overrides
- **Bulk-upload** YouTube Shorts, TikToks, Reels via the REST API
- **Run 24/7 YouTube live streams** with managed FFmpeg relay
- **Pull cross-platform analytics** for engagement, growth, best-time-to-post
- **Manage agency client profiles** with whitelabel branding
- **Use BYOP** (Bring Your Own Project) for dedicated YouTube quota
- **Use BYOK** (Bring Your Own Keys) for dedicated X rate limits

The skill prefers calling [CodivUpload's MCP server](https://www.npmjs.com/package/codivupload-mcp) when configured, falling back to direct REST API calls otherwise.

## Installation

```bash
# Drop SKILL.md into your OpenClaw skills workspace
mkdir -p ~/.openclaw/workspace/skills/codivupload
cp SKILL.md ~/.openclaw/workspace/skills/codivupload/SKILL.md

# Optional: also install the MCP server (gives the agent direct tool access)
npm install -g codivupload-mcp
```

## Configuration

Set your CodivUpload API key in OpenClaw config:

```bash
openclaw config set CODIVUPLOAD_API_KEY=your_api_key_here
```

Get your API key from your CodivUpload dashboard → Settings → API Keys.

If you don't have an account yet, sign up at [codivupload.com](https://codivupload.com) — free plan covers 10 uploads / month with all 11 platforms.

## Usage examples

After installation, you can ask your OpenClaw agent things like:

```
"Schedule this video to post on TikTok, Instagram, and YouTube tomorrow at 9am"
"Cross-post my latest blog announcement to LinkedIn and X"
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
1. **Call MCP tools directly** if `codivupload-mcp` is registered as an MCP server
2. **Generate `curl` / SDK code** the agent can execute via OpenClaw's `exec` tool

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
- **Claude Skills version**: same repo, sibling directories ([generic](https://github.com/Codivion/codivupload-skills/tree/main/generic), [instagram](https://github.com/Codivion/codivupload-skills/tree/main/instagram), [youtube](https://github.com/Codivion/codivupload-skills/tree/main/youtube), [tiktok](https://github.com/Codivion/codivupload-skills/tree/main/tiktok), [x](https://github.com/Codivion/codivupload-skills/tree/main/x), [facebook-linkedin](https://github.com/Codivion/codivupload-skills/tree/main/facebook-linkedin), [agency](https://github.com/Codivion/codivupload-skills/tree/main/agency))

## License

MIT — fork it, adapt it, ship it.

## Support

- Docs: [docs.codivupload.com](https://docs.codivupload.com)
- Issues: [github.com/Codivion/codivupload-skills/issues](https://github.com/Codivion/codivupload-skills/issues)
- Email: support@codivupload.com
