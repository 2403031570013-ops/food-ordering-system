# 📚 Food Ordering System - Documentation Index

Welcome! This comprehensive guide will help you understand and run the complete Food Ordering application.

## 🚀 Getting Started (START HERE)

### If you have 5 minutes:
📖 **[QUICKSTART.md](./QUICKSTART.md)** - Fastest way to get up and running
- Install dependencies
- Configure environment
- Seed database
- Start both servers

### If you have 15 minutes:
📖 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Comprehensive setup with details
- MongoDB Atlas setup
- Environment configuration
- Detailed installation steps
- Troubleshooting section

## 📖 Project Overview

### Understanding What Was Built
📖 **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete overview
- What's been implemented
- Project structure
- Design system
- Security features
- Testing checklist

### API Reference
📖 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Detailed API endpoints
- Authentication endpoints
- Food endpoints
- Restaurant endpoints
- Order endpoints
- Error handling

## 🎯 Quick Navigation

### Frontend Files
```
src/
├── pages/
│   ├── Home.jsx ..................... Landing page with food grid
│   ├── Login.jsx .................... User login page
│   ├── Signup.jsx ................... User registration page
│   └── Cart.jsx ..................... Shopping cart with order summary
├── components/
│   ├── Navbar.jsx ................... Top navigation with cart
│   ├── FoodCard.jsx ................. Food item display card
│   └── HotelCard.jsx ................ Restaurant card component
├── api.js ........................... Axios client with JWT interceptor
├── store.js ......................... Zustand state management
└── utils/helpers.js ................. Utility functions
```

### Backend Files
```
server/
├── routes/
│   ├── authRoutes.js ................ Authentication endpoints
│   ├── foodRoutes.js ................ Food CRUD operations
│   ├── hotelRoutes.js ............... Restaurant endpoints
│   └── orderRoutes.js ............... Order management
├── models/
│   ├── User.js ...................... User schema with auth
│   ├── Food.js ...................... Food items schema
│   ├── Hotel.js ..................... Restaurant schema
│   ├── Order.js ..................... Order tracking
│   └── OTP.js ....................... OTP verification
├── middleware/
│   └── auth.js ...................... JWT verification
├── seed.js .......................... Database seeding
└── index.js ......................... Express server
```

## 🔧 Configuration Files

### Frontend
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind theme customization
- `postcss.config.js` - CSS processing
- `.env.example` - Environment template
- `vite.config.js` - Vite configuration

### Backend
- `server/package.json` - Backend dependencies
- `server/.env.example` - Backend env template
- `server/.env` - Actual environment variables

## 🌟 Key Features

### Authentication
✅ User signup with email validation
✅ Secure login with JWT tokens
✅ Password reset with OTP
✅ 7-day token expiration
✅ Password hashing with bcryptjs

### Food Browsing
✅ Grid display of food items
✅ Filter by category (Indian, Chinese, Fast Food, Dessert)
✅ Price range slider
✅ Star ratings and reviews
✅ Vegetarian/Vegan indicators
✅ Real Unsplash images

### Restaurant Discovery
✅ Location-based filtering
✅ Geolocation support
✅ Operating hours display
✅ Distance calculation
✅ Delivery time estimates

### Shopping Cart
✅ Add/remove items
✅ Quantity management
✅ Automatic calculations
✅ Tax and delivery fees
✅ Order summary

### User Experience
✅ Glassmorphism UI design
✅ Smooth animations
✅ Responsive design
✅ Loading states
✅ Error handling
✅ Toast notifications

## 📊 Database Schema

### User
- Email (unique)
- Password (hashed)
- Name
- Phone
- Addresses (array)
- Role (user/admin)

### Food
- Name
- Description
- Category
- Price
- Image
- Rating
- Available status
- Dietary info (vegetarian, vegan)
- Nutrition facts

### Hotel
- Name
- Location (geospatial)
- Address
- Operating hours
- Phone & Email
- Cuisine types
- Delivery info
- Rating & Reviews

