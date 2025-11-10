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

## Environment Variables (अगर ज़रूरत हो)

Vercel Dashboard में जाकर Settings > Environment Variables में add करें:
- कोई भी API keys
- Database URLs (अगर use कर रहे हैं)

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
