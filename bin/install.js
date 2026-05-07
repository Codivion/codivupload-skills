#!/usr/bin/env node
/* eslint-disable */

/**
 * codivupload-skills — CLI installer
 *
 * Installs CodivUpload AI skills into the right folder for your AI client.
 * Each client uses a different convention; this CLI knows them all.
 *
 * Usage:
 *   npx codivupload-skills                          # interactive — asks which client
 *   npx codivupload-skills --client claude          # ~/.claude/skills/
 *   npx codivupload-skills --client antigravity     # ./.agent/skills/ (project-local Gemini)
 *   npx codivupload-skills --client cursor          # ./.cursor/rules/ as .md files
 *   npx codivupload-skills --client claude-project  # ./.claude/skills/ (project-local Claude)
 *   npx codivupload-skills --target ./custom/path/  # any custom path
 *   npx codivupload-skills --skill instagram        # only one skill (use with --client or --target)
 *   npx codivupload-skills --list                   # list available skills
 *   npx codivupload-skills --help                   # show help
 *
 * Skill files use Anthropic Skills format (frontmatter + markdown body).
 * Antigravity Kit, Claude Skills, and Cursor rules all consume the same
 * format, just stored in different folders.
 *
 * For Zed and ChatGPT, this installer prints MCP setup instructions
 * instead of writing files (they don't have a "skills folder" concept).
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

const SKILLS_DIR = path.resolve(__dirname, "..");
const AVAILABLE_SKILLS = [
  "generic",
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "facebook-linkedin",
  "agency",
];

// Per-client install conventions
const CLIENTS = {
  claude: {
    label: "Claude Desktop / Claude Code (global)",
    target: () => path.join(os.homedir(), ".claude", "skills"),
    type: "skills-folder",
    note: "Restart Claude Desktop to load. Each skill is loaded by directory name.",
  },
  "claude-project": {
    label: "Claude Code (project-local)",
    target: () => path.join(process.cwd(), ".claude", "skills"),
    type: "skills-folder",
    note: "Skills load when Claude Code opens this project. Commit .claude/skills/ to share with your team.",
  },
  antigravity: {
    label: "Google Antigravity (Gemini, project-local)",
    target: () => path.join(process.cwd(), ".agent", "skills"),
    type: "skills-folder",
    note: "Antigravity Kit reads .agent/skills/ on workspace open. Format is identical to Anthropic Skills.",
  },
  "antigravity-global": {
    label: "Google Antigravity (Gemini, global config)",
    target: () => path.join(os.homedir(), ".gemini", "antigravity", "skills"),
    type: "skills-folder",
    note: "Available across every Antigravity workspace. Restart Antigravity to load.",
  },
  cursor: {
    label: "Cursor IDE (project-local rules)",
    target: () => path.join(process.cwd(), ".cursor", "rules"),
    type: "cursor-rules",
    note: "Cursor reads .cursor/rules/*.md as conditional context. Skills become rule files.",
  },
  zed: {
    label: "Zed Editor",
    target: null,
    type: "mcp-only",
    note: "Zed doesn't have a skills-folder convention. Use MCP server (codivupload-mcp) — see install message.",
  },
  chatgpt: {
    label: "ChatGPT Pro / Custom GPT",
    target: null,
    type: "mcp-only",
    note: "ChatGPT uses Custom GPT instructions or MCP Connectors — see install message.",
  },
};

const args = process.argv.slice(2);
const flags = {
  list: args.includes("--list"),
  help: args.includes("--help") || args.includes("-h"),
  skill: extract("--skill"),
  target: extract("--target"),
  client: extract("--client"),
  yes: args.includes("--yes") || args.includes("-y"),
  all: args.includes("--all"),
};

function extract(flag) {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] || null;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function installSkillFolder(slug, targetRoot) {
  const src = path.join(SKILLS_DIR, slug);
  if (!fs.existsSync(src)) {
    console.error(`✗ Skill "${slug}" not found at ${src}`);
    return false;
  }
  const dest = path.join(targetRoot, `codivupload-${slug}`);
  copyDir(src, dest);
  console.log(`  ✓ codivupload-${slug} → ${dest}`);
  return true;
}

function installCursorRule(slug, targetRoot) {
  const src = path.join(SKILLS_DIR, slug, "SKILL.md");
  if (!fs.existsSync(src)) {
    console.error(`✗ Skill "${slug}" not found`);
    return false;
  }
  const dest = path.join(targetRoot, `codivupload-${slug}.md`);
  fs.mkdirSync(targetRoot, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`  ✓ codivupload-${slug}.md → ${dest}`);
  return true;
}

function showHelp() {
  console.log(`
codivupload-skills — install AI skills for any AI client

Usage:
  npx codivupload-skills                       Interactive — asks which client
  npx codivupload-skills --client <client>     Install for a known client
  npx codivupload-skills --target <dir>        Install to a custom path
  npx codivupload-skills --skill <slug>        Install a specific skill (with --client or --target)
  npx codivupload-skills --list                List available skills
  npx codivupload-skills --help                Show this help

Supported --client values:
  claude              ~/.claude/skills/                    Claude Desktop / Claude Code (global)
  claude-project      ./.claude/skills/                    Claude Code (project-local, commit to share)
  antigravity         ./.agent/skills/                     Google Antigravity / Gemini (project-local)
  antigravity-global  ~/.gemini/antigravity/skills/        Google Antigravity / Gemini (global)
  cursor              ./.cursor/rules/                     Cursor IDE (rule files)
  zed                 (MCP-only, no skills folder)         Zed Editor
  chatgpt             (MCP-only, no skills folder)         ChatGPT Pro

Available skills (--skill): ${AVAILABLE_SKILLS.join(", ")}

Examples:
  npx codivupload-skills --client antigravity
  npx codivupload-skills --client claude --skill instagram
  npx codivupload-skills --client cursor
  npx codivupload-skills --target ~/.gemini/antigravity/skills/

After install, restart your AI client. Skills also need the MCP server
configured separately — see https://codivupload.com/use-case/ai-skills

Docs: https://codivupload.com/use-case/ai-skills
`);
}

function listSkills() {
  console.log("\nAvailable CodivUpload AI skills:\n");
  for (const slug of AVAILABLE_SKILLS) {
    const skillFile = path.join(SKILLS_DIR, slug, "SKILL.md");
    let title = `codivupload-${slug}`;
    try {
      const content = fs.readFileSync(skillFile, "utf-8");
      const m = content.match(/^name:\s*(.+)$/m);
      if (m) title = m[1].trim();
    } catch (e) {}
    console.log(`  ${title}`);
    console.log(`    --skill ${slug}`);
  }
  console.log("");
}

function showMcpOnlyMessage(clientKey) {
  const client = CLIENTS[clientKey];
  console.log(`
${client.label} — MCP-only setup
${"=".repeat(60)}

This client doesn't load .md skill files from a folder. Configure the
MCP server instead — it gives the LLM all the same tools.
`);

  if (clientKey === "zed") {
    console.log(`Add to ~/.config/zed/settings.json:

{
  "context_servers": {
    "codivupload": {
      "command": {
        "path": "npx",
        "args": ["-y", "codivupload-mcp"],
        "env": {
          "CODIVUPLOAD_API_KEY": "cdv_your_api_key"
        }
      }
    }
  }
}
`);
  } else if (clientKey === "chatgpt") {
    console.log(`Two options:

1. ChatGPT Pro Connectors (recommended):
   chat.openai.com → Settings → Connectors → Add MCP Server
   Configuration:
   {
     "name": "CodivUpload",
     "command": "npx",
     "args": ["-y", "codivupload-mcp"],
     "env": { "CODIVUPLOAD_API_KEY": "cdv_your_api_key" }
   }

2. Custom GPT (legacy):
   gpts.openai.com/editor → Configure → Instructions
   Paste contents from: github.com/Codivion/codivupload-skills/blob/main/generic/SKILL.md
   Add Action with OpenAPI: https://api.codivupload.com/public-openapi.json
   Authentication: Bearer token (your cdv_ key)
`);
  }

  console.log(`Get an API key: https://app.codivupload.com → Settings → API Keys
Docs: https://codivupload.com/use-case/ai-skills
`);
}

async function promptClient() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));

  console.log("\nWhich AI client are you using?\n");
  const keys = Object.keys(CLIENTS);
  keys.forEach((k, i) => console.log(`  [${i + 1}] ${CLIENTS[k].label}`));
  console.log(`  [c] Custom path (--target)\n`);

  const ans = (await ask("Enter number (1-" + keys.length + ") or 'c': ")).trim().toLowerCase();
  rl.close();

  if (ans === "c") return { custom: true };
  const idx = parseInt(ans, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= keys.length) {
    console.error(`✗ Invalid choice. Run again or use --client <name>.`);
    process.exit(1);
  }
  return { client: keys[idx] };
}

async function main() {
  if (flags.help) return showHelp();
  if (flags.list) return listSkills();

  let clientKey = flags.client;
  let targetRoot = flags.target ? path.resolve(flags.target) : null;

  // No client and no target → interactive
  if (!clientKey && !targetRoot && !flags.yes) {
    try {
      const choice = await promptClient();
      if (choice.custom) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ans = await new Promise((r) => rl.question("Path: ", r));
        rl.close();
        targetRoot = path.resolve(ans.trim());
      } else {
        clientKey = choice.client;
      }
    } catch {
      // stdin not a tty (CI / npx -y) — fall back to default
      clientKey = "claude";
    }
  }

  // Resolve client to target
  let clientType = "skills-folder";
  if (clientKey) {
    const client = CLIENTS[clientKey];
    if (!client) {
      console.error(`✗ Unknown client: ${clientKey}`);
      console.error(`  Available: ${Object.keys(CLIENTS).join(", ")}`);
      process.exit(1);
    }
    clientType = client.type;
    if (clientType === "mcp-only") {
      showMcpOnlyMessage(clientKey);
      process.exit(0);
    }
    if (!targetRoot) targetRoot = client.target();
  }

  // Default if still nothing
  if (!targetRoot) {
    clientKey = "claude";
    targetRoot = CLIENTS.claude.target();
  }

  console.log(`\nInstalling CodivUpload AI skills`);
  console.log(`  Client: ${clientKey ? CLIENTS[clientKey].label : "Custom path"}`);
  console.log(`  Target: ${targetRoot}\n`);

  fs.mkdirSync(targetRoot, { recursive: true });

  const slugs = flags.skill ? [flags.skill] : AVAILABLE_SKILLS;
  if (flags.skill && !AVAILABLE_SKILLS.includes(flags.skill)) {
    console.error(`✗ Unknown skill: ${flags.skill}`);
    console.error(`  Available: ${AVAILABLE_SKILLS.join(", ")}`);
    process.exit(1);
  }

  let allOk = true;
  for (const slug of slugs) {
    const ok = clientType === "cursor-rules"
      ? installCursorRule(slug, targetRoot)
      : installSkillFolder(slug, targetRoot);
    if (!ok) allOk = false;
  }

  if (clientKey && CLIENTS[clientKey].note) {
    console.log(`\nNote: ${CLIENTS[clientKey].note}`);
  }

  console.log(`
Don't forget the MCP server (gives the LLM the actual tools):
  https://codivupload.com/use-case/ai-skills

Get an API key: https://app.codivupload.com → Settings → API Keys
`);

  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error("Error:", e?.message || e);
  process.exit(1);
});
