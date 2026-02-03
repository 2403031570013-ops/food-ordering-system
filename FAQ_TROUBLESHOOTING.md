# Frequently Asked Questions & Troubleshooting

## 🔴 Common Issues & Solutions

### Database Connection Issues

**Q: "MongoDB Connection Error" or "ECONNREFUSED"**
A: 
1. Check your MongoDB Atlas connection string in `.env`
2. Add your IP address to MongoDB Atlas network access:
   - Go to Security → Network Access
   - Add your current IP (or 0.0.0.0 for dev only)
3. Ensure password in URI is correctly URL-encoded
4. Verify MongoDB cluster is active (not paused)

**Q: "ERR_SYS_ADMIN_LEVEL"**
A: Your database user doesn't have admin privileges. Create new user with proper permissions in MongoDB Atlas.

---

### API Connection Issues

**Q: "Cannot POST /api/auth/register" (404 errors)**
A:
1. Verify backend server is running on port 5000
2. Check console shows: "Food Ordering API Server running on http://localhost:5000"
3. Check frontend `.env.local` has correct `VITE_API_URL`
4. Restart both servers

**Q: "CORS error: Access to XMLHttpRequest blocked"**
A:
1. Backend CORS is configured for localhost:5173
2. If using different port, update server `index.js` CORS settings
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

**Q: "ERR_INVALID_URL"**
A: Check `.env.local` in frontend directory has `VITE_API_URL=http://localhost:5000/api` (without trailing slash on /api)

---

### Port Issues

**Q: "EADDRINUSE: address already in use :::5000"**
A:
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port
PORT=5001 npm run dev
```

**Q: Frontend won't start on port 5173**
A: Vite auto-finds available port. Check terminal output for actual port number (might be 5174, 5175, etc.)

---

### Authentication Issues

**Q: "Invalid credentials" even with correct email/password**
A:
1. Password is case-sensitive - verify caps lock is off
2. Email must exactly match registered email
3. Ensure backend seed ran successfully
4. Check database has user record in MongoDB Atlas

**Q: "Token expired" after login**
A:
1. Tokens expire after 7 days
2. Logout and login again to get new token
3. Refresh page to reload token from localStorage

**Q: "OTP not received in email"**
A:
1. OTP system currently logs to backend console
2. Check terminal 1 (backend) for OTP value
3. Copy OTP from console and paste in frontend
4. To implement real email: configure Nodemailer in backend

---

### Cart & Checkout Issues

**Q: Cart items disappear after refresh**
A:
1. Check localStorage is enabled in browser
2. Open DevTools → Application → LocalStorage
3. Look for `cart-store` entry
4. If missing, items weren't properly saved

**Q: Cart shows items but quantity won't change**
A:
1. Make sure you're clicking +/- buttons, not just viewing
2. Check browser console for errors
3. Verify Zustand store is properly initialized

---

### Frontend Styling Issues

**Q: Tailwind styles not applying (no colors/spacing)**
A:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Q: Glassmorphism cards look solid white, not transparent**
A:
1. Check tailwind.config.js was created successfully
2. Verify `.glass-morphism` class exists in index.css
3. Clear browser cache (Ctrl+Shift+Delete)

**Q: Images not showing (broken image icons)**
A:
1. Unsplash URLs might be blocked by firewall
2. Check Network tab in DevTools for 403/blocked requests
3. Alternatively, use local images in public folder

---

### Database Seeding Issues

**Q: "npm ERR! ERR! Cannot find module 'mongoose'"**
A:
```bash
cd server
npm install
npm run seed  # Try again
```

**Q: Seed script runs but no data appears**
A:
1. Check MongoDB connection is working
2. Verify database name is "foodOrderingDB" in connection string
3. Check MongoDB Atlas has active cluster
4. Try viewing collections in MongoDB Atlas directly

**Q: "Duplicate key error" when running seed twice**
A:
1. Seed clears existing data first
2. If error persists, manually clear collections in MongoDB Atlas
3. Or change seed to use `insertMany` instead of deleteMany

---

### Performance Issues

**Q: Application is very slow to load**
A:
1. Check Network tab for slow image loads
2. Disable browser extensions (especially ad blockers)
3. Open DevTools and check Console for errors
4. Verify MongoDB Atlas cluster isn't overloaded

**Q: API requests take 5+ seconds**
A:
1. Check MongoDB Atlas cluster stats
2. Verify internet connection speed
3. Check backend console for slow queries
4. Consider database indexing for large datasets

---

## ❓ General Questions

**Q: How do I change the port for backend/frontend?**
A:
```bash
# Backend: Create server/.env with
PORT=5001

# Frontend: Vite auto-selects available port
# Or modify vite.config.js server.port
```

**Q: Can I use a different database instead of MongoDB?**
A:
You'll need to:
1. Rewrite all schemas in different ORM (Prisma, TypeORM, etc.)
2. Update database connection in server/index.js
3. Migrate seed.js to new database format
4. Update models to new format

**Q: How do I deploy this application?**
A:
**Frontend:**
```bash
npm run build          # Create build
# Deploy dist/ folder to Vercel/Netlify
```

**Backend:**
- Deploy to Heroku, Railway, or AWS
- Set environment variables in hosting platform
- Update frontend VITE_API_URL to production server

**Q: How do I add more restaurants/foods?**
A:
1. Option 1: Modify seed.js and run `npm run seed`
2. Option 2: Create POST endpoint and use admin panel (not built yet)
3. Option 3: Manually insert via MongoDB Atlas UI

**Q: Can I change the colors?**
A:
Yes! Edit these files:
- `tailwind.config.js` - Change color values
- `src/index.css` - Update custom color classes
- Components - Update className colors

---

## 🆘 Still Having Issues?

### Debug Steps:

1. **Check Backend Console (Terminal 1)**
   - Look for error messages
   - Check database connection logs
   - Verify routes are registered

2. **Check Frontend Console (F12)**
   - Look for JavaScript errors
   - Check Network tab for API failures
   - Check Application tab for localStorage

3. **Verify Environment Files**
   - Backend: `server/.env` exists and has MONGO_URI
   - Frontend: `.env.local` exists and has VITE_API_URL
   - No missing or commented values

4. **Restart Everything**
   - Stop both servers (Ctrl+C)
   - Kill port processes if needed
   - npm install in both directories
   - Start fresh

5. **Check MongoDB Atlas**
   - Cluster is running (not paused)
   - Network access allows your IP
   - Database exists with correct name

### Gathering Error Information:

When asking for help, provide:
- Full error message from terminal
- Steps to reproduce
- Browser console screenshots
- Backend console logs
- Content of .env files (without passwords)
- Operating system (Windows/Mac/Linux)
- Node.js version (`node --version`)

---

## 📞 Getting Support

1. **Check Documentation**: QUICKSTART.md, SETUP_GUIDE.md
2. **Google Error Message**: Often finds stack overflow solutions
3. **Check MongoDB Atlas Docs**: Database-specific issues
4. **Check Express Docs**: Server-side issues
5. **Check React Docs**: Frontend-specific issues

---

## 💡 Pro Tips

1. **Use MongoDB Atlas UI** to manually check/edit data
2. **Keep backend terminal visible** to spot errors immediately
3. **Use React DevTools** to inspect component state
4. **Use VS Code REST Client** to test API endpoints
5. **Keep both servers running** in separate terminal tabs

---

**Last Updated:** January 2024
**Version:** 1.0.0
