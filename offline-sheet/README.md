# Podcast Data Management System

## Files Created:

### 1. `sample-podcast-data.json`
- Complete JSON template with all podcast fields
- Hindi instructions for AI data generation
- Based on your actual database schema
- Includes all required fields from contribution page

### 2. `ai-prompt-for-podcast-data.md`
- Detailed prompt for AI to research individual podcasts
- Instructions for accurate data collection
- JSON output format
- Quality assurance guidelines

### 3. `ai-research-prompt.md`
- Comprehensive prompt for bulk podcast research
- Focuses on YouTube as primary source
- Instructions for 100 podcasts research
- SQL generation guidelines

### 4. `insert-podcast-sql.sql`
- Complete SQL template for podcast insertion
- Handles max 3 categories and 3 languages
- Includes validation queries
- Ready to run in SQL editor

## How to Use:

### For Individual Podcast Research:
1. Use `ai-prompt-for-podcast-data.md`
2. Provide podcast title and YouTube playlist URL
3. AI will research and return JSON
4. Convert JSON to SQL using `insert-podcast-sql.sql` template

### For Bulk Podcast Research:
1. Use `ai-research-prompt.md`
2. Provide list of 100 podcasts with titles and playlist IDs
3. AI will research all and generate complete SQL statements
4. Run SQL directly in your database

### For Manual Data Entry:
1. Use `sample-podcast-data.json` as template
2. Fill in the required fields
3. Convert to SQL using the template
4. Run in your database

## Key Features:

- **YouTube-Focused Research**: Since Google search results are limited, focuses on YouTube data
- **Social Media Integration**: Extracts social media links from YouTube channels
- **Category Limitation**: Enforces max 3 categories per podcast
- **Language Support**: Handles multiple languages with proper validation
- **Team Member Management**: Supports multiple team members with social links
- **SEO Optimization**: Includes complete SEO metadata
- **Data Validation**: Built-in validation queries

## Database Fields Covered:

### Podcast Basic Info:
- Title, Description, Cover Image
- YouTube Playlist URL and ID
- Categories (max 3), Languages
- Location, Official Website

### Platform Links:
- Spotify, Apple Podcasts, JioSaavn, Amazon Music
- Custom platform support

### Social Media:
- Instagram, YouTube, X (Twitter), Facebook
- LinkedIn, Threads, Pinterest
- Custom social media support

### Team Members:
- Name, Roles, Bio
- Photo URLs, Social Links
- Multiple team member support

### SEO & Metadata:
- Meta titles and descriptions
- Keywords, OG tags
- Complete SEO optimization

## Usage Instructions:

1. **Copy the AI prompt** from `ai-research-prompt.md`
2. **Provide your 100 podcasts list** with titles and playlist IDs
3. **AI will research each podcast** using YouTube and social media
4. **Generate complete SQL statements** for all podcasts
5. **Run SQL in your database** to add all podcasts

## Notes:

- All data is validated for accuracy
- YouTube is used as primary source for reliability
- Social media links are verified
- Categories are limited to 3 per podcast
- Languages are properly formatted
- SEO metadata is optimized for search engines

This system will help you efficiently manage and add 100 podcasts to your database with accurate, verified information.

