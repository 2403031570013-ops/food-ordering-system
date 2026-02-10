const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy for HTTPS

// Middleware
const cors = require("cors");
app.use(cors()); // CORS must be first

const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Security Headers
app.use(helmet());

// Rate Limiting (Global increased for development: 1000 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10kb' })); // Body limit is strict to prevent DoS
app.use(express.urlencoded({ extended: true }));

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

app.use('/invoices', express.static('public/invoices')); // Serve invoices

// Passport Config
require('./config/passport');
const passport = require('passport');
app.use(passport.initialize());

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tlsAllowInvalidCertificates: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.warn("⚠️  Server will continue running without database connection.");
    console.warn("⚠️  Please check your MongoDB Atlas configuration:");
    console.warn("   1. Verify database user credentials");
    console.warn("   2. Whitelist your IP address (0.0.0.0/0 for development)");
    console.warn("   3. Check if the cluster is active");
  }
};

const { seedDemoData } = require('./seed/demoData');

connectDB().then(() => {
  seedDemoData();
});

// Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "Food Ordering API is running" });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/foods", require("./routes/foodRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes")); // Razorpay Payment Routes
app.use("/api/admin", require("./routes/adminRoutes")); // Admin Routes
app.use("/api/onboarding", require("./routes/onboardingRoutes")); // Restaurant Onboarding
console.log("Mounting Subscription Routes...");
app.use("/api/subscriptions", require("./routes/subscriptionRoutes")); // Premium Subscriptions
app.use("/api/restaurant", require("./routes/restaurantRoutes")); // Restaurant Order Management
app.use("/api/restaurant/reports", require("./routes/restaurantReportRoutes")); // Restaurant Reporting
app.use("/api/coupons", require("./routes/couponRoutes")); // Coupon Management
app.use("/api/admin/analytics", require("./routes/adminAnalyticsRoutes")); // Admin Analytics & BI

// Error Handling Middleware
// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || "UNKNOWN_ERROR",
    // In production, do NOT expose stack traces or env variables
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
    error_name: err.name,
    error_message: err.message,
    status_code: err.status || 500,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FoodHub Now API Server running on http://localhost:${PORT}`);

  // Start Monthly Report Cron
  const { startMonthlyCron } = require('./jobs/monthlyReport');
  startMonthlyCron();
});
