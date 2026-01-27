# Render Deployment Instructions

## Environment Variables to Set in Render Dashboard

Go to your Render service dashboard and add these environment variables:

| Key | Value |
|-----|-------|
| `REDIS_URL` | `rediss://default:AVjfAAIncDExNTgzMjk0YmQ4ZDg0ODU5YTgzZjgxM2U1ZGUxZDA0NXAxMjI3NTE@fond-hen-22751.upstash.io:6379` |
| `BASE_URL` | `https://bidup.onrender.com` |
| `USE_REDIS_MOCK` | `false` |
| `NODE_ENV` | `production` |

## How to Add Variables in Render

1. Go to https://dashboard.render.com
2. Select your **bidup** service
3. Click **Environment** (in the left sidebar)
4. Click **Add Environment Variable**
5. Add each variable from the table above
6. Click **Save**
7. Render will auto-redeploy with new variables

## Test Your Deployment

Once variables are set and deployment completes:

```bash
# Test homepage
curl https://bidup.onrender.com

# Create a paste (example)
curl -X POST https://bidup.onrender.com/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from Render!",
    "title": "Test Paste",
    "max_views": 5,
    "expires_at": null
  }'

# View a paste at
https://bidup.onrender.com/p/PASTE_ID
```

## Verify Everything Works

1. ✅ Visit https://bidup.onrender.com
2. ✅ Create a new paste
3. ✅ View the paste at `/p/PASTE_ID`
4. ✅ Check Redis is connected (no warnings in logs)
5. ✅ Create another paste and verify it persists after refresh

## Free Tier Notes

- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- For production use, upgrade to paid plan
- Upgrade to Paid: Service Dashboard → Plan → Select Plan

## Logs

Check deployment logs:
1. Go to https://dashboard.render.com
2. Select **bidup** service
3. Click **Logs** tab
4. Look for "Connected to Redis" message

If you see warnings about Redis, it means `REDIS_URL` isn't set properly.
