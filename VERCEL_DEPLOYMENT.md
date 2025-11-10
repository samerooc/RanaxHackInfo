# Vercel Deployment Guide - RanaxHack Info App

## Quick Deploy Steps (आसान तरीका)

### Option 1: Vercel CLI से Deploy करें

1. **Vercel CLI Install करें:**
```bash
npm install -g vercel
```

2. **Login करें:**
```bash
vercel login
```

3. **Project Deploy करें:**
```bash
vercel
```

4. **Production में Deploy करें:**
```bash
vercel --prod
```

### Option 2: Vercel Dashboard से Deploy करें

1. **GitHub/GitLab Repository बनाएं:**
   - अपना code GitHub या GitLab पर push करें

2. **Vercel Dashboard:**
   - https://vercel.com पर जाएं
   - "New Project" पर क्लिक करें
   - अपना repository select करें
   - "Import" पर क्लिक करें

3. **Configuration (Automatic):**
   - Vercel automatically `vercel.json` को detect कर लेगा
   - Build command: `npm run build`
   - Output directory: `dist/public`

4. **Deploy:**
   - "Deploy" बटन पर क्लिक करें
   - आपकी site कुछ मिनटों में live हो जाएगी!

## Important Files Created

यह files Vercel deployment के लिए बनाई गई हैं:

1. **`vercel.json`** - Vercel configuration file
   - Build settings
   - API routes configuration
   - Rewrites for SPA routing

2. **`/api/number-info/[phoneNumber].ts`** - Phone lookup serverless function
3. **`/api/family-detail/[aadhaar].ts`** - Aadhaar lookup serverless function
4. **`.vercelignore`** - Files jo deploy में नहीं जाएंगे

## Environment Variables (ज़रूरी)

Vercel Dashboard में जाकर Settings > Environment Variables में add करें:

**Required:**
- `DATABASE_URL` - Your PostgreSQL database connection string
  - Neon/Supabase/Vercel Postgres या कोई भी PostgreSQL database URL
  - Example: `postgresql://user:password@host:5432/dbname`
  - **महत्वपूर्ण:** Access key validation के लिए यह ज़रूरी है
  
**Setup करने के steps:**
1. Vercel Dashboard में अपना project खोलें
2. Settings > Environment Variables में जाएं
3. `DATABASE_URL` variable add करें
4. Database connection string paste करें
5. Production, Preview, और Development सभी में enable करें
6. Save करें और redeploy करें

**Database के लिए options:**
- **Neon** (Recommended): https://neon.tech - Free PostgreSQL database
- **Vercel Postgres**: Direct integration with Vercel
- **Supabase**: https://supabase.com - Free tier available
- या कोई भी PostgreSQL database

**Note:** सारे API endpoints अब directly database से connect करते हैं। Replit backend की ज़रूरत नहीं है।

## Testing Before Deploy

Local testing के लिए:
```bash
npm run dev
```

Browser में खोलें: http://localhost:5000

## Post-Deployment

Deploy होने के बाद आपको मिलेगा:
- Production URL: `https://your-project-name.vercel.app`
- Automatic HTTPS
- Global CDN
- Instant deployments

## Custom Domain (Optional)

Vercel Dashboard में:
1. Project Settings > Domains
2. अपना domain add करें
3. DNS records update करें

## Troubleshooting

**Build Failed?**
- Check `package.json` में सभी dependencies हैं
- Verify build command: `npm run build` काम कर रही है locally

**API Routes काम नहीं कर रहे?**
- Check `/api` folder सही तरीके से बनी है
- Verify function names और paths

**404 Errors?**
- `vercel.json` में rewrites check करें
- SPA routing के लिए index.html को serve करना ज़रूरी है

## Support

किसी problem के लिए:
- Vercel Logs check करें: Dashboard > Deployments > Logs
- Vercel Documentation: https://vercel.com/docs

---

Happy Deploying! 🚀