### Order
- Order ID
- User reference
- Items (array)
- Totals (subtotal, tax, delivery fee)
- Status tracking
- Delivery address
- Payment info

## 🧪 Testing the Application

### Test Flow
1. **Signup** - Create new account
2. **Login** - Use credentials to login
3. **Browse** - Explore restaurants and foods
4. **Add to Cart** - Add items to shopping cart
5. **View Cart** - Review items and total
6. **Checkout** - Proceed to payment (not implemented yet)

### Sample Data
After running seed script:
- 4 restaurants
- 12 food items
- Realistic prices, ratings, and images

## 🚨 Troubleshooting Guide

### Connection Issues
- **MongoDB Error**: Check MONGO_URI in .env and network access
- **API 404**: Verify backend is running on port 5000
- **Port Already in Use**: Kill process with `npx kill-port 5000`

### Authentication Issues
- **Token Expired**: Refresh page or logout/login again
- **OTP Not Received**: Check browser console (currently logs OTP)
- **Login Fails**: Verify email and password match

### Frontend Issues
- **Styles Not Applied**: Clear node_modules and reinstall
- **API Calls Failing**: Check VITE_API_URL in .env.local
- **Cart Not Persisting**: Check localStorage in DevTools

## 📈 Performance Tips

- Use Chrome DevTools Network tab to monitor API calls
- Check Application tab to view localStorage and session storage
- Monitor React rendering with React DevTools extension
- Use MongoDB Atlas dashboard to monitor database performance

## 🔐 Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens for authentication
- ✅ CORS configured
- ✅ Input validation on all routes
- ✅ Protected routes with middleware
- ✅ Sensitive data in .env files
- ✅ OTP verification for password reset

## 📱 Responsive Breakpoints

- Mobile (< 640px): Single column layout
- Tablet (640px - 1024px): 2-3 column layout
- Desktop (> 1024px): Full multi-column layout

## 🎨 Design System

### Color Palette
- Primary: Orange (#EA580C)
- Secondary: Sky Blue (#3B82F6)
- Neutral: Slate gray (#475569)

### Typography
- Heading: Xl (20px) to 5Xl (48px)
- Body: Sm (14px) to Lg (18px)
- Monospace: Courier for code

### Components
- Glassmorphism cards
- Gradient buttons
- Animated transitions
- Icon buttons with Lucide React

## 📚 Additional Resources

### Technologies Used
- **React 19.2** - UI framework
- **Vite 7.2** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Framer Motion 10.16** - Animations
- **Zustand 4.4** - State management
- **Express 4.18** - Backend framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

### Useful Commands

```bash
# Frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter

# Backend
npm install          # Install dependencies
npm run dev          # Start with nodemon
npm run seed         # Populate database
npm start            # Start production server
```

## 🚀 Deployment (Future)

### Frontend Deployment
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or Firebase
- Set environment variables in platform

### Backend Deployment
- Deploy to: Heroku, Railway, or AWS
- Configure MongoDB Atlas connection
- Set production environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

Need help? Check these resources:
1. Read relevant documentation file
2. Check troubleshooting section
3. Review API documentation
4. Check browser console for errors
5. Review backend logs

## ✅ Verification Checklist

Before considering setup complete:
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected successfully
- [ ] Database seeded with sample data
- [ ] Can create user account
- [ ] Can login with credentials
- [ ] Foods visible on home page
- [ ] Can add items to cart
- [ ] Cart calculations correct
- [ ] Navigation works properly
- [ ] Responsive on mobile screen

---

## 📖 Documentation Files Summary

| File | Purpose | Read Time |
|------|---------|-----------|
| QUICKSTART.md | 5-minute setup | 5 min |
| SETUP_GUIDE.md | Comprehensive setup | 15 min |
| IMPLEMENTATION_SUMMARY.md | What was built | 10 min |
| API_DOCUMENTATION.md | API reference | 20 min |
| This file | Navigation guide | 5 min |

---

**Start with QUICKSTART.md and follow the steps. You'll be up and running in minutes!**

Happy ordering! 🍽️

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
