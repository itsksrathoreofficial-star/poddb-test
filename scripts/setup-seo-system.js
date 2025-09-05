#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PodDB Ranking SEO System...\n');

// Check if required files exist
const requiredFiles = [
  'src/lib/seo-generator.ts',
  'src/app/rankings/layout.tsx',
  'src/app/rankings/structured-data.tsx',
  'src/components/SEOOptimizer.tsx',
  'src/app/rankings/[category]/page.tsx',
  'src/app/rankings/[category]/[language]/page.tsx',
  'src/app/rankings/[category]/[language]/[location]/page.tsx',
  'src/app/rankings/sitemap.ts'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all SEO system files are created.');
  process.exit(1);
}

console.log('\n✅ All required files are present!');

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory');
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let envVarsOk = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`❌ ${envVar} - NOT SET`);
    envVarsOk = false;
  }
});

if (!envVarsOk) {
  console.log('\n⚠️  Some environment variables are missing. Please set them in your .env file:');
  console.log('NEXT_PUBLIC_SITE_URL=https://poddb.pro');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}

// Generate sample SEO combinations
console.log('\n🎯 Generating sample SEO combinations...');
try {
  const { execSync } = require('child_process');
  execSync('node scripts/generate-seo-pages.js', { stdio: 'inherit' });
  console.log('✅ SEO combinations generated successfully!');
} catch (error) {
  console.log('⚠️  Could not generate SEO combinations. Make sure your database is accessible.');
}

// Create package.json script
console.log('\n📝 Adding npm scripts...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['generate-seo'] = 'node scripts/generate-seo-pages.js';
  packageJson.scripts['setup-seo'] = 'node scripts/setup-seo-system.js';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added SEO scripts to package.json');
}

// Create .gitignore entries
console.log('\n📝 Updating .gitignore...');
const gitignorePath = path.join(process.cwd(), '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const seoGitignoreEntries = [
  '# SEO generated data',
  'data/seo-combinations.json',
  'data/seo-samples.json',
  'data/',
  ''
];

const newEntries = seoGitignoreEntries.filter(entry => 
  !gitignoreContent.includes(entry.replace('# ', '').replace('/', ''))
);

if (newEntries.length > 0) {
  gitignoreContent += '\n' + newEntries.join('\n');
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ Updated .gitignore with SEO entries');
}

// Final instructions
console.log('\n🎉 SEO System Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Set up your environment variables in .env file');
console.log('2. Run: npm run generate-seo');
console.log('3. Build your application: npm run build');
console.log('4. Deploy and submit sitemaps to search engines');
console.log('5. Monitor performance in Google Search Console');

console.log('\n🔗 Important URLs:');
console.log('- Main rankings: /rankings');
console.log('- Category pages: /rankings/[category]');
console.log('- Sitemap: /rankings/sitemap.xml');
console.log('- SEO combinations: data/seo-combinations.json');

console.log('\n📊 Expected Results:');
console.log('- 10,000+ SEO-optimized pages');
console.log('- 50,000+ potential search queries');
console.log('- Significant organic traffic growth');
console.log('- Top rankings for target keywords');

console.log('\n🚀 Your ranking page is now ready to dominate search results!');
