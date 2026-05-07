#!/usr/bin/env bash
# Publish CodivUpload skill to ClawHub marketplace.
#
# Requires: CLAWHUB_API_KEY env var (set in frontend/.env.local) — copy to your shell
# before running, e.g.:
#   export CLAWHUB_API_KEY=$(grep CLAWHUB_API_KEY frontend/.env.local | cut -d= -f2-)
#
# Or pass it inline:
#   CLAWHUB_API_KEY=clawhub_xxx ./publish.sh
#
# Usage:
#   ./publish.sh                        # publish current version (read from frontmatter)
#   ./publish.sh --version 1.1.0        # publish specific version
#   ./publish.sh --dry-run              # show command without running

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_FILE="$SKILL_DIR/SKILL.md"

# ── Pre-flight checks ────────────────────────────────────────────
if [ -z "${CLAWHUB_API_KEY:-}" ]; then
  echo "❌ CLAWHUB_API_KEY not set."
  echo ""
  echo "Set it from frontend/.env.local:"
  echo "  export CLAWHUB_API_KEY=\$(grep CLAWHUB_API_KEY frontend/.env.local | cut -d= -f2-)"
  exit 1
fi

if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ SKILL.md not found at $SKILL_FILE"
  exit 1
fi

if ! command -v clawhub &> /dev/null; then
  echo "❌ 'clawhub' CLI not found. Install with:"
  echo "  npm install -g @openclaw/cli"
  echo "  # OR (if not on npm yet):"
  echo "  curl -fsSL https://openclaw.ai/install.sh | sh"
  exit 1
fi

# ── Parse args ───────────────────────────────────────────────────
VERSION=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) VERSION="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Default version if not explicitly passed
if [ -z "$VERSION" ]; then
  VERSION="1.0.0"
fi

# ── Build clawhub publish command ────────────────────────────────
# NOTE: --tags accepts VERSION ALIASES only (latest, beta, stable, etc.) per the
# CLI spec. NOT searchable keywords. Searchable keywords come from the
# `description` field (vector-indexed). Do not pass keyword tags here.
CMD=(clawhub skill publish "$SKILL_DIR" \
  --slug codivupload-social-manager \
  --name "CodivUpload Social Manager" \
  --version "$VERSION" \
  --tags "latest" \
  --changelog "Comprehensive social media manager skill for OpenClaw — schedule, cross-post, and manage content across 7+ launched platforms (YouTube, Instagram, X, Facebook, TikTok, Threads, Pinterest). MCP server included, BYOP for unlimited YouTube quota, BYOK for unlimited X posts, 24/7 managed live streams, agency multi-workspace + RBAC, presigned upload flow for files up to 5GB.")

# ── Login + publish ──────────────────────────────────────────────
echo "🔐 Logging in to ClawHub..."
clawhub login --token "$CLAWHUB_API_KEY"

echo "📦 Publishing CodivUpload skill v$VERSION to ClawHub..."
echo "   Slug: codivupload"
echo "   Tags: social-media,scheduling,api,automation,mcp,publishing"

if [ "$DRY_RUN" = true ]; then
  echo "🟡 DRY RUN — would execute:"
  printf '   %s\n' "${CMD[@]}"
  exit 0
fi

"${CMD[@]}"

echo ""
echo "✅ Skill published to ClawHub."
echo "   View at: https://openclaw.ai/clawhub/codivupload"
echo "   Install: clawhub install codivupload"
