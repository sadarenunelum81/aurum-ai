# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Deployment

This is a standard Next.js application and can be deployed to any hosting provider that supports Next.js. Here are instructions for two popular free hosting services.

### General Requirements

Before deploying, you will need to set up your environment variables on your chosen hosting provider. You can find these values in your local `.env` file.

**Required Environment Variables:**

*   `GEMINI_API_KEY`: Your API key for Google Gemini.
*   `IMAGEBB_API_KEY`: Your API key for ImageBB image hosting.
*   `PROJECT_URL`: The full public URL of your deployed website (e.g., `https://your-project.vercel.app`). This is crucial for cron jobs to work correctly.
*   `CRON_SECRET`: The secret key used to secure your cron job endpoint.

### Option 1: Deploying to Vercel

Vercel is the creator of Next.js and provides a seamless deployment experience.

1.  **Sign Up**: Create a free account at [vercel.com](https://vercel.com).
2.  **Import Project**: From your Vercel dashboard, click "Add New... > Project".
3.  **Connect Git Repository**: Connect your GitHub, GitLab, or Bitbucket account and select the repository for this project.
4.  **Configure Project**: Vercel will automatically detect that this is a Next.js project and configure the build settings for you.
5.  **Add Environment Variables**: In the "Environment Variables" section, add the required variables listed above.
6.  **Deploy**: Click the "Deploy" button. Your site will be built and deployed automatically.

### Option 2: Deploying to Netlify

Netlify is another excellent platform with a great free tier for hosting modern web applications.

1.  **Sign Up**: Create a free account at [netlify.com](https://netlify.com).
2.  **Import Project**: From your Netlify dashboard, click "Add new site > Import an existing project".
3.  **Connect Git Repository**: Connect your Git provider and select your project's repository.
4.  **Build Settings**: Netlify should auto-detect the Next.js settings. If not, the build command is `next build` and the publish directory is `.next`.
5.  **Add Environment Variables**: Go to your site's "Site configuration > Build & deploy > Environment" section and add the required environment variables listed above.
6.  **Deploy**: Click "Deploy site". Netlify will build and deploy your application.

<!-- Trigger rebuild 01/04/2026 05:30:03 -->
