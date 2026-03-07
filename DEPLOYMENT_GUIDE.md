# FoodHub - Production Deployment Checklist & Configuration

## Pre-Deployment Checklist

### Backend (Node.js + Express + MongoDB)

- [ ] **Environment Variables Set**
  - [ ] MONGO_URI (production MongoDB Atlas)
  - [ ] JWT_SECRET (strong, random 32+ chars)
  - [ ] NODE_ENV=production
  - [ ] RAZORPAY_KEY_ID and SECRET (live keys)
  - [ ] GOOGLE_CLIENT_ID and SECRET
  - [ ] Proper error logging configured

- [ ] **Database**
  - [ ] MongoDB Atlas cluster active and accessible
  - [ ] IP whitelist includes deployment server IP
  - [ ] Database backups configured
  - [ ] Indexes created on frequently queried fields

- [ ] **Security Hardening**
  - [ ] Helmet enabled for security headers
  - [ ] Rate limiting configured appropriately
  - [ ] CORS origin set to production domain
  - [ ] XSS protection enabled
  - [ ] Data sanitization for NoSQL injection

- [ ] **Monitoring & Logging**
  - [ ] Error logging service configured (Sentry, LogRocket, etc.)
  - [ ] Performance monitoring enabled
  - [ ] Database slow query logs configured

### Frontend (React + Vite)

- [ ] **Build Process**
  - [ ] npm run build - completes without errors
  - [ ] No console warnings in bundled code
  - [ ] Source maps disabled in production
  - [ ] Bundle size optimized

- [ ] **Environment Configuration**
  - [ ] VITE_API_URL points to production backend
  - [ ] VITE_RAZORPAY_KEY_ID uses live/production key
  - [ ] No development URLs hardcoded

- [ ] **Deployment Assets**
  - [ ] Favicon configured
  - [ ] PWA manifest updated
  - [ ] Meta tags optimized for SEO
  - [ ] Analytics configured (Google Analytics, etc.)

- [ ] **Testing**
  - [ ] All routes test successfully
  - [ ] API calls use correct endpoints
  - [ ] Payment flow tested (TEST MODE first)
  - [ ] Mobile responsiveness verified

---

## Production Environment Variables

### Backend .env (Production)

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodapp?retryWrites=true&w=majority

# Security
JWT_SECRET=your_super_secret_key_minimum_32_characters_here_make_it_random

# Frontend URL (Production)
FRONTEND_URL=https://yourdomain.com

# Payment Gateway (LIVE MODE)
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=rzp_live_YOUR_LIVE_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here

# Email (Optional)
SMTP_EMAIL=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_app_password

# App Settings
APP_URL=https://yourdomain.com
SEED_DATABASE=false
```

### Frontend .env (Production)

```env
# Development (your local machine)
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp

# Production (deployed URL)
VITE_API_URL=https://api.yourdomain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
```

---

## Deployment Options

### Option A: Deploy Both Frontend & Backend to Render

#### Backend on Render
1. Sign up at https://render.com
2. Create New Web Service
3. Connect GitHub Repository (server folder)
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all from .env
5. Deploy

#### Frontend on Render
1. Create New Static Site
2. Connect GitHub Repository (frontend folder)
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Deploy

### Option B: Deploy Backend to Render, Frontend to Vercel

#### Backend: Render (as above)
- Create Web Service on Render
- Add connection string from Render dashboard to frontend

#### Frontend: Vercel
1. Sign up at https://vercel.com
2. Import GitHub Repository
3. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:** `VITE_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy

### Option C: Docker Containerization (Advanced)

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Domain & SSL Setup

### For Render Deployment
1. Render provides free SSL by default
2. Add custom domain in Render Dashboard settings
3. Update DNS records (CNAME to Render)

### For Self-Hosted
1. Use Let's Encrypt for free SSL
2. Install & configure Certbot
3. Auto-renewal with Certbot

---

## Database Backup & Recovery

### MongoDB Atlas Backup
1. Log into MongoDB Atlas
2. Go to Project → Backup
3. Enable Automatic Backup (Daily)
4. Test restore process regularly

### Manual Backup
```bash
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/database"
```

### Restore from Backup
```bash
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/database" dump/
```

---

## Monitoring & Analytics

### Frontend Monitoring
- **Google Analytics** for user behavior
- **Sentry** for error tracking
- **LogRocket** for session replay

### Backend Monitoring
- **Sentry** for backend errors
- **New Relic** for performance monitoring
- **Datadog** for infrastructure monitoring

### Integration Example (Sentry)
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project-id",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

---

## Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build -- --analyze

# Expected bundle size: < 500KB gzipped
```

### Backend
- Enable MongoDB compression
- Use connection pooling
- Configure proper logging
- Set up caching (Redis optional)

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/srv-xxx?key=${{ secrets.RENDER_DEPLOY_KEY }}
```

---

## Testing Checklist

### Functional Testing
- [ ] User signup/login works
- [ ] Restaurant listing displays correctly
- [ ] Search and filter functionality works
- [ ] Food items load with images
- [ ] Cart add/remove operations function
- [ ] Checkout process completes
- [ ] Payment gateway integration (TEST MODE first)
- [ ] Order confirmation email sends
- [ ] Admin dashboard accessible
- [ ] Restaurant dashboard functional

### Performance Testing
- [ ] Page load time < 2 seconds (First Contentful Paint)
- [ ] API responses < 500ms
- [ ] Mobile performance score > 80
- [ ] Lighthouse score > 80

### Security Testing
- [ ] SQL/NoSQL injection attempts fail
- [ ] XSS prevention working
- [ ] CSRF tokens validated
- [ ] Authentication required for protected routes
- [ ] Admin-only actions require admin role
- [ ] Sensitive data not logged

---

## Incident Management

### If Issues Occur Post-Deployment

1. **Immediate Actions**
   - Check server logs
   - Monitor error tracking service (Sentry)
   - Check database connectivity
   - Review recent code changes

2. **Rollback Procedure**
   - Revert to last known good commit
   - Redeploy from backup
   - Document incident

3. **Prevention**
   - Implement better testing
   - Use staging environment
   - Gradual rollout (10% → 50% → 100%)

---

## Cost Estimation (Monthly)

### Render
- Backend Web Service: ~$12 (minimum)
- Database backups: Included

### MongoDB Atlas
- Shared tier (free): 512 MB
- M2 tier: ~$9/month
- M5 tier: ~$57/month

### Vercel (Optional)
- Free tier: Included
- Pro: $20/month

### Domain
- .com domain: ~$12/year
- Email hosting: ~$5-6/month

**Total Minimum: ~$50-60/month**

---

## Support & Escalation

### Getting Help
1. Check server logs on Render/your host
2. Review MongoDB Atlas metrics
3. Check GitHub Actions deployment logs
4. Review error tracking service (Sentry)
5. Community: Stack Overflow tag solution

### Recommended VPS Hosting (Alternative)
- DigitalOcean ($5-20/month)
- Linode ($5-20/month)
- AWS Lightsail ($3.50-5/month)

---

**Last Updated:** March 7, 2026
**Version:** 1.0.0
