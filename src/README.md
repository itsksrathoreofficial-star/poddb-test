# PodDB Pro - Professional Podcast Database

PodDB Pro is a comprehensive, community-powered podcast database application, designed to be the "IMDb of podcasts." It is built with a modern tech stack including Next.js, React, ShadCN UI, Tailwind CSS, Supabase for the backend, and Genkit for AI features.

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Core Features](#2-core-features)
3.  [Technology Stack](#3-technology-stack)
4.  [Local Setup Instructions](#4-local-setup-instructions)
5.  [Deployment Instructions](#5-deployment-instructions)
6.  [Folder Structure](#6-folder-structure)
7.  [Architectural Decisions](#7-architectural-decisions)
8.  [Contributing](#8-contributing)

---

## 1. Project Overview

PodDB Pro serves as a central hub for podcast enthusiasts, creators, and researchers. It provides a user-friendly interface to discover, explore, rate, and contribute information about podcasts, episodes, and the people behind them. The application is designed to be scalable, performant, and easily maintainable.

## 2. Core Features

-   **Advanced Search:** Search for podcasts, episodes, or people across the entire database.
-   **User Authentication & Profiles:** Secure sign-up/sign-in, profile management, and contribution tracking.
-   **Comprehensive Admin Panel:** A powerful dashboard for admins to manage content, users, API keys, and site settings.
-   **Data Contribution System:** A guided workflow for users to submit new podcasts via their YouTube playlists.
-   **AI-Powered SEO:** Automated generation of SEO-friendly metadata and slugs for better search engine visibility.
-   **Dynamic Rankings:** Data-driven rankings for podcasts and episodes based on real-time metrics.
-   **Community Reviews & Ratings:** A 10-star rating and review system for podcasts, episodes, and people.
-   **Light/Dark Mode:** A theme switcher for a personalized user experience.

## 3. Technology Stack

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **UI:** React, ShadCN UI
-   **Styling:** Tailwind CSS
-   **State Management:** React Context, TanStack Query for server state
-   **AI Integration:** Genkit (for Google Gemini)
-   **Backend & DB:** Supabase (Auth, Postgres, Storage, Edge Functions)
-   **Deployment:** Vercel (Recommended), or any Node.js compatible platform.

---

## 4. Local Setup Instructions

Follow these steps to run the PodDB Pro project on your local machine.

### Prerequisites

-   **Node.js:** Version 18.x or higher.
-   **npm:** Should be installed with Node.js.
-   **Supabase Account:** You need a free Supabase account to get your database and API keys.

### Step 1: Download All Files

Download the complete project folder from Firebase Studio to your local machine.

### Step 2: Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Once the project is set up, go to **Project Settings > API**.
3.  You will need the values from this page for the next step.

### Step 3: Set Up Environment Variables

1.  In the root directory of your downloaded project, create a new file named `.env`.
2.  Copy the contents of `.env.example` (if it exists) or add the following lines to your new `.env` file:

    ```env
    # Get from Supabase Project Settings -> API
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

    # (Optional) Fallback Gemini API Key for AI features
    # Get from Google AI Studio: https://aistudio.google.com/app/apikey
    # It is recommended to manage keys via the Admin Panel instead.
    NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
    ```

3.  Replace the placeholder values with your actual Supabase credentials.
    -   `your-supabase-url` -> Found in Project URL.
    -   `your-supabase-anon-key` -> Found in Project API keys (the `public` or `anon` key).
    -   `your-supabase-service-role-key` -> Found in Project API keys (the `service_role` key). **This is secret and crucial for admin features.**

### Step 4: Install Dependencies

Open a terminal in the project's root directory and run the following command to install all the necessary packages:

```bash
npm install
```

### Step 5: Run the Development Server

After the installation is complete, run this command to start the Next.js development server:

```bash
npm run dev
```

Your project should now be running at **[http://localhost:3000](http://localhost:3000)**.

---

## 5. Deployment Instructions

A Next.js application is not a simple collection of HTML files. It requires a special Node.js server environment to run. You cannot simply upload the files to a standard cPanel file manager. Here are the correct ways to deploy your application.

### Method 1: Vercel (Recommended)

Vercel is the company that created Next.js, and their hosting platform is perfectly optimized for it. It's the easiest and often fastest way to deploy.

1.  **Push to GitHub:** Create a new repository on [GitHub](https://github.com/) and push your project code to it.
2.  **Sign Up for Vercel:** Create a free account on [Vercel](https://vercel.com/) using your GitHub account.
3.  **Import Project:** In your Vercel dashboard, click "Add New... > Project" and select your GitHub repository.
4.  **Configure Environment Variables:** Vercel will detect it's a Next.js project. It will prompt you to add your environment variables. Add the same ones from your `.env` file (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).
5.  **Deploy:** Click the "Deploy" button. Vercel will handle everything: installing dependencies, building the project, and deploying it to a live URL.

### Method 2: cPanel with Node.js Support (Advanced)

This method only works if your hosting provider offers the **"Setup Node.js App"** feature in cPanel.

1.  **Check for Node.js Support:** Log in to your cPanel and look for an icon named "Setup Node.js App", "Application Manager", or similar. If you can't find it, your hosting plan may not support it, and you should use Vercel instead.

2.  **Create a Node.js Application:**
    *   Open the "Setup Node.js App" tool.
    *   Click "Create Application".
    *   Set the **Node.js version** to 18 or higher.
    *   Set the **Application mode** to "Production".
    *   Set the **Application root** to the folder where you will upload your project (e.g., `/home/username/your-app-folder`).
    *   Set the **Application URL** to your desired domain or subdomain.
    *   The **Application startup file** should be left blank for now. We will set it later.
    *   Click "Create".

3.  **Upload Your Project Files:**
    *   Go to the cPanel "File Manager".
    *   Navigate to the Application Root folder you specified above.
    *   Upload all your project files (including `src`, `public`, `package.json`, etc.) into this folder.

4.  **Install Dependencies and Build:**
    *   Go back to the "Setup Node.js App" tool.
    *   In your application's controls, find the option to **"Run NPM Install"**. Click it and wait for it to complete.
    *   Next, you need to run the build command. Open the terminal in cPanel (if available) or use the "Run JS Script" option in the Node.js app setup. Run the command: `npm run build`. This will create a `.next` folder with your production-ready app.

5.  **Configure and Start the App:**
    *   In the Node.js app setup, your startup file is `package.json`. The system will use the `npm start` command.
    *   Ensure your `package.json` has the correct start script: `"start": "next start"`.
    *   Add your environment variables (`SUPABASE_URL`, etc.) in the "Environment Variables" section of the Node.js app setup.
    *   Click "Restart" or "Start App".

Your application should now be live on your domain. If you encounter issues, check the application logs provided in the cPanel tool.

---

## 6. Folder Structure

The project follows a standard Next.js App Router structure.

```
podd-b-pro/
│
├── public/               # Static assets (logos, images)
├── src/
│   ├── app/              # Main application routes (App Router)
│   │   ├── (main)/       # Route group for main pages
│   │   ├── admin/        # Admin dashboard pages and components
│   │   ├── api/          # API routes
│   │   └── ...           # Other routes
│   ├── components/       # Reusable React components (UI, custom)
│   ├── content/          # Static content (e.g., help articles, legal text)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party service clients (Supabase)
│   ├── lib/              # Utility functions and libraries
│   ├── middleware.ts     # Next.js middleware (e.g., for maintenance mode)
│   └── types/            # TypeScript type definitions
│
├── supabase/             # Supabase-specific files
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migration scripts
│
├── .env                  # Environment variables (you need to create this)
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
└── tailwind.config.ts    # Tailwind CSS configuration
```

## 7. Architectural Decisions

-   **Next.js App Router:** Chosen for improved performance, nested layouts, and default Server Component architecture.
-   **Server Actions:** Used for most form submissions and data mutations to avoid creating separate API endpoints, simplifying the codebase.
-   **ShadCN UI:** Provides a set of high-quality, unstyled components that are fully customizable with Tailwind CSS, ensuring a consistent and professional look.
-   **Supabase:** Acts as a complete backend-as-a-service, handling database, authentication, storage, and serverless functions, which significantly speeds up development.
-   **Genkit:** Provides a structured way to interact with AI models, making it easy to manage prompts, schemas, and AI-powered workflows like SEO generation.

## 8. Contributing

While this is a project managed within Firebase Studio, the principles of good software development apply. When adding new features:
-   **Create Reusable Components:** Place new components in `src/components/`.
-   **Define New Pages:** Add new pages within the `src/app/` directory.
-   **Use Server Actions:** For new logic that mutates data, create server actions in `src/app/actions/`.
-   **Update Database with Migrations:** If you need to change the database schema, create a new migration file in `supabase/migrations/`.
