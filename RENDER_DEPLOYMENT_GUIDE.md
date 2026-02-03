# 🚀 BACKEND DEPLOYMENT - STEP BY STEP (5 Minutes)

## 📋 Copy These Values (You'll Need Them)

### Environment Variables (COPY THIS):
```
PORT=5000
MONGO_URI=mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority
JWT_SECRET=foodhub_super_secret_jwt_key_2024_secure_token_min_32_characters_long
RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp
RAZORPAY_KEY_SECRET=HEXfmmpvDCgU27tcZs3W9Ff6
NODE_ENV=production
FRONTEND_URL=https://your-netlify-site.netlify.app
```

---

## 🎯 RENDER.COM DEPLOYMENT (FREE - Follow Exactly)

### Step 1: Go to Render.com
**Open**: https://render.com

Click: **"Get Started for Free"** or **"Sign Up"**

---

### Step 2: Sign Up with GitHub
- Click **"GitHub"** button
- Authorize Render to access your repositories
- Done!

---

### Step 3: Create New Web Service
After login:
1. Click **"New +"** button (top right)
2. Select **"Web Service"**

---

### Step 4: Connect Repository

**Option A: If Repository is on GitHub:**
1. Select **"Build and deploy from a Git repository"**
2. Click **"Connect GitHub"** (if needed)
3. Find your repository: `food-ordering-system`
4. Click **"Connect"**

**Option B: If No Repository:**
1. First push code to GitHub
2. Then connect

---

### Step 5: Configure Service

Fill these EXACTLY:

**Name**: 
```
foodhub-backend
```

**Region**: 
- Select nearest (e.g., Singapore or Default)

**Branch**: 
```
main
```
(or `master` if that's your branch name)

**Root Directory**: 
```
server
```
⚠️ **IMPORTANT**: Type `server` - This tells Render to look inside server folder

**Build Command**: 
```
npm install
```

**Start Command**: 
```
npm start
```

---

### Step 6: Select Free Plan
- Instance Type: **Free** (should be selected by default)
- Click **"Advanced"** to add environment variables

---

### Step 7: Add Environment Variables

Click **"Add Environment Variable"** and add these **ONE BY ONE**:

1. **Key**: `PORT`  
   **Value**: `5000`

2. **Key**: `MONGO_URI`  
   **Value**: `mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority`

3. **Key**: `JWT_SECRET`  
   **Value**: `foodhub_super_secret_jwt_key_2024_secure_token_min_32_characters_long`

4. **Key**: `RAZORPAY_KEY_ID`  
   **Value**: `rzp_test_SB9SHW6PTpQhkp`

5. **Key**: `RAZORPAY_KEY_SECRET`  
   **Value**: `HEXfmmpvDCgU27tcZs3W9Ff6`

6. **Key**: `NODE_ENV`  
   **Value**: `production`

7. **Key**: `FRONTEND_URL`  
   **Value**: (Your Netlify URL - get it from `netlify status` command)

---

### Step 8: Create Web Service
1. Scroll down
2. Click **"Create Web Service"** (big button at bottom)
3. ⏳ **Wait 3-5 minutes** for deployment
4. Watch the logs - you'll see:
   - "Installing packages..."
   - "Starting service..."
   - "✅ MongoDB Connected Successfully"
   - "✅ Server running on port 5000"

---

### Step 9: Copy Your Backend URL

After deployment succeeds:
- Look at the top - you'll see: `https://foodhub-backend.onrender.com` (or similar)
- **COPY THIS URL!**

---

## ✅ Deployment Success!

Your backend is now LIVE! 🎉

---

## 🔄 NOW UPDATE FRONTEND

### Run these commands in terminal:

1. **Update .env file**:
```bash
# Open .env in your project root and update:
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
```

**Replace** `YOUR-BACKEND-URL.onrender.com` with actual URL from Render!

2. **Rebuild frontend**:
```bash
npm run build
```

3. **Redeploy to Netlify**:
```bash
netlify deploy --prod --dir=dist
```

---

## 🎯 UPDATE FRONTEND_URL in Render

**After frontend redeployed**:
1. Go back to Render.com
2. Click your service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Netlify URL
5. Click **"Save Changes"**
6. Service will auto-restart

---

## ✅ DONE!

Both frontend and backend are LIVE! 🚀

Test: Go to your Netlify site and try login!

---

## 🐛 If Errors Happen

### "Application failed to respond"
- Wait 2 minutes - free tier takes time to start
- Check logs in Render dashboard

### "MongoDB connection failed"
- Go to MongoDB Atlas
- Network Access → Add IP: `0.0.0.0/0`

### "CORS Error"
- Make sure FRONTEND_URL is correct in Render
- Should match your Netlify URL exactly

---

## 📞 Need Help?

After deployment, tell me:
1. Your backend URL
2. Any errors you see

I'll help fix! 💪

---

**Total Time**: ~5 minutes  
**Cost**: $0 (FREE tier)  
**Difficulty**: Easy ⭐⭐☆☆☆
