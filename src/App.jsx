import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword"; // Forgot Password
import Checkout from "./pages/Checkout"; // Checkout Page
import PaymentTest from "./pages/PaymentTest"; // Razorpay Test Page
import AdminDashboard from "./pages/AdminDashboard"; // Admin Dashboard
import RestaurantOnboarding from "./pages/RestaurantOnboarding"; // Restaurant Onboarding (Legacy)
import AdminOnboarding from "./pages/AdminOnboarding"; // Admin adds restaurant
import SelfOnboarding from "./pages/SelfOnboarding"; // Restaurant self-registration
import Pricing from "./pages/Pricing"; // Pricing/Subscription Page
import Profile from "./pages/Profile"; // Profile Page
import Orders from "./pages/Orders"; // Orders Page
import RestaurantDashboard from "./pages/RestaurantDashboard"; // Restaurant Partner Dashboard

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} /> {/* Checkout with Payment */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot Password */}
        <Route path="/payment-test" element={<PaymentTest />} /> {/* Test Razorpay */}

        {/* Pricing */}
        <Route path="/pricing" element={<Pricing />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />

        {/* Restaurant Dashboard */}
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/onboarding" element={<AdminOnboarding />} /> {/* Admin adds restaurant */}

        {/* Restaurant Onboarding */}
        <Route path="/partner-with-us" element={<SelfOnboarding />} /> {/* Self registration */}
        <Route path="/restaurant-onboarding" element={<RestaurantOnboarding />} /> {/* Legacy route */}
      </Routes>
    </>
  );
}

export default App;

