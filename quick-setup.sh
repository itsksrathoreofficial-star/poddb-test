#!/bin/bash

# Quick Setup Script for Supabase Migration
echo "🚀 PodDB Supabase Migration Quick Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install @supabase/supabase-js

# Create migration-script.sh
cat > migrate-script.sh << 'EOF'
#!/bin/bash
# Generated Supabase Migration Script

echo "🔧 Loading migration environment..."
set -a
source .env.migration
set +a

echo "📊 Running Supabase migration..."
node migrate-supabase.js "$1"

EOF

chmod +x migrate-script.sh

echo "✅ Quick setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.migration with your Supabase credentials"
echo "2. Run: ./migrate-script.sh full"
echo ""

