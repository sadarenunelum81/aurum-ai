# Cron Job Debugging Guide / Cron Job ගැටලු විසඳීමේ මාර්ගෝපදේශය

## ගැටලුව හඳුනාගැනීම (Problem Identification)

ඔබේ cron job එක fail වීමට හේතු 3ක් තිබිය හැක:

### 1. Environment Variables නැති වීම

- `CRON_SECRET` - Authorization සඳහා
- `GEMINI_API_KEY` හෝ `GOOGLE_GENAI_API_KEY` - AI generation සඳහා
- Firebase configuration variables

### 2. Firebase Admin User නැති වීම

- Firestore `users` collection එකේ `role: "admin"` සහිත user කෙනෙක් නැති විය හැක

### 3. Auto Blogger Configuration නැති වීම

- Admin panel එකේ Auto Blogger setup කර save කර නැති විය හැක

---

## විසඳුම් (Solutions)

### Step 1: Diagnostics Run කරන්න

පළමුව ඔබේ deployment එකේ තත්වය පරීක්ෂා කරන්න:

```bash
# Local එකේ test කරන්න (development server run වෙන වෙලාවෙ)
curl "http://localhost:9002/api/cron/diagnostics?secret=YOUR_CRON_SECRET"

# Production එකේ test කරන්න
curl "https://your-domain.vercel.app/api/cron/diagnostics?secret=YOUR_CRON_SECRET"
```

මෙය ඔබට පෙන්වයි:

- ✅ කොහේද pass වෙන්නේ
- ❌ කොහේද fail වෙන්නේ
- මොනවද නැති environment variables

### Step 2: Vercel Environment Variables සකසන්න

1. Vercel Dashboard එකට යන්න: https://vercel.com/dashboard
2. ඔබේ project එක select කරන්න
3. Settings > Environment Variables යන්න
4. මෙම variables add කරන්න:

```
CRON_SECRET=your_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**වැදගත්**: Variables add කළ පසු **Redeploy** කරන්න ඕනෑ!

### Step 3: Firebase Admin User එකක් Create කරන්න

ඔබේ Firebase Console එකට ගිහින්:

1. Firestore Database > `users` collection එක open කරන්න
2. ඔබේ user document එකක් open කරන්න
3. `role` field එක edit කරලා `"admin"` කරන්න

හෝ Firebase Console > Authentication හරහා login වෙලා ඔබේ app එකේ signup කරන්න. පළමු user එක automatically admin වෙනවා.

### Step 4: Auto Blogger Configuration Setup කරන්න

1. ඔබේ site එකේ admin panel එකට login වෙන්න
2. Auto Blogger Setup පිටුවට යන්න
3. සියලු settings fill කරලා **Save Configuration** click කරන්න

### Step 5: Cron Job Test කරන්න

```bash
# Production endpoint එක test කරන්න
curl -X POST "https://your-domain.vercel.app/api/cron?secret=YOUR_CRON_SECRET"
```

---

## Vercel Logs බලන්නේ කොහොමද

1. Vercel Dashboard > Your Project > Deployments
2. නවතම deployment එක click කරන්න
3. "View Function Logs" click කරන්න
4. `/api/cron` filter කරන්න

ඔබට දැන් විස්තරාත්මක logs පෙනෙයි:

- `=== CRON JOB STARTED ===`
- සෑම checkpoint එකක status එක (✓ හෝ ERROR)
- කොහේද fail වුණේ
- කුමන error message එකක්ද

---

## Common Errors සහ විසඳුම්

### Error: "CRON_SECRET is not set"

**විසඳුම**: Vercel Dashboard එකේ environment variables add කරන්න

### Error: "GEMINI_API_KEY is not set"

**විසඳුම**: Google AI Studio එකෙන් API key එකක් generate කරලා Vercel එකේ add කරන්න

### Error: "No admin user found"

**විසඳුම**: Firebase Firestore එකේ user document එකක `role: "admin"` set කරන්න

### Error: "Auto Blogger configuration not found"

**විසඳුම**: Admin panel එකෙන් Auto Blogger setup කරලා save කරන්න

### Error: "Unauthorized"

**විසඳුම**: cron-job.org එකේ URL එකේ `?secret=` parameter එක හරියට තියෙනවද බලන්න

---

## Cron-job.org Configuration

### Method 1: URL Parameter (Recommended)

```
https://your-domain.vercel.app/api/cron?secret=your_secret_here
```

### Method 2: Authorization Header

URL:

```
https://your-domain.vercel.app/api/cron
```

Headers:

```
Authorization: Bearer your_secret_here
```

**වැදගත්**: HTTP Method එක **POST** කරන්න ඕනෑ!

---

## දැන් කරන්න ඕනෑ

1. ✅ Changes commit කර push කරන්න
2. ✅ Vercel environment variables verify කරන්න
3. ✅ Vercel එකේ redeploy කරන්න
4. ✅ Diagnostics endpoint එක run කරන්න
5. ✅ Logs බලලා issues fix කරන්න
6. ✅ Cron job එක test කරන්න

---

## Support

ප්‍රශ්න තිබේ නම්:

1. Diagnostics output එක copy කරන්න
2. Vercel function logs copy කරන්න
3. Screenshot එකක් ගන්න
4. මට එවන්න විස්තරාත්මක උදව්වක් සඳහා
