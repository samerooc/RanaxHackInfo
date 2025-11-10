# Vercel Deployment Fix - Access Key Problem

## Problem (समस्या)
Vercel पर deploy करने के बाद access key काम नहीं कर रही है।

## Solution (समाधान)

### Step 1: Database Environment Variable Set करें

1. **Vercel Dashboard खोलें:**
   - https://vercel.com/dashboard पर जाएं
   - अपना project select करें

2. **Settings में जाएं:**
   - Settings > Environment Variables

3. **DATABASE_URL Add करें:**
   ```
   Key: DATABASE_URL
   Value: <your-database-connection-string>
   ```
   
   **अगर आपके पास database नहीं है**, तो Neon से free database लें:
   - https://neon.tech पर जाएं
   - Free account बनाएं
   - New Project बनाएं
   - Connection string copy करें
   - Vercel में paste करें

4. **Environment को Select करें:**
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   - सभी को enable करें!

5. **Save करें**

### Step 2: Database Tables Create करें

Database में tables बनाने के लिए:

```sql
-- Access Keys Table
CREATE TABLE access_keys (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  max_daily_searches INTEGER,
  username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Key Usage Table
CREATE TABLE key_usage (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key_id VARCHAR NOT NULL REFERENCES access_keys(id),
  search_date DATE NOT NULL,
  search_count INTEGER NOT NULL DEFAULT 0
);

-- Users Table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Search History Table
CREATE TABLE search_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key_id VARCHAR NOT NULL REFERENCES access_keys(id),
  search_type TEXT NOT NULL,
  search_query TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Step 3: Test Access Keys Insert करें

```sql
-- Master Key (Unlimited)
INSERT INTO access_keys (key, type, username) 
VALUES ('YOUR_MASTER_KEY_HERE', 'unlimited', 'MASTER_KEY');

-- Permanent Key
INSERT INTO access_keys (key, type, username) 
VALUES ('YOUR_PERMANENT_KEY_HERE', 'permanent', 'PERMANENT_KEY');

-- Limited Keys (10/day)
INSERT INTO access_keys (key, type, max_daily_searches) 
VALUES 
  ('TEST_KEY_001', 'limited_daily', 10),
  ('TEST_KEY_002', 'limited_daily', 10),
  ('TEST_KEY_003', 'limited_daily', 10);
```

### Step 4: Redeploy करें

1. **Vercel Dashboard में:**
   - Deployments tab में जाएं
   - Latest deployment के तीन dots (...) पर click करें
   - "Redeploy" select करें
   - या simply `git push` करें

2. **Deployment Complete होने का Wait करें**
   - Usually 1-2 minutes लगते हैं

### Step 5: Test करें

1. अपनी Vercel site खोलें: `https://your-app.vercel.app`
2. Access key enter करें: `TEST_KEY_001`
3. "Initialize Access" button click करें
4. ✅ अब काम करना चाहिए!

## Quick Database Setup (तेज़ तरीका)

**Neon Database (Recommended):**
1. https://neon.tech पर जाएं
2. Sign up करें (Free)
3. New Project बनाएं
4. Connection string copy करें
5. Vercel में `DATABASE_URL` में paste करें
6. Neon के SQL Editor में ऊपर के SQL queries run करें
7. Redeploy करें

## Troubleshooting

**अभी भी काम नहीं कर रहा?**

1. **Browser Console Check करें:**
   - F12 दबाएं
   - Console tab देखें
   - कोई error है?

2. **Vercel Logs Check करें:**
   - Dashboard > Project > Deployments
   - Latest deployment पर click करें
   - "Functions" tab देखें
   - Error logs check करें

3. **Database Connection Test करें:**
   - अपने database में manually query run करें:
   ```sql
   SELECT * FROM access_keys LIMIT 1;
   ```
   - अगर error आती है, तो DATABASE_URL गलत है

## Important Notes

- ✅ DATABASE_URL ज़रूरी है - without this access keys काम नहीं करेंगी
- ✅ Tables create करना ज़रूरी है - empty database से काम नहीं होगा
- ✅ Test keys insert करना ज़रूरी है - at least 1 key database में होनी चाहिए
- ✅ Redeploy करना ज़रूरी है - environment variable add करने के बाद

---

**किसी और help के लिए Vercel deployment logs देखें!** 🚀
