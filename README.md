# CodivUpload AI Skills

Specialized AI skills for [CodivUpload](https://codivupload.com) — the social media platform with three first-class interfaces (visual dashboard, REST API, MCP server for AI agents) covering 7+ launched platforms (with Bluesky in active rollout).

These are Markdown-based skills following the [Anthropic Skills](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills) format. They give Claude Code, Claude Desktop, and other agentic LLMs deep context on _how to use CodivUpload effectively_ for each social media platform.

## Available skills

| Skill | Best for | Use the skill when… |
|---|---|---|
| [`codivupload`](./generic) | Generic catch-all — covers every endpoint | User mentions CodivUpload, wants to publish/schedule social media posts, or needs to call the API |
| [`codivupload-instagram`](./instagram) | Instagram Reels, carousels, feed posts | User mentions Instagram + scheduling, automation, or API |
| [`codivupload-youtube`](./youtube) | YouTube Shorts, long-form, BYOP, 24/7 live streams | User mentions YouTube + bulk upload, BYOP, channel network, or live stream |
| [`codivupload-tiktok`](./tiktok) | TikTok Direct Post, Draft, brand content disclosure | User mentions TikTok + automation, AI content disclosure, or branded content |
| [`codivupload-x`](./x) | X (Twitter) text/image/video, BYOK rate limits | User mentions X (Twitter) + thread/scheduling/BYOK |
| [`codivupload-facebook-linkedin`](./facebook-linkedin) | Facebook Pages + LinkedIn personal/Company Pages | User mentions Facebook Page or LinkedIn Company Page automation |
| [`codivupload-agency`](./agency) | Workspace management, branded invites, whitelabel | User runs an agency, manages multiple clients, or needs whitelabel |
| [`openclaw`](./openclaw) | OpenClaw local AI assistant (WhatsApp / Telegram / Discord / Slack) | User runs OpenClaw locally and wants their on-machine agent to publish/schedule via CodivUpload |

## Installer — picks the right folder for your AI client

```bash
# Interactive — asks which client you use
npx codivupload-skills

# Explicit per-client
npx codivupload-skills --client claude              # ~/.claude/skills/ (global)
npx codivupload-skills --client claude-project      # ./.claude/skills/ (project-local)
npx codivupload-skills --client antigravity         # ./.agent/skills/ (Google Antigravity, project-local)
npx codivupload-skills --client antigravity-global  # ~/.gemini/antigravity/skills/
npx codivupload-skills --client cursor              # ./.cursor/rules/ (rule files)
npx codivupload-skills --client zed                 # MCP-only setup printed
npx codivupload-skills --client chatgpt             # MCP-only setup printed

# Specific skill only
npx codivupload-skills --client antigravity --skill instagram

# Custom path
npx codivupload-skills --target /custom/path/

# List available skills
npx codivupload-skills --list

# Help
npx codivupload-skills --help
```

## Per-client install paths

| Client | Default folder | Format |
|---|---|---|
| Claude Desktop / Claude Code (global) | `~/.claude/skills/` | Anthropic Skills (folder per skill) |
| Claude Code (project-local) | `./.claude/skills/` | Anthropic Skills — commit to share with team |
| Google Antigravity (Gemini, project-local) | `./.agent/skills/` | Antigravity Kit (folder per skill, identical to Anthropic Skills) |
| Google Antigravity (global) | `~/.gemini/antigravity/skills/` | Antigravity Kit |
| Cursor IDE | `./.cursor/rules/` | Cursor rule files (single .md per skill) |
| Zed Editor | (MCP-only) | No skills folder; configure MCP server in `~/.config/zed/settings.json` |
| ChatGPT Pro | (MCP-only) | No skills folder; register MCP Connector at `chat.openai.com/connectors` |

After install, restart your AI client to load the skills. The MCP server (`codivupload-mcp`) is always required — it provides the actual tools.

## Manual install (if you prefer)

```bash
git clone https://github.com/Codivion/codivupload-skills.git
cp -r codivupload-skills/instagram ~/.claude/skills/codivupload-instagram
```

## How to use with ChatGPT / Cursor / Zed

These skills are written for the Anthropic Skills format, but the underlying integration works via [CodivUpload's MCP server](https://www.npmjs.com/package/codivupload-mcp). Configure the MCP server in your client and the skill content gives the LLM extra context on best practices.

```json
{
  "mcpServers": {
    "codivupload": {
      "command": "npx",
      "args": ["-y", "codivupload-mcp"],
      "env": {
        "CODIVUPLOAD_API_KEY": "cdv_your_api_key"
      }
    }
  }
}
```

## License

MIT — fork, modify, redistribute. Skills are documentation + prompts, not code that holds secrets.

## Distribution

These skills are published in two places:
1. This repo (canonical source) — `github.com/Codivion/codivupload-skills`
2. Anthropic Skills marketplace — when generally available

For ChatGPT users, register the [CodivUpload MCP Server](https://www.npmjs.com/package/codivupload-mcp) as a Connector at `chat.openai.com/connectors`.
