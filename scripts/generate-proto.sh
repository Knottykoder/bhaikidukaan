#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Proto Code Generation Script
# Generates TypeScript types + Connect-RPC clients from .proto files
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PROTO_DIR="$ROOT_DIR/proto"
OUT_DIR="$ROOT_DIR/packages/proto-gen/src/gen"

echo "🔧 BhaiKiDukaan — Proto Code Generation"
echo "========================================="

# Clean previous generated code
echo "🧹 Cleaning previous generated code..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Check if buf is installed
if ! command -v npx &> /dev/null; then
  echo "❌ npx not found. Please install Node.js first."
  exit 1
fi

# Generate code using buf
echo "⚡ Generating TypeScript types from proto files..."
cd "$PROTO_DIR"
npx -y @bufbuild/buf generate

echo ""
echo "✅ Code generation complete!"
echo "📁 Output: $OUT_DIR"
echo ""
echo "Generated files:"
find "$OUT_DIR" -name "*.ts" -type f | sort | while read -r file; do
  echo "  📄 $(basename "$file")"
done
echo ""
echo "You can now import types:"
echo "  import { User } from '@bhaikidukaan/proto-gen/user'"
echo "  import { UserService } from '@bhaikidukaan/proto-gen/user-service'"
