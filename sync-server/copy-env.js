#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📋 Copying environment variables from root to sync-server...\n');

// Paths
const rootEnvPath = path.join(__dirname, '..', '.env');
const syncEnvPath = path.join(__dirname, '.env');
const syncEnvExamplePath = path.join(__dirname, 'env-example.txt');

// Check if root .env exists
if (!fs.existsSync(rootEnvPath)) {
  console.error('❌ Root .env file not found!');
  console.log('Please make sure you have a .env file in your project root.');
  process.exit(1);
}

console.log('✅ Found root .env file');

// Read root .env
const rootEnvContent = fs.readFileSync(rootEnvPath, 'utf8');

// Extract required variables for sync server
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let syncEnvContent = '# PodDB Sync Server Environment Variables\n';
syncEnvContent += '# Copied from root .env file\n\n';

// Parse root .env and extract required variables
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

// Add sync server specific variables
syncEnvContent += '\n# Sync Server Configuration\n';
syncEnvContent += 'SYNC_SERVER_PORT=3002\n';

// Check if all required variables were found
const missingVars = requiredVars.filter(varName => !foundVars.includes(varName));

if (missingVars.length > 0) {
  console.log('⚠️  Missing variables in root .env:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease add these variables to your root .env file first.');
}

// Write sync server .env
fs.writeFileSync(syncEnvPath, syncEnvContent);
console.log('✅ Created sync-server/.env file');

// Show what was copied
console.log('\n📋 Copied variables:');
foundVars.forEach(varName => {
  console.log(`   ✅ ${varName}`);
});

console.log('\n🎉 Environment setup completed!');
console.log('Your sync server will now use the same Supabase credentials as your main app.');
