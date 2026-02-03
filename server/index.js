const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy for HTTPS

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

connectDB();

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
app.use("/api/subscriptions", require("./routes/subscriptionRoutes")); // Premium Subscriptions

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || "UNKNOWN_ERROR",
    details: err.stack,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Food Ordering API Server running on http://localhost:${PORT}`);
});
