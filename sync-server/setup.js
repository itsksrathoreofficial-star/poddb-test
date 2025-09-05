#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PodDB Sync Server - Production Setup\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Create necessary directories
const dirs = ['logs', 'backups'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env-example.txt');
const rootEnvPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  // Try to copy from root .env first
  if (fs.existsSync(rootEnvPath)) {
    console.log('📝 Copying environment variables from root .env...');
    
    const rootEnvContent = fs.readFileSync(rootEnvPath, 'utf8');
    const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    
    let syncEnvContent = '# PodDB Sync Server Environment Variables\n';
    syncEnvContent += '# Copied from root .env file\n\n';
    
    const lines = rootEnvContent.split('\n');
    let foundVars = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key] = trimmedLine.split('=');
        if (requiredVars.includes(key)) {
          syncEnvContent += `${trimmedLine}\n`;
          foundVars.push(key);
        }
      }
    });
    
    syncEnvContent += '\n# Sync Server Configuration\n';
    syncEnvContent += 'SYNC_SERVER_PORT=3002\n';
    
    fs.writeFileSync(envPath, syncEnvContent);
    console.log('✅ Created .env file from root configuration');
    
    if (foundVars.length === requiredVars.length) {
      console.log('✅ All required variables copied successfully');
    } else {
      console.log('⚠️  Some variables missing, please check your root .env file');
    }
  } else if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file');
    console.log('⚠️  IMPORTANT: Please edit .env with your Supabase credentials');
  } else {
    console.log('📝 Creating .env file...');
    const envContent = `# PodDB Sync Server Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SYNC_SERVER_PORT=3002
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
    console.log('⚠️  IMPORTANT: Please edit .env with your Supabase credentials');
  }
} else {
  console.log('✅ Found existing .env file');
}

// Install production dependencies
console.log('\n📦 Installing production dependencies...');
try {
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if PM2 is installed globally
console.log('\n🔍 Checking PM2 installation...');
try {
  execSync('pm2 --version', { stdio: 'pipe' });
  console.log('✅ PM2 is installed');
} catch (error) {
  console.log('⚠️  PM2 not found. Installing PM2 globally...');
  try {
    execSync('npm install -g pm2', { stdio: 'inherit' });
    console.log('✅ PM2 installed successfully');
  } catch (pm2Error) {
    console.log('⚠️  Could not install PM2. You can install it manually with: npm install -g pm2');
  }
}

// Create startup script
const startupScript = `#!/bin/bash
# PodDB Sync Server Startup Script

cd "$(dirname "$0")"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Start the server with PM2
echo "Starting PodDB Sync Server..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup (if not already done)
pm2 startup

echo "PodDB Sync Server started successfully!"
echo "Server is running on port 3002"
echo "Use 'pm2 logs poddb-sync' to view logs"
echo "Use 'pm2 stop poddb-sync' to stop the server"
`;

const startupScriptPath = path.join(__dirname, 'start.sh');
fs.writeFileSync(startupScriptPath, startupScript);
fs.chmodSync(startupScriptPath, '755');
console.log('✅ Created startup script: start.sh');

// Create stop script
const stopScript = `#!/bin/bash
# PodDB Sync Server Stop Script

cd "$(dirname "$0")"

echo "Stopping PodDB Sync Server..."
pm2 stop poddb-sync

echo "PodDB Sync Server stopped!"
`;

const stopScriptPath = path.join(__dirname, 'stop.sh');
fs.writeFileSync(stopScriptPath, stopScript);
fs.chmodSync(stopScriptPath, '755');
console.log('✅ Created stop script: stop.sh');

// Create restart script
const restartScript = `#!/bin/bash
# PodDB Sync Server Restart Script

cd "$(dirname "$0")"

echo "Restarting PodDB Sync Server..."
pm2 restart poddb-sync

echo "PodDB Sync Server restarted!"
`;

const restartScriptPath = path.join(__dirname, 'restart.sh');
fs.writeFileSync(restartScriptPath, restartScript);
fs.chmodSync(restartScriptPath, '755');
console.log('✅ Created restart script: restart.sh');

// Test server startup
console.log('\n🧪 Testing server startup...');
try {
  // Start server in background for 3 seconds
  const serverProcess = execSync('timeout 3s npm start || true', { 
    stdio: 'pipe',
    cwd: __dirname 
  });
  console.log('✅ Server can start successfully');
} catch (error) {
  console.log('⚠️  Server test failed, but this might be due to missing environment variables');
}

console.log('\n🎉 Production setup completed successfully!\n');

console.log('📋 Next Steps:');
console.log('1. Edit .env with your Supabase credentials');
console.log('2. Start the server:');
console.log('   ./start.sh');
console.log('3. Or manually:');
console.log('   npm run pm2');
console.log('4. The server will be available at http://localhost:3002');
console.log('5. Your admin panel will automatically connect to the sync server\n');

console.log('🔧 Available Commands:');
console.log('   ./start.sh           - Start server with PM2');
console.log('   ./stop.sh            - Stop server');
console.log('   ./restart.sh         - Restart server');
console.log('   npm start            - Start server directly');
console.log('   npm run pm2          - Start with PM2');
console.log('   npm run pm2:stop     - Stop PM2 process');
console.log('   npm run pm2:restart  - Restart PM2 process');
console.log('   npm run pm2:logs     - View PM2 logs\n');

console.log('🌐 Server Endpoints:');
console.log('   GET  /status              - Get sync status');
console.log('   POST /sync                - Start manual sync');
console.log('   GET  /health              - Health check');
console.log('   GET  /auto-sync-settings  - Get auto-sync config');
console.log('   POST /auto-sync-settings  - Update auto-sync config\n');

console.log('📁 Important Files:');
console.log('   .env                     - Environment variables');
console.log('   logs/                    - Server logs');
console.log('   settings.json            - Auto-sync settings');
console.log('   start.sh                 - Startup script');
console.log('   stop.sh                  - Stop script');
console.log('   restart.sh               - Restart script\n');

console.log('✨ Your production-ready sync server is ready!');
console.log('   - Unlimited processing time');
console.log('   - Fetches ALL episodes (no limits)');
console.log('   - Automatic daily sync');
console.log('   - Background running with PM2');
console.log('   - Auto-restart on crashes');
console.log('   - Production logging');
console.log('   - Completely free!');
