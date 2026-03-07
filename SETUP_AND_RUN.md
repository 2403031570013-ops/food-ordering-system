# FoodHub - Setup & Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation Steps

#### 1. Backend Setup
```bash
cd server
npm install
```

#### 2. Frontend Setup
```bash
# From the main project directory
npm install
```

#### 3. Environment Configuration

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority
JWT_SECRET=foodhub_super_secret_jwt_key_2024_secure_token_min_32_characters_long
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_SB9SHW6PTpQhkp
```

---

## Running the Application

### Option 1: Development Mode (Recommended)

**Terminal 1 - Backend Server**
```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 - Frontend Development**
```bash
npm run dev
# Frontend will start on http://localhost:5173
```

Visit: **http://localhost:5173**

### Option 2: Production Build

**Build Frontend**
```bash
npm run build
# Creates optimized build in dist/
```

**Run Backend (Production)**
```bash
cd server
npm start
# Server runs on port 5000
```

---

## Database Initialization

The application automatically seeds demo data on first run if the database is empty.

**Manual Seed (if needed)**
```bash
cd server
npm run seed
```

### Demo Credentials
- **Admin Email:** demo@foodhub.com
- **Admin Password:** Demo@123

### Sample Restaurants (Auto-Seeded)
1. **Midnight Munchies** - Pizza & Burgers (4.8★)
2. **Bombay Biryani House** - Indian & Biryani (4.5★)
3. **Dragon Bowl** - Chinese (4.6★)
4. **Spice Villa** - North Indian & Tandoor (4.7★)
5. **Sweet Bliss Cafe** - Desserts & Coffee (4.9★)

---

## Project Structure

```
FoodHub/
├── server/                          # Backend (Express.js + MongoDB)
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── Hotel.js (Restaurants)
│   │   ├── Food.js
│   │   ├── Order.js
│   │   └── ...
│   ├── routes/                      # API endpoints
│   │   ├── authRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── foodRoutes.js
│   │   └── ...
│   ├── middleware/                  # Auth & CORS
│   ├── config/                      # Passport & DB config
│   ├── seed/                        # Demo data seeders
│   ├── index.js                     # Server entry point
│   └── package.json
│
├── src/                             # Frontend (React + Vite)
│   ├── components/                  # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── RestaurantCard.jsx
│   │   ├── FoodCard.jsx
│   │   └── ...
│   ├── pages/                       # Page components
│   │   ├── Home.jsx
│   │   ├── RestaurantMenu.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── ...
│   ├── store.js                     # Zustand state management
│   ├── api.js                       # API client configuration
│   ├── App.jsx                      # Main app component
│   └── main.jsx
│
├── package.json                     # Frontend dependencies
└── vite.config.js                   # Vite configuration
```

---

## Key Features Tested

- ✅ Restaurant Listing (Approved restaurants only)
- ✅ Menu Display with Food Items
- ✅ Search & Filter by Cuisine
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Cart Management
- ✅ User Authentication
- ✅ Admin Dashboard
- ✅ Restaurant Partner Dashboard
- ✅ Razorpay Payment Integration (Test Mode)

---

## Troubleshooting

### Issue: Restaurants Not Showing
- Check MongoDB connection: `MONGO_URI` in .env
- Ensure backend is running on port 5000
- Check browser console for API errors
- Try: `npm run seed` to populate demo data

### Issue: CORS Errors
- Verify `FRONTEND_URL` in backend .env
- Check `VITE_API_URL` in frontend .env
- Both should match your local URLs (localhost:5173 and localhost:5000)

### Issue: Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
# OR
nc -z localhost 5000
```

### Issue: MongoDB Connection Failed
- Verify IP whitelist: https://cloud.mongodb.com/v2
- Check credentials in `.env`
- Ensure cluster is active
- Try connection string directly in MongoDB Compass

---

## Deployment

### Deploy to Render (Recommended)

1. **Create Render Account** - https://render.com
2. **Connect GitHub Repository**
3. **Create Web Service**
   - Build Command: `cd server && npm install && cd .. && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Environment Variables: Add all from .env

4. **Deploy Frontend to Vercel/Netlify**
   - Connect repository
   - Build Command: `npm run build`
   - Publish Directory: `dist`

---

## API Endpoints

### Restaurants
- `GET /api/hotels` - List all approved restaurants
- `GET /api/hotels/:id` - Get restaurant with menu
- `POST /api/hotels` - Create restaurant (Admin)

### Food Items
- `GET /api/foods` - List all food items
- `GET /api/foods?hotelId=xxx` - Get items for restaurant
- `POST /api/foods` - Add food item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - User's orders
- `PUT /api/orders/:id` - Update order status

### Auth
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout

---

## Performance Optimization

✅ Code splitting with Vite
✅ Lazy loading components with React.lazy
✅ Image optimization with unsplash CDN
✅ MongoDB indexing on frequently queried fields
✅ Rate limiting on API endpoints
✅ Helmet.js for security headers
✅ XSS protection & data sanitization

---

## Security Notes

- JWT tokens expire in 7 days
- Passwords are bcrypt hashed
- MongoDB password sanitized against injection attacks
- XSS protection enabled
- CORS properly configured
- Helmet security headers enabled
- Rate limiting: 1000 requests per 10 minutes

---

## Support & Next Steps

1. **Test all features** in development mode
2. **Check browser console** for any warnings
3. **Monitor server logs** for errors
4. **Review API responses** in Network tab
5. **Test on different devices** for responsive design

---

**v1.0.0** - March 2026
Last Updated: March 7, 2026
