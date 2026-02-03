# Food Ordering System - MERN Application

A modern, production-ready food ordering web application built with React, Express, MongoDB, and Node.js. Features real-time order tracking, user authentication with JWT and OTP, location-based restaurant discovery, and a beautiful glassmorphism UI.

## 🌟 Features

### Frontend
- **Modern UI/UX**: Glassmorphism design with smooth Framer Motion animations
- **Authentication**: JWT-based login/signup with OTP password reset
- **Location Services**: Geolocation-based restaurant discovery
- **Food Catalog**: Browse foods by category, price, and rating
- **Shopping Cart**: Add/remove items, manage quantities, calculate totals
- **State Management**: Zustand for lightweight, efficient state management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Toast notifications and loading states

### Backend
- **RESTful APIs**: Complete CRUD operations for foods, hotels, and orders
- **Authentication**: Secure JWT tokens with 7-day expiration
- **Password Recovery**: OTP-based password reset via email
- **Validation**: Input validation with express-validator
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing with bcryptjs

## 📋 Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB Atlas account (free tier available)
- VS Code or any code editor

## 🚀 Setup Instructions

### 1. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (select Free M0 tier)
4. Create a database user with username and password
5. Add your IP address to network access
6. Copy the connection string

### 2. Environment Variables

Create `.env` files in both frontend and backend directories:

**Server `.env` (food-ordering-system/server/.env)**:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodOrderingDB
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
PORT=5000
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

**Frontend `.env` (food-ordering-system/.env.local)**:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Backend Setup

```bash
cd food-ordering-system/server

# Install dependencies
npm install

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd ../  # Go back to food-ordering-system directory

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173` or `http://localhost:5174`

## 📁 Project Structure

```
food-ordering-system/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.jsx      # Navigation bar with cart
│   │   ├── FoodCard.jsx    # Food item display card
│   │   └── HotelCard.jsx   # Restaurant card with location
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page with food grid
│   │   ├── Login.jsx       # User login
│   │   ├── Signup.jsx      # User registration
│   │   └── Cart.jsx        # Shopping cart
│   ├── context/            # React context (legacy)
│   ├── utils/              # Utility functions
│   │   └── helpers.js      # Validation, formatting, calculations
│   ├── api.js              # Axios API client with JWT interceptor
│   ├── store.js            # Zustand state management
│   ├── index.css           # Tailwind + custom styles
│   └── App.jsx             # Main app component
├── server/
│   ├── models/             # Database schemas
│   │   ├── User.js         # User schema with auth
│   │   ├── Food.js         # Food items schema
│   │   ├── Hotel.js        # Restaurant schema with geolocation
│   │   ├── Order.js        # Order tracking
│   │   └── OTP.js          # OTP for password reset
│   ├── routes/             # API endpoints
│   │   ├── authRoutes.js   # Authentication endpoints
│   │   ├── foodRoutes.js   # Food CRUD operations
│   │   ├── hotelRoutes.js  # Restaurant endpoints with location
│   │   └── orderRoutes.js  # Order management
│   ├── seed.js             # Database seeding script
│   ├── index.js            # Server entry point
│   └── .env                # Environment variables
├── package.json            # Frontend dependencies
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS plugins
└── README.md              # This file
```

## 🔐 Authentication Flow

1. **Signup**: User creates account with email/password
   - Password hashed with bcryptjs
   - JWT token generated (7-day expiration)
   
2. **Login**: User logs in with credentials
   - Token stored in localStorage
   - Token added to all API requests via interceptor
   
3. **Forgot Password**: User resets password
   - OTP sent to email
   - OTP expires after 10 minutes
   - Password updated after verification

## 🍕 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password

### Foods
- `GET /api/foods` - List all foods (with filters)
- `GET /api/foods/:id` - Get food details
- `POST /api/foods` - Create food (admin)
- `PUT /api/foods/:id` - Update food (admin)
- `DELETE /api/foods/:id` - Delete food (admin)

### Hotels/Restaurants
- `GET /api/hotels` - List restaurants (with location filter)
- `GET /api/hotels/:id` - Get restaurant with menu
- `POST /api/hotels` - Create restaurant (admin)
- `PUT /api/hotels/:id` - Update restaurant (admin)
- `DELETE /api/hotels/:id` - Delete restaurant (admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

## 🎨 Design System

### Color Scheme
- **Primary**: Orange (#EA580C) - CTA and highlights
- **Secondary**: Sky Blue (#3B82F6) - Links and accents
- **Neutral**: Slate gray - Text and backgrounds

### Components
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Animations**: Smooth transitions with Framer Motion
- **Icons**: Lucide React for consistent iconography
- **Typography**: Clear hierarchy with bold headings

## 🧪 Testing the Application

### Test User Accounts

After running seed script, use these test restaurants and foods:
- **Taj Hotel**: North Indian cuisine (Mumbai)
- **Dragon Palace**: Chinese cuisine (Mumbai)
- **Burger King**: Fast food (Mumbai)
- **Sweet Dreams Bakery**: Desserts (Mumbai)

Each restaurant has 3-4 signature dishes to browse and add to cart.

### Sample User Flow

1. Visit `http://localhost:5173`
2. Click "Sign Up" to create account
3. Browse restaurants and foods
4. Add items to cart
5. Checkout and place order
6. View in cart page

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

## 🔧 Technology Stack

**Frontend**:
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 3.4.1
- Framer Motion 10.16.19
- Zustand 4.4.7
- Axios 1.6.2
- Lucide React 0.294.0
- React Router DOM 7.13.0

**Backend**:
- Express 4.18.2
- MongoDB & Mongoose 7.8.8
- JWT 9.1.2
- Bcryptjs 2.4.3
- Nodemailer 6.9.7
- Express-validator 7.0.0
- CORS 2.8.5

## 🚨 Troubleshooting

### "MongoDB connection failed"
- Check MongoDB Atlas IP whitelist
- Verify MONGO_URI format with correct password
- Ensure network access is enabled

### "API calls returning 404"
- Verify backend is running on port 5000
- Check VITE_API_URL matches backend URL
- Restart both servers

### "Styles not applying"
- Clear node_modules and reinstall: `npm install`
- Rebuild Tailwind: `npm run build`

### "OTP not received"
- OTP currently logs to console (mock)
- Check browser console for OTP value
- Implement real email in production

## 📚 Additional Features to Implement

- Payment gateway integration (Stripe/Razorpay)
- Real email notifications via Nodemailer
- Order tracking with real-time updates
- User reviews and ratings
- Favorites/wishlist system
- Admin dashboard
- Google Maps integration
- Search and advanced filters

## 📄 License

MIT License - feel free to use for personal and commercial projects

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first to discuss proposed changes.

## 📞 Support

For issues and questions:
1. Check existing issues on GitHub
2. Create new issue with detailed description
3. Include error logs and screenshots

---

**Happy Ordering! 🍽️**
