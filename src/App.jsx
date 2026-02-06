import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Watermark from "./components/Watermark";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword"; // Forgot Password
import SelectRole from "./pages/SelectRole";
import UserOrders from "./pages/UserOrders"; // User Orders Page
import OrderSuccess from "./pages/OrderSuccess"; // Order Success Page
import Checkout from "./pages/Checkout"; // Checkout Page
import RestaurantMenu from "./pages/RestaurantMenu"; // Restaurant Menu Page

import AdminDashboard from "./pages/AdminDashboard"; // Admin Dashboard
import AdminRestaurants from "./pages/AdminRestaurants"; // Admin Restaurant Management
import AdminPayments from "./pages/AdminPayments"; // Admin Payments
import RestaurantOnboarding from "./pages/RestaurantOnboarding"; // Restaurant Onboarding (Legacy)
import AdminOnboarding from "./pages/AdminOnboarding"; // Admin adds restaurant
import SelfOnboarding from "./pages/SelfOnboarding"; // Restaurant self-registration
import Pricing from "./pages/Pricing"; // Pricing/Subscription Page
import Profile from "./pages/Profile"; // Profile Page
import RestaurantDashboard from "./pages/RestaurantDashboard"; // Restaurant Partner Dashboard

function App() {
  return (
    <>
      <Watermark />
      <Navbar />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantMenu />} /> {/* Restaurant Stats & Menu */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<UserOrders />} /> {/* My Orders Page */}
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/checkout" element={<Checkout />} /> {/* Checkout with Payment */}
          <Route path="/login" element={<Login />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot Password */}


          {/* Pricing */}
          <Route path="/pricing" element={<Pricing />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />



          {/* Restaurant Dashboard */}
          <Route
            path="/restaurant-dashboard"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Restaurant Dashboard (Alias) */}
          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Restaurant Orders (Alias to Dashboard) */}
          <Route
            path="/restaurant/orders"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/onboarding"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRestaurants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />

          {/* Restaurant Onboarding */}
          <Route path="/partner-with-us" element={<SelfOnboarding />} /> {/* Self registration */}
          <Route path="/restaurant-onboarding" element={<RestaurantOnboarding />} /> {/* Legacy route */}
        </Routes>
      </div>
    </>
  );
}

export default App;

