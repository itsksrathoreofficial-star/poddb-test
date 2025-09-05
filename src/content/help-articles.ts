
import { Upload, TrendingUp, UserCheck, Settings, Star, Info, Rocket, Shield } from 'lucide-react';

interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  keywords: string[];
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  articles: HelpArticle[];
}

export const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    articles: [
      {
        slug: 'what-is-podd-b',
        title: 'What is PodDB Pro?',
        description: 'Learn about our mission to become the IMDb for podcasts and what makes our platform unique.',
        keywords: ['podd-b', 'about', 'mission', 'imdb for podcasts'],
        content: `
### Our Mission: The IMDb for Podcasts

PodDB Pro is a community-driven database for the podcasting industry. Our goal is to create the most comprehensive and authoritative source of information for podcasts, episodes, creators, and guests. Think of us as the **IMDb for podcasts**.

We believe that the podcasting world deserves a central hub for discovery, data, and community contribution. Whether you're a listener trying to find your next favorite show, or a creator wanting to showcase your work, PodDB Pro is built for you.

### What Makes PodDB Pro Different?

*   **Community-Powered:** Our data is sourced and verified by a community of passionate podcast fans and creators. This ensures our database is always growing and up-to-date.
*   **Data-Driven Rankings:** Our ranking system is based on real, verifiable metrics from platforms like YouTube, providing a transparent look at what's popular.
*   **Deep Connections:** We don't just list podcasts. We map out the relationships between podcasts, episodes, hosts, and guests, creating a rich web of discoverable content.
*   **Open Contribution:** Anyone can contribute to our database. Our robust verification system ensures that all data is accurate and reliable.
        `
      },
      {
        slug: 'creating-an-account',
        title: 'Creating Your PodDB Pro Account',
        description: 'Step-by-step guide to signing up and setting up your profile.',
        keywords: ['account', 'signup', 'profile', 'register'],
        content: `
### 1. Go to the Sign-Up Page
You can create an account by clicking the "Join PodDB" or "Sign In" button in the top-right corner of the navigation bar. If you're on the Sign In page, click the "Create one now" link.

### 2. Fill in Your Details
You'll need to provide:
- **Display Name:** This is the name other users will see.
- **Email Address:** This will be used for login and notifications.
- **Password:** Choose a secure password (at least 6 characters).

### 3. Verify Your Email
After signing up, we'll send a verification link to your email address. You must click this link to activate your account.

### 4. Set Up Your Profile
Once your account is activated, navigate to your **Profile** page. Here you can:
- Upload a profile picture (avatar).
- Write a short bio about yourself.
- Add links to your social media profiles.

A complete profile helps build trust within the community, especially if you plan on contributing data or applying for verification.
        `
      }
    ]
  },
  {
    id: 'contributing',
    title: 'Contributing to PodDB',
    icon: Upload,
    articles: [
      {
        slug: 'how-to-submit-a-podcast',
        title: 'How to Submit a Podcast',
        description: 'A complete walkthrough of the process for adding a new podcast to our database using a YouTube playlist.',
        keywords: ['submit', 'add podcast', 'contribute', 'youtube playlist'],
        content: `
Adding a podcast to PodDB Pro is easy! All you need is the podcast's official YouTube playlist URL.

### Step 1: Go to the Contribute Page
Click on the "Contribute" link in the main navigation menu.

### Step 2: Fetch Podcast Information
1.  Paste the full YouTube playlist URL into the input field. The URL should look something like: \`https://www.youtube.com/playlist?list=PL... \`
2.  Click the "Fetch Info" button.
3.  Our system will connect to the YouTube API to pull in the podcast's title, description, cover art, and all its episodes. We automatically filter out videos shorter than 5 minutes to ensure they are full episodes.

### Step 3: Review and Edit Information
Once the data is fetched, you can review and edit all the information on the form:
- **Podcast Information:** Correct the title, description, categories, and upload a higher-quality banner if available.
- **Social & Platform Links:** Add links to the podcast's official website and other platforms like Spotify or Apple Podcasts.
- **Episodes:** Review the list of fetched episodes. You can edit titles, descriptions, and other details.
- **Team Members:** Add hosts, guests, and other creators associated with the podcast.

### Step 4: Submit for Review
After you've reviewed and edited the information, click the "Submit for Review" button. Our moderation team will review your submission. You can track the status of your contribution on your **Profile** page.
        `
      },
      {
        slug: 'submission-guidelines',
        title: 'Podcast Submission Guidelines',
        description: 'Understand the rules and best practices for submitting high-quality data to PodDB.',
        keywords: ['guidelines', 'rules', 'quality', 'submission'],
        content: `
To maintain the quality and integrity of our database, please follow these guidelines when submitting new podcasts:

1.  **Use Official Sources:** Always use the official YouTube playlist provided by the podcast creator. Do not use fan-made compilations or personal playlists.
2.  **One Podcast Per Submission:** The YouTube playlist should contain episodes from only one podcast. Playlists that mix content from multiple shows will be rejected.
3.  **Ensure Public Accessibility:** The YouTube playlist and its videos must be public. Private or unlisted content cannot be processed.
4.  **Complete Information:** While our system fetches a lot of data automatically, please take the time to fill in any missing information, such as social media links, official websites, and team member roles. The more complete the data, the faster it will be approved.
5.  **Respect Copyright:** Only submit content that is publicly available. Do not upload or link to copyrighted material that you do not have permission to share.

Submissions that do not meet these guidelines may be rejected by our moderation team.
        `
      },
    ]
  },
  {
    id: 'rankings-and-profiles',
    title: 'Rankings & Profiles',
    icon: TrendingUp,
    articles: [
      {
        slug: 'understanding-our-rankings',
        title: 'Understanding Our Ranking System',
        description: 'Learn how we calculate podcast and episode rankings and what the data means.',
        keywords: ['rankings', 'algorithm', 'views', 'likes', 'metrics'],
        content: `
Our ranking system is designed to be transparent and data-driven, reflecting what the community is actively watching and engaging with.

### How are Rankings Calculated?
Rankings are primarily based on a combination of metrics pulled directly from public data sources like YouTube:
- **Total Views:** The cumulative number of views for a podcast or episode.
- **Total Likes:** The cumulative number of likes.
- **Engagement Velocity:** We also consider the rate at which a podcast or episode is gaining new views and likes, especially for our 'Weekly' and 'Monthly' charts. This helps new and trending content to surface.

### Ranking Categories
You can filter rankings by:
- **Content-Type:** View rankings for either whole **Podcasts** or individual **Episodes**.
- **Time Period:**
    - **Weekly:** Shows the top performers over the last 7 days.
    - **Monthly:** Shows the top performers over the last 30 days.
    - **Overall:** Shows the all-time top performers based on cumulative stats.
- **Category:** Filter rankings to a specific genre, like 'Comedy' or 'Technology'.

Our data is synced regularly to ensure the rankings are as up-to-date as possible.
        `
      },
      {
        slug: 'optimizing-your-profile',
        title: 'Optimizing Your Podcast & Profile Page',
        description: 'Tips for creators on how to make your podcast and creator pages stand out.',
        keywords: ['optimize', 'profile page', 'podcast page', 'creator'],
        content: `
A great page on PodDB Pro can help new listeners discover your work. Here’s how to make yours shine:

### For Your Podcast Page:
1.  **High-Quality Cover Art:** Ensure your podcast has a high-resolution (at least 1400x1400px) square cover image. This is the first thing users see.
2.  **Compelling Description:** Write a clear and engaging description. Explain what your podcast is about, who it's for, and what makes it unique.
3.  **Accurate Categories & Tags:** Select relevant categories and add specific tags to help users find your show through search and browsing.
4.  **Link Everything:** Fill out all platform and social media links. This helps listeners find you on their preferred app and connect with your community.
5.  **Add Team Members:** Credit your hosts, guests, and producers. This creates connections in the PodDB database and makes everyone involved more discoverable.

### For Your Creator Profile:
1.  **Professional Avatar:** Use a clear headshot or a high-quality logo.
2.  **Informative Bio:** Write a bio that describes who you are and your role in the podcasting world.
3.  **Get Verified:** A verification badge builds trust and authenticity. Follow our guide to apply for verification.
        `
      }
    ]
  },
  {
    id: 'verification',
    title: 'Verification',
    icon: UserCheck,
    articles: [
      {
        slug: 'how-to-get-verified',
        title: 'How to Get Verified on PodDB Pro',
        description: 'A step-by-step guide on how to apply for and receive the official verification badge.',
        keywords: ['verification', 'verified', 'badge', 'authentic'],
        content: `
The verification badge lets the community know that a podcast or person page is authentic and officially managed.

### Who is Eligible?
- **Podcasts:** Must be an established show with a public presence.
- **People:** Must be notable creators, hosts, or producers in the industry.

### How to Apply:
1.  **Navigate to Your Profile:** Log in and go to your **Profile** page.
2.  **Open the 'Verification' Tab:** Find and click on the "Verification" tab.
3.  **Choose What to Verify:** Select whether you're verifying a podcast you've contributed or your own creator profile (if one has been created for you).
4.  **Select the Item:** Choose the specific podcast or profile from the dropdown list.
5.  **Provide Supporting Info:** In the "Notes" section, provide links to official websites, social media profiles, or articles that prove your connection to the podcast or your identity as a creator. This is the most important step!
6.  **Submit:** Our team will review your request. You can track its status in the same "Verification" tab.

Verification helps you build trust with your audience and makes your page stand out.
        `
      },
      {
        slug: 'verification-policy',
        title: 'Our Verification Policy',
        description: 'Learn about the requirements and standards for getting verified on PodDB Pro.',
        keywords: ['policy', 'verification', 'rules', 'requirements'],
        content: `
### Authenticity
Your account must represent a real person, registered business, or entity.

### Notability
Your account must represent a well-known, highly searched for person, brand, or entity. We review accounts that are featured in multiple news sources, and we don't consider paid or promotional content as sources for review.

### Completeness
Your account must be public and have a bio, profile photo, and at least one post. Your profile can't contain "add me" links to other social media services.

### Maintaining Verification
PodDB reserves the right to remove verification at any time. Reasons for removal may include:
- The account is found to be in violation of our Terms of Service.
- The account changes its profile in a way that misleads people.
- The account holder is no longer eligible for verification.

Losing verification does not necessarily mean you are banned from the platform, but you would need to re-apply if you become eligible again.
`
      }
    ]
  },
  {
    id: 'account-and-security',
    title: 'Account & Security',
    icon: Shield,
    articles: [
       {
        slug: 'how-to-change-password',
        title: 'How to Change Your Password',
        description: 'Steps to securely update your account password.',
        keywords: ['password', 'change', 'security', 'reset'],
        content: `
### To change your password:
1.  Log into your PodDB Pro account.
2.  Navigate to your **Profile** page by clicking your username in the top right.
3.  Go to the **Security** tab.
4.  Click the "Change Password" button.
5.  We will send a password reset link to your registered email address.
6.  Click the link in the email and follow the instructions to set a new password.

For security reasons, we do not allow changing your password directly on the site without email confirmation. If you do not have access to your email, please contact support.
`
      },
       {
        slug: 'how-to-delete-account',
        title: 'How to Delete Your Account',
        description: 'Information on how to permanently delete your PodDB Pro account and data.',
        keywords: ['delete', 'remove account', 'privacy', 'data'],
        content: `
### Important Information Before Deletion
Deleting your account is a **permanent action**. Once your account is deleted, all of your data, including your profile, contributions, and reviews, will be permanently removed and cannot be recovered.

### To delete your account:
1.  Log into your PodDB Pro account.
2.  Navigate to your **Profile** page.
3.  Go to the **Security** tab.
4.  Find the "Delete Account" section.
5.  Click the "Delete Account" button.
6.  A confirmation dialog will appear to ensure you understand this action is permanent.
7.  Confirm the deletion. Your account will be scheduled for permanent removal from our systems.

If you have any pending contributions or issues, please resolve them before deleting your account.
`
      }
    ]
  }
];


// Helper function to get an article by its slug
export const getArticleBySlug = (slug: string): HelpArticle | undefined => {
  for (const section of helpSections) {
    const found = section.articles.find(article => article.slug === slug);
    if (found) {
      return found;
    }
  }
  return undefined;
};

// Create a mapping of section ID to articles for easier access
export const articlesBySection = helpSections.reduce((acc, section) => {
  acc[section.id] = section.articles;
  return acc;
}, {} as Record<string, HelpArticle[]>);
