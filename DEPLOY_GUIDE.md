# 🚀 Quick Deployment Guide

## Current Status
- ✅ Backend: Running on `http://localhost:5000`
- ✅ Frontend: Running on `http://localhost:5173`
- ✅ MongoDB: Connected
- ✅ Razorpay: Latest keys configured
- ✅ All features: Implemented & tested

---

## 🌐 Deploy to Production (5 Steps)

### Step 1: Deploy Backend (Render.com) - FREE

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. **Configuration**:
   ```
   Name: foodhub-backend
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

6. **Environment Variables** (Click "Advanced"):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp
   JWT_SECRET=foodhub_super_secret_jwt_key_2024_secure_token_min_32_characters_long
   RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp
   RAZORPAY_KEY_SECRET=HEXfmmpvDCgU27tcZs3W9Ff6
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.netlify.app
   ```

7. Click "Create Web Service"
8. **Wait 3-5 minutes** for deployment
9. **Copy your backend URL** (e.g., `https://foodhub-backend.onrender.com`)

---

### Step 2: Update Frontend Environment

1. Create `.env` file in project root (not in server folder):
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp
   ```

2. Replace `https://your-backend-url.onrender.com` with actual URL from Step 1

---

### Step 3: Build Frontend

```bash
# From project root
npm run build
```

This creates a `dist` folder with production-ready files.

---

### Step 4: Deploy Frontend (Netlify) - FREE

**Option A: Drag & Drop (Easiest)**
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder
3. Done! Get your URL like `https://random-name.netlify.app`

**Option B: GitHub Auto-Deploy**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub → Select repository
4. **Build settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. **Environment variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp
   ```
6. Click "Deploy"

---

### Step 5: Update Backend with Frontend URL

1. Go back to Render.com → Your backend service
2. Click "Environment" tab
3. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
4. Save changes (auto-redeploys)

---

## ✅ Deployment Complete!

Your app is now live at:
- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://your-backend.onrender.com`

### Test Everything:
1. Open frontend URL
2. Try login/signup
3. Test forgot password
4. Try restaurant onboarding
5. Test payment flow

---

## 🔧 Alternative: Vercel (One Command)

```bash
# Install Vercel CLI
npm install -g vercel

# From project root
vercel

# Follow prompts
# Add environment variables when asked
```

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "Cannot connect"
**Fix**: Check `.env` file - make sure `VITE_API_URL` is correct

### Issue: Payment not working
**Fix**: Verify Razorpay keys in both backend and frontend

### Issue: "CORS Error"
**Fix**: Update `FRONTEND_URL` in backend .env to match your Netlify URL

### Issue: MongoDB connection error
**Fix**: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

---

## 📱 Custom Domain (Optional)

### Netlify:
1. Go to Domain Settings
2. Add custom domain
3. Follow DNS setup instructions

### Both Frontend & Backend:
- Use same domain with subdomains:
  - `app.yourdomain.com` → Frontend
  - `api.yourdomain.com` → Backend

---

## 🔐 Security Checklist

Before going live:
- [ ] Change JWT_SECRET to unique value
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled (automatic on Netlify/Render)
- [ ] Rate limiting enabled (optional)
- [ ] Input validation working
- [ ] Error messages don't expose sensitive data

---

## 📊 Monitor Your App

### Render (Backend):
- View logs in real-time
- Monitor performance
- Auto-restarts on crashes

### Netlify (Frontend):
- Analytics dashboard
- Deploy previews for branches
- Instant rollbacks

---

## 💰 Cost: FREE

- **Render Free Tier**: 750 hours/month
- **Netlify Free Tier**: 100GB bandwidth
- **MongoDB Atlas Free**: 512MB storage

**Perfect for testing and demo!**

---

## 🎉 You're Live!

Share your app:
```
🔗 Live Demo: https://your-app.netlify.app
📱 Test Credentials:
   - Create account or use Google login
   - Admin access: Create via createAdmin.js
```

---

**Deployment Time**: ~10 minutes  
**Cost**: $0 (Free tier)  
**Difficulty**: Easy ⭐⭐☆☆☆

**Need help?** Check `READY_FOR_DEPLOYMENT.md` for full details!
