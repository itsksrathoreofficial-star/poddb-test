#!/bin/bash

# PodDB 3.0 - cPanel Deployment Setup Script
# Run this script after uploading files to cPanel

echo "🚀 Starting PodDB 3.0 cPanel Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Setting up PodDB 3.0 for cPanel deployment..."

# Step 1: Install dependencies
print_status "Installing main application dependencies..."
npm install --production

if [ $? -eq 0 ]; then
    print_status "✅ Main application dependencies installed successfully"
else
    print_error "❌ Failed to install main application dependencies"
    exit 1
fi

# Step 2: Install sync server dependencies
if [ -d "sync-server" ]; then
    print_status "Installing sync server dependencies..."
    cd sync-server
    npm install --production
    cd ..
    
    if [ $? -eq 0 ]; then
        print_status "✅ Sync server dependencies installed successfully"
    else
        print_error "❌ Failed to install sync server dependencies"
        exit 1
    fi
else
    print_warning "Sync server directory not found. Skipping sync server setup."
fi

# Step 3: Build the application
print_status "Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "✅ Application built successfully"
else
    print_error "❌ Failed to build application"
    exit 1
fi

# Step 4: Set up PM2
print_status "Setting up PM2 process manager..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 globally..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Step 5: Set proper permissions
print_status "Setting file permissions..."
chmod 755 .
chmod 644 .env
chmod 644 package.json
chmod 644 ecosystem.config.js

if [ -d "sync-server" ]; then
    chmod 755 sync-server
    chmod 644 sync-server/.env
    chmod 644 sync-server/package.json
fi

print_status "✅ File permissions set successfully"

# Step 6: Create startup script
print_status "Creating startup script..."
cat > start-poddb.sh << 'EOF'
#!/bin/bash
echo "Starting PodDB 3.0..."

# Start main application
pm2 start ecosystem.config.js --only poddb-main

# Start sync server if it exists
if [ -d "sync-server" ]; then
    pm2 start ecosystem.config.js --only poddb-sync-server
fi

# Save PM2 configuration
pm2 save

echo "PodDB 3.0 started successfully!"
echo "Use 'pm2 status' to check status"
echo "Use 'pm2 logs' to view logs"
EOF

chmod +x start-poddb.sh

# Step 7: Create stop script
print_status "Creating stop script..."
cat > stop-poddb.sh << 'EOF'
#!/bin/bash
echo "Stopping PodDB 3.0..."

# Stop all PodDB processes
pm2 stop poddb-main
pm2 stop poddb-sync-server

echo "PodDB 3.0 stopped successfully!"
EOF

chmod +x stop-poddb.sh

# Step 8: Create restart script
print_status "Creating restart script..."
cat > restart-poddb.sh << 'EOF'
#!/bin/bash
echo "Restarting PodDB 3.0..."

# Restart all PodDB processes
pm2 restart poddb-main
pm2 restart poddb-sync-server

echo "PodDB 3.0 restarted successfully!"
EOF

chmod +x restart-poddb.sh

# Step 9: Display final instructions
echo ""
echo "🎉 PodDB 3.0 cPanel setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with production values"
echo "2. Configure your domain in cPanel"
echo "3. Set up SSL certificate"
echo "4. Run: ./start-poddb.sh"
echo ""
echo "🔧 Useful commands:"
echo "- Start: ./start-poddb.sh"
echo "- Stop: ./stop-poddb.sh"
echo "- Restart: ./restart-poddb.sh"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs"
echo ""
echo "📖 For detailed instructions, see CPANEL_DEPLOYMENT_GUIDE.md"
echo ""

print_status "Setup completed! 🚀"
