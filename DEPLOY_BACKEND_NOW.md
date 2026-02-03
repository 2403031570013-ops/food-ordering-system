# 🎯 QUICK REFERENCE - Backend Deployment

## ✅ YOUR NETLIFY SITE
**URL**: Check with `netlify status` or go to dashboard

---

## 🚀 BACKEND DEPLOYMENT STEPS (5 Minutes)

### 📝 **STEP 1**: Open `RENDER_DEPLOYMENT_GUIDE.md`
- **ALL INSTRUCTIONS** are there
- **EXACT VALUES** to copy-paste
- **SCREENSHOTS** would help but follow exactly

---

### 📝 **STEP 2**: Go to https://render.com
- Sign up with GitHub
- Free tier - No credit card needed

---

### 📝 **STEP 3**: Create Web Service
**Important Settings**:
```
Root Directory: server
Build Command: npm install
Start Command: npm start
```

---

### 📝 **STEP 4**: Environment Variables

**COPY-PASTE THESE** (from RENDER_DEPLOYMENT_GUIDE.md):
- All 7 variables are listed
- Just copy-paste one by one

⚠️ **IMPORTANT**: For `FRONTEND_URL`, get your Netlify URL first!

**To get Netlify URL**:
```bash
netlify status
```
Look for "Project URL" or run:
```bash
netlify open:site
```

---

### 📝 **STEP 5**: Wait for Deployment (3-5 min)
Watch the logs:
- Installing packages... ✅
- Starting server... ✅
- MongoDB Connected... ✅
- Server running... ✅

---

### 📝 **STEP 6**: Copy Backend URL
Example: `https://foodhub-backend-abc123.onrender.com`

---

## 🔄 AFTER BACKEND DEPLOYED

### Update Frontend and Redeploy

**Run these commands** (I'll prepare them):

1️⃣ **Create new .env with backend URL**:
```bash
# I'll update this after you give me backend URL
```

2️⃣ **Rebuild**:
```bash
npm run build
```

3️⃣ **Redeploy**:
```bash
netlify deploy --prod --dir=dist
```

---

## ✅ FINAL STEP

Update `FRONTEND_URL` in Render:
1. Go to Render dashboard
2. Click your service
3. Environment tab
4. Update FRONTEND_URL to your Netlify URL
5. Save (auto-restarts)

---

## 🎉 DONE!

Both sites LIVE and connected! 🚀

---

## 📞 **TELL ME WHEN DONE**

After backend deploys, give me:
1. **Backend URL** from Render
2. **Netlify URL** (if you don't have it)

I'll give you exact commands to connect them! 💪

---

**Next**: Follow `RENDER_DEPLOYMENT_GUIDE.md` step by step!
