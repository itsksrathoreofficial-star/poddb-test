#!/usr/bin/env node

/**
 * Setup script for the review scheduler
 * This script helps set up the automated review posting system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Review Scheduler...\n');

// Check if we're in the right directory
if (!fs.existsSync('supabase')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI found');
} catch (error) {
  console.error('❌ Error: Supabase CLI not found. Please install it first:');
  console.error('   npm install -g supabase');
  process.exit(1);
}

// Deploy the edge function
console.log('\n📦 Deploying edge function...');
try {
  execSync('supabase functions deploy process-scheduled-reviews', { stdio: 'inherit' });
  console.log('✅ Edge function deployed successfully');
} catch (error) {
  console.error('❌ Error deploying edge function:', error.message);
  process.exit(1);
}

// Create a simple cron job setup guide
const cronGuide = `
# Review Scheduler Setup Guide

## Manual Cron Job Setup

To automatically process scheduled reviews, you can set up a cron job to call the edge function:

### Option 1: Using curl (if you have a public URL)
\`\`\`bash
# Add this to your crontab (crontab -e)
# Run every 15 minutes
*/15 * * * * curl -X POST "https://your-project.supabase.co/functions/v1/process-scheduled-reviews" -H "Authorization: Bearer YOUR_ANON_KEY"
\`\`\`

### Option 2: Using a service like GitHub Actions
Create .github/workflows/review-scheduler.yml:
\`\`\`yaml
name: Process Scheduled Reviews
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  process-reviews:
    runs-on: ubuntu-latest
    steps:
      - name: Process Scheduled Reviews
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/process-scheduled-reviews" \\
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
\`\`\`

### Option 3: Using a cloud scheduler service
- AWS EventBridge
- Google Cloud Scheduler
- Azure Logic Apps
- Vercel Cron Jobs

## Environment Variables Needed
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_ANON_KEY: Your Supabase anonymous key

## Testing the Function
You can test the function manually:
\`\`\`bash
curl -X POST "https://your-project.supabase.co/functions/v1/process-scheduled-reviews" \\
  -H "Authorization: Bearer YOUR_ANON_KEY"
\`\`\`

## Monitoring
Check the Supabase dashboard logs to monitor the function execution.
`;

fs.writeFileSync('REVIEW_SCHEDULER_SETUP.md', cronGuide);
console.log('\n📝 Created REVIEW_SCHEDULER_SETUP.md with setup instructions');

// Create a simple test script
const testScript = `#!/usr/bin/env node

/**
 * Test script for the review scheduler
 */

const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const url = \`\${SUPABASE_URL}/functions/v1/process-scheduled-reviews\`;

const options = {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`,
    'Content-Type': 'application/json'
  }
};

console.log('🧪 Testing review scheduler...');
console.log('URL:', url);

const req = https.request(url, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Review scheduler is working correctly');
    } else {
      console.log('❌ Review scheduler returned an error');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error testing review scheduler:', error.message);
});

req.end();
`;

fs.writeFileSync('scripts/test-review-scheduler.js', testScript);
fs.chmodSync('scripts/test-review-scheduler.js', '755');
console.log('✅ Created test script: scripts/test-review-scheduler.js');

console.log('\n🎉 Review Scheduler setup complete!');
console.log('\nNext steps:');
console.log('1. Read REVIEW_SCHEDULER_SETUP.md for cron job setup instructions');
console.log('2. Test the scheduler: node scripts/test-review-scheduler.js');
console.log('3. Set up a cron job or cloud scheduler to run the function regularly');
console.log('\nThe scheduler will automatically post reviews when their scheduled time arrives.');
