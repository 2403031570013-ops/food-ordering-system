# 🚀 1-Minute Deployment (YE COMMANDS RUN KARO)

## ✅ Build Complete!
Production build ready in `dist` folder.

---

## 🎯 Method 1: Vercel (EASIEST - 2 Commands)

### Step 1: Install Vercel
```bash
npm install -g vercel
```

### Step 2: Deploy (Browser mein login hoga automatically)
```bash
vercel
```

**Ye prompts aayenge**:
1. "Set up and deploy?" → **Y** (enter)
2. "Which scope?" → **Select your account** (arrow keys + enter)
3. "Link to existing project?" → **N** (enter)
4. "Project name?" → **foodhub** (ya koi bhi naam)
5. "In which directory is your code?" → **./** (enter)
6. "Want to override settings?" → **N** (enter)

**Done! 🎉** URL milega like: `https://foodhub-xyz.vercel.app`

---

## 🎯 Method 2: Netlify CLI

### Step 1: Install Netlify
```bash
npm install -g netlify-cli
```

### Step 2: Login
```bash
netlify login
```
(Browser open hoga, GitHub se login karo)

### Step 3: Deploy
```bash
netlify deploy --prod --dir=dist
```

**Done! 🎉** URL milega

---

## 🎯 Method 3: Netlify Drag & Drop (NO TERMINAL)

1. Browser mein jao: https://app.netlify.com/drop
2. `dist` folder ko drag karo
3. **DONE!** Instant deployment ✅

---

## ⚠️ Important: Backend bhi deploy karna hai

### Render.com pe Backend (5 minutes):
1. Jao: https://render.com
2. Sign up with GitHub
3. "New +" → "Web Service"
4. Repository select karo
5. Settings:
   ```
   Root Directory: server
   Build: npm install
   Start: npm start
   ```
6. Environment variables add karo (from server/.env)
7. Deploy!

### Backend URL milne ke baad:
Frontend ke `.env` mein update karo:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

Fir frontend dobara deploy karo:
```bash
vercel --prod
```

---

## 🎯 Quickest Way (Recommended)

**Right now, just run**:
```bash
vercel
```

Browser mein ek baar login karo, baaki automatic hai!

---

## ✅ Current Status

- [x] Frontend built ✅ (dist folder ready)
- [x] Backend running locally ✅
- [x] MongoDB connected ✅
- [x] Razorpay configured ✅
- [ ] Deploy frontend → **Run `vercel` command**
- [ ] Deploy backend → **Use Render.com**

---

**Total Time**: 5 minutes (2 min frontend + 3 min backend)

**EASIEST**: Just run `vercel` command! 🚀
