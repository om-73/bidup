# Redis Setup Guide for Bidup on Vercel

## What is Redis?
Redis is a fast database that stores your auction pastes and bid data. Without it, your data disappears when the app restarts.

## Quick Setup with Upstash Redis (Free & Recommended)

### Step 1: Create Free Upstash Account
- Visit: https://upstash.com
- Click **Sign Up**
- Verify your email

### Step 2: Create Redis Database
1. Go to Upstash Console
2. Click **Create Database**
3. Configure:
   - **Database Name**: `bidup` (or any name)
   - **Region**: Choose closest to your Vercel region
   - **Type**: Redis
4. Click **Create**

### Step 3: Get Connection String
1. Click on your database name in the list
2. Look for **Connect** button (top right)
3. In the dropdown, select **Node.js** or **Redis CLI**
4. Copy the URL - it looks like:
   ```
   redis://default:AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ@us1-pleasant-chipmunk-12345.upstash.io:6379
   ```

### Step 4: Add to Vercel Environment Variables
1. Go to https://vercel.com
2. Click your **bidup** project
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)
5. Click **Add New**
6. Fill in:
   ```
   Name:  REDIS_URL
   Value: [Paste your URL from Step 3]
   Environments: Select all (Production, Preview, Development)
   ```
7. Click **Save**

### Step 5: Redeploy
Vercel will automatically redeploy your app with the new environment variable.

### Step 6: Verify
- Check your Vercel deployment logs for "Connected to Redis"
- The Redis warning should be gone
- Your data will now persist across deployments

## Alternative: Local Development

If you want to test locally with real Redis:

### Install Redis (Mac)
```bash
brew install redis
brew services start redis
```

### Update Local .env
```
REDIS_URL=redis://localhost:6379
USE_REDIS_MOCK=false
```

### Run Locally
```bash
npm run dev
```

## Upstash Free Tier Limits
- **Storage**: 10GB
- **Commands**: 10,000 per day
- Perfect for testing and small projects

## Pricing After Free Tier
- Pay only for what you use
- Very affordable for hobby projects

## Support
- Upstash Docs: https://upstash.com/docs
- Vercel Docs: https://vercel.com/docs/environment-variables
