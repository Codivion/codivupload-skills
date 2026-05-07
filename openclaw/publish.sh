#!/usr/bin/env bash
# Publish CodivUpload skill to ClawHub marketplace.
#
# This script is a developer-only helper. It is NOT distributed to end users
# inside the published ClawHub artifact — we publish from a temporary staging
# directory containing only SKILL.md + README.md so that runtime consumers
# never see this file. (Per ClawScan recommendation: developer publishing
# helpers should be excluded from runtime skill packages.)
#
# Requires: CLAWHUB_API_KEY env var (set in frontend/.env.local) — copy to your shell
# before running, e.g.:
#   export CLAWHUB_API_KEY=$(grep CLAWHUB_API_KEY frontend/.env.local | cut -d= -f2- | tr -d '"')
#
# Or pass it inline:
#   CLAWHUB_API_KEY=clh_xxx ./publish.sh
#
# Usage:
#   ./publish.sh                        # publish using default version (1.0.0)
#   ./publish.sh --version 1.1.0        # publish specific version
#   ./publish.sh --dry-run              # show command without running

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_FILE="$SKILL_DIR/SKILL.md"
README_FILE="$SKILL_DIR/README.md"

# ── Pre-flight checks ────────────────────────────────────────────
if [ -z "${CLAWHUB_API_KEY:-}" ]; then
  echo "❌ CLAWHUB_API_KEY not set."
  echo ""
  echo "Set it from frontend/.env.local:"
  echo "  export CLAWHUB_API_KEY=\$(grep CLAWHUB_API_KEY frontend/.env.local | cut -d= -f2- | tr -d '\"')"
  exit 1
fi

if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ SKILL.md not found at $SKILL_FILE"
  exit 1
fi

if [ ! -f "$README_FILE" ]; then
  echo "❌ README.md not found at $README_FILE"
  exit 1
fi

if ! command -v clawhub &> /dev/null; then
  echo "❌ 'clawhub' CLI not found. Install with:"
  echo "  npm install -g @openclaw/cli"
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

# ── Stage runtime files into a clean directory ───────────────────
# Only SKILL.md + README.md ship to ClawHub. publish.sh is a developer
# helper and is intentionally NOT included in the published artifact.
STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codivupload-skill-publish.XXXXXX")"
trap 'rm -rf "$STAGING_DIR"' EXIT

cp "$SKILL_FILE" "$STAGING_DIR/SKILL.md"
cp "$README_FILE" "$STAGING_DIR/README.md"

echo "📁 Runtime artifact contents (staging dir):"
ls -1 "$STAGING_DIR" | sed 's/^/   /'

# ── Build clawhub publish command ────────────────────────────────
# NOTE: --tags accepts VERSION ALIASES only (latest, beta, stable, etc.) per the
# CLI spec. NOT searchable keywords. Searchable keywords come from the
# `description` field in the SKILL.md frontmatter (vector-indexed).
CMD=(clawhub skill publish "$STAGING_DIR" \
  --slug codivupload-social-manager \
  --name "CodivUpload Social Manager" \
  --version "$VERSION" \
  --tags "latest" \
  --changelog "Social media manager skill for OpenClaw — schedule, cross-post, and manage content across 7+ launched platforms (YouTube, Instagram, X, Facebook, TikTok, Threads, Pinterest). Requires CODIVUPLOAD_API_KEY (declared in frontmatter). All publishing actions are confirmation-gated. Optional pinned MCP server. Presigned upload flow for files up to 5GB. Runtime artifact contains SKILL.md + README.md only — developer publishing helpers are excluded.")

# ── Login + publish ──────────────────────────────────────────────
echo "🔐 Logging in to ClawHub..."
clawhub login --token "$CLAWHUB_API_KEY"

echo "📦 Publishing CodivUpload Social Manager v$VERSION to ClawHub..."
echo "   Slug: codivupload-social-manager"
echo "   Tags: latest"
echo "   Source: $STAGING_DIR (runtime files only — publish.sh excluded)"

if [ "$DRY_RUN" = true ]; then
  echo "🟡 DRY RUN — would execute:"
  printf '   %s\n' "${CMD[@]}"
  exit 0
fi

"${CMD[@]}"

echo ""
echo "✅ Skill published to ClawHub."
echo "   View at: https://clawhub.ai/codivion/codivupload-social-manager"
echo "   Install: clawhub skills install codivupload-social-manager"
