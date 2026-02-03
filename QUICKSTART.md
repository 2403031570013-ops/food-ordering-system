# 🚀 Quick Start Guide

Get the Food Ordering Application up and running in 5 minutes!

## Step 1: Clone & Navigate
```bash
cd food-ordering-system
```

## Step 2: MongoDB Setup (2 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a cluster (Free M0 tier)
4. Create a database user
5. Copy connection string and replace `<password>` with your password

## Step 3: Configure Environment

### Backend Configuration
Copy `.env.example` to `.env` in `server/` folder:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your MongoDB URI:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodOrderingDB
JWT_SECRET=any_random_string_at_least_32_characters_long
```

### Frontend Configuration
Create `.env.local` in root folder:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
```

## Step 4: Install & Run

### Terminal 1 - Backend Server
```bash
cd server
npm install
npm run seed    # Populate database with sample data
npm run dev     # Start server on port 5000
```

**Expected Output:**
```
Food Ordering API Server running on http://localhost:5000
```

### Terminal 2 - Frontend App
```bash
npm install
npm run dev     # Start on http://localhost:5173
```

**Expected Output:**
```
Local: http://localhost:5173/
```

## Step 5: Test the Application

1. Open browser: `http://localhost:5173`
2. Click "Sign Up" and create account
3. Browse restaurants and foods
4. Add items to cart
5. View cart and proceed to checkout

## 🗄️ Database Seeding

The seed script populates 4 restaurants with 12 food items:

- **Taj Hotel** - North Indian cuisine
- **Dragon Palace** - Chinese cuisine
- **Burger King** - Fast Food
- **Sweet Dreams Bakery** - Desserts

## 📝 Test Login

After creating account, you can login with same credentials.

## 🛠️ Troubleshooting

### Problem: MongoDB Connection Error
**Solution**: 
- Verify MONGO_URI is correct
- Add your IP to MongoDB Atlas network access
- Check username and password

### Problem: API 404 Errors
**Solution**:
- Ensure backend is running on port 5000
- Check frontend VITE_API_URL matches backend URL
- Restart both servers

### Problem: Port Already in Use
**Solution**:
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Or use different ports
PORT=5001 npm run dev  # Backend
npm run dev            # Frontend (auto-selects available port)
```

## 📱 Features to Try

- ✅ Browse restaurants and foods
- ✅ Add items to cart
- ✅ View cart and order summary
- ✅ Create user account
- ✅ Login with credentials
- ✅ Glassmorphism animations
- ✅ Location-based restaurant discovery

## 🎯 Next Steps

1. **Payment Integration**: Add Stripe/Razorpay
2. **Email Notifications**: Configure Nodemailer
3. **Admin Dashboard**: Manage restaurants and foods
4. **Real-time Updates**: WebSocket for order tracking
5. **Google Maps**: Display restaurant locations

## 📚 Documentation

- [Full Setup Guide](./SETUP_GUIDE.md)
- [API Documentation](./API_DOCS.md) (if available)
- [Component Documentation](./COMPONENT_DOCS.md) (if available)

## 🆘 Need Help?

- Check backend console for errors (Terminal 1)
- Check browser console for errors (F12)
- Verify .env files have correct values
- Ensure MongoDB cluster is active

---

**You're all set! Happy ordering! 🍽️**
