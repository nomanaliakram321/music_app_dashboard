# Vercel Environment Variables Checklist

## Required Environment Variables in Vercel Dashboard

Go to: https://vercel.com/your-project/settings/environment-variables

### Frontend Variables (VITE\_ prefix - available in browser)

- ✅ `VITE_SUPABASE_URL` = `https://eqwromenzktewzvimljl.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ `VITE_API_URL` = `/api` (CRITICAL - Check if this is set!)

### Backend Variables (NO VITE\_ prefix - only available in API functions)

- ✅ `FIREBASE_PROJECT_ID` = `music-app-10f66`
- ✅ `FIREBASE_PRIVATE_KEY` = `"-----BEGIN PRIVATE KEY-----\n..."`
- ✅ `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@music-app-10f66.iam.gserviceaccount.com`

## Steps to Fix

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `VITE_API_URL` exists and is set to `/api`
3. If not, add it:
   - Name: `VITE_API_URL`
   - Value: `/api`
   - Environment: Production, Preview, Development (check all)
4. Click "Save"
5. Go to Deployments tab
6. Click "..." on latest deployment → "Redeploy"
7. Wait for deployment to complete
8. Test again

## How to Verify

After redeploying, open browser console on production and add an album. You should see:

```
=== FORM SUBMIT STARTED ===
Environment: production
VITE_API_URL: /api
[Upload] Form submitted, starting validation...
[NotificationClient] Initialized with API URL: /api
[NotificationClient] API URL: /api
[NotificationClient] Full URL: /api/notifications/send
```

If you see `VITE_API_URL: undefined`, the environment variable is not set correctly in Vercel.
