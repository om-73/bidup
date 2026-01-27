# Deployment Setup Guide

## Vercel Environment Variables Required

For your app to work on Vercel, you **MUST** set these environment variables in your Vercel dashboard:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com
2. Select your **bidup** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Each Variable

Add the following variables one by one. For each variable, set:
- **Environments**: Check all three boxes (Production, Preview, Development)

| Name | Value |
|------|-------|
| `REDIS_URL` | `rediss://default:AVjfAAIncDExNTgzMjk0YmQ4ZDg0ODU5YTgzZjgxM2U1ZGUxZDA0NXAxMjI3NTE@fond-hen-22751.upstash.io:6379` |
| `USE_REDIS_MOCK` | `false` |
| `NODE_ENV` | `production` |
| `BASE_URL` | `https://bidup-topaz.vercel.app` |

### Step 3: Save & Redeploy
1. After adding all variables, click **Save**
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Click **Redeploy** button

### Step 4: Wait for Deployment
- The deployment should take 2-3 minutes
- You'll see "✓ Ready" when complete
- Check the build logs if it fails

## Verify Deployment

After successful deployment:
1. Visit https://bidup-topaz.vercel.app
2. Create a paste
3. Try viewing it at `/p/PASTE_ID`

## Common Issues

### 404: DEPLOYMENT_NOT_FOUND
- **Cause**: Build failed or environment variables missing
- **Fix**: Check Vercel build logs, ensure all env vars are set

### WARNING: REDIS_URL not provided
- **Cause**: `REDIS_URL` env var not set in Vercel
- **Fix**: Add `REDIS_URL` to Vercel environment variables

### Data persists locally but not on Vercel
- **Cause**: `USE_REDIS_MOCK=true` in Vercel
- **Fix**: Change to `USE_REDIS_MOCK=false` and add real `REDIS_URL`

## Local Development

### Setup
```bash
cd /Users/omprakashsingh/Downloads/postbin-main
npm install
```

### Create .env file
```bash
cp .env.example .env
```

### Edit .env for local Redis (optional)
```
REDIS_URL=redis://localhost:6379
USE_REDIS_MOCK=false
```

Or keep mock for quick testing:
```
USE_REDIS_MOCK=true
```

### Run
```bash
npm start      # Production mode
npm run dev    # Development with auto-reload
```

### Test
Visit http://localhost:3000
