# 🎯 ADMIN & RESTAURANT ONBOARDING SYSTEM - COMPLETE GUIDE

## ✅ **What's Been Created:**

### **Backend APIs:**
1. ✅ **Admin Routes** (`/api/admin/*`)
   - Dashboard stats
   - User management
   - Hotel/Restaurant management  
   - Order management
   - Approval system

2. ✅ **Onboarding Routes** (`/api/onboarding/*`)
   - Restaurant self-registration
   - Application status check

3. ✅ **Middleware** 
   - Authentication middleware
   - Admin role protection

4. ✅ **Models**
   - Order model
   - Updated Hotel model with onboarding fields

### **Frontend Pages:**
1. ✅ **Admin Dashboard** (`/admin`)
   - Stats cards (users, restaurants, orders, revenue)
   - Quick action buttons
   - Recent orders table

2. ✅ **Restaurant Onboarding** (`/partner-with-us`)
   - Multi-section registration form
   - Cuisine selection
   - Legal information (FSSAI, GST)
   - Success confirmation

---

## 🚀 **HOW TO USE:**

### **1. Admin Access:**

**Create Admin User (First Time):**

```bash
# Open MongoDB compass or mongo shell
# Update a user to make them admin:

db.users.updateOne(
  { email: "admin@foodhub.com" },
  { $set: { role: "admin" } }
)
```

**Or create via API:**
```javascript
// In server/routes/authRoutes.js, when registering:
// Add role field to User model if not exists
```

**Access Admin Dashboard:**
```
1. Login with admin credentials
2. Navigate to: http://localhost:5173/admin
3. View dashboard with stats and management options
```

---

### **2. Restaurant Onboarding Flow:**

**Step 1: Restaurant Owner Visits:**
```
URL: http://localhost:5173/partner-with-us
```

**Step 2: Fill Registration Form:**
- Restaurant Information
- Contact Details
- Complete Address
- Cuisine Types
- Description
- Legal Documents (optional)

**Step 3: Submit Application:**
- Application goes to "pending" status
- Admin receives notification (future enhancement)
- Restaurant owner gets confirmation

**Step 4: Admin Approval:**
- Admin logs into dashboard
- Reviews pending applications
- Approves/Rejects restaurants

**Step 5: Restaurant Goes Live:**
- Approved restaurants appear on homepage
- Can start receiving orders

---

## 📊 **Admin Dashboard Features:**

### **Statistics:**
```
✅ Total Users Count
✅ Total Restaurants
✅ Total Orders
✅ Total Revenue (from completed orders)
✅ Pending Orders Count
✅ Completed Orders Count
```

### **Management Options:**
```
✅ Manage Users - View all users, delete if needed
✅ Manage Restaurants - Approve/reject, view details
✅ Manage Orders - Update status, track orders
```

### **Recent Activity:**
```
✅ Last 5 orders displayed
✅ Order details (customer, restaurant, amount, status)
✅ Quick view/action buttons
```

---

## 🔐 **API Endpoints:**

### **Admin Routes** (Protected - Admin Only):

```
GET  /api/admin/dashboard/stats
     - Get dashboard statistics

GET  /api/admin/users
     - Get all users

GET  /api/admin/hotels
     - Get all restaurants

PUT  /api/admin/hotels/:id/approve
     Body: { approved: true/false }
     - Approve or reject restaurant

DELETE /api/admin/users/:id
     - Delete a user

GET  /api/admin/orders
     - Get all orders

PUT  /api/admin/orders/:id/status
     Body: { status: "confirmed" }
     - Update order status
```

### **Onboarding Routes** (Public):

```
POST /api/onboarding/restaurant
     Body: { restaurantName, ownerName, email, phone, address, city, cuisine, ... }
     - Submit restaurant onboarding application

GET  /api/onboarding/status/:email
     - Check application status by email
```

---

## 🎨 **Frontend Routes:**

```
/admin                  - Admin Dashboard (protected)
/partner-with-us        - Restaurant Onboarding Form
/admin/users           - User Management (future)
/admin/restaurants     - Restaurant Management (future)
/admin/orders          - Order Management (future)
```

---

## 💡 **Usage Examples:**

### **Example 1: Restaurant Self-Registration**

```javascript
// Restaurant owner fills form and submits:
POST http://localhost:5000/api/onboarding/restaurant
Content-Type: application/json

{
  "restaurantName": "Tasty Bites",
  "ownerName": "John Doe",
  "email": "tastybites@example.com",
  "phone": "+91 98765 43210",
  "address": "123 Food Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "cuisine": ["Indian", "Chinese"],
  "description": "Best food in town!",
  "fssaiLicense": "12345678901234",
  "gstNumber": "27AABCU9603R1ZM"
}

// Response:
{
  "message": "Application submitted successfully!",
  "hotel": {
    "id": "64abc123...",
    "name": "Tasty Bites",
    "status": "pending"
  }
}
```

### **Example 2: Admin Approves Restaurant**

```javascript
// Admin reviews and approves:
PUT http://localhost:5000/api/admin/hotels/64abc123.../approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "approved": true
}

// Restaurant status changes to "active"
// Now visible on homepage
```

### **Example 3: Check Application Status**

```javascript
// Restaurant owner checks status:
GET http://localhost:5000/api/onboarding/status/tastybites@example.com

// Response:
{
  "restaurant": "Tasty Bites",
  "status": "approved",
  "approved": true,
  "appliedOn": "2026-02-02T10:30:00.000Z"
}
```

---

## 🔧 **Installation & Setup:**

### **Dependencies Already Installed:**
```
✅ express
✅ mongoose
✅ express-validator
✅ axios (frontend)
✅ framer-motion
✅ lucide-react
```

### **No Additional Installation Needed!**

Just restart the servers:

```bash
# Backend
cd server
npm start

# Frontend  
npm run dev
```

---

## 🎯 **Testing Checklist:**

### **Test Restaurant Onboarding:**
```
☐ Visit /partner-with-us
☐ Fill all required fields
☐ Select cuisine types
☐ Submit form
☐ See success message
☐ Check MongoDB - restaurant added with status "pending"
```

### **Test Admin Dashboard:**
```
☐ Create admin user in database
☐ Login with admin credentials
☐ Visit /admin
☐ See stats (users, restaurants, orders, revenue)
☐ View recent orders table
☐ Click management buttons
```

### **Test Admin Approval:**
```
☐ Login as admin
☐ Get pending restaurant from API
☐ Approve restaurant
☐ Check status changed to "active" and approved: true
☐ Restaurant now visible on homepage
```

---

## 📱 **Frontend Features:**

### **Admin Dashboard:**
```
✨ Modern glass-morphism design
✨ Animated stat cards
✨ Color-coded metrics
✨ Responsive layout
✨ Quick action buttons with icons
✨ Recent orders table
✨ Status badges (delivered, pending, etc.)
```

### **Onboarding Form:**
```
✨ Multi-section layout
✨ Clear field labels with icons
✨ Cuisine type toggle buttons
✨ Form validation
✨ Success animation
✨ Auto-redirect after submission
✨ Mobile responsive
```

---

## 🚀 **Future Enhancements (Optional):**

### **Admin Features:**
```
☐ User detail pages
 ☐ Restaurant detail/edit pages
☐ Order detail modal
☐ Dashboard charts (revenue over time)
☐ Email notifications on approval/rejection
☐ Bulk actions
☐ Search and filters
☐ Export data (CSV/PDF)
```

### **Onboarding Features:**
```
☐ Image upload for restaurant
☐ Menu upload
☐ Bank account details
☐ Document upload (FSSAI, GST certificates)
☐ Email verification
☐ OTP verification
☐ Application tracking page
☐ Waitlist feature
```

---

## 🎊 **Summary:**

### **What You Can Do Now:**

**As Restaurant Owner:**
```
1. Visit /partner-with-us
2. Fill registration form
3. Submit application
4. Wait for admin approval
5. Start selling once approved!
```

**As Admin:**
```
1. Login to /admin
2. View platform statistics
3. Manage users (view, delete)
4. Approve/reject restaurants
5. Track and manage orders
6. Monitor platform health
```

**As Customer:**
```
1. Browse approved restaurants
2. Order food
3. Track order status
4. (Admin updates status in dashboard)
```

---

## 📋 **File Structure:**

```
server/
├── middleware/
│   └── auth.js                    ✅ NEW - Auth & admin middleware
├── models/
│   ├── Hotel.js                   ✅ UPDATED - Added onboarding fields
│   └── Order.js                   ✅ NEW - Order model
├── routes/
│   ├── adminRoutes.js             ✅ NEW - Admin management APIs
│   ├── onboardingRoutes.js        ✅ NEW - Restaurant onboarding
│   └── ...
└── index.js                       ✅ UPDATED - Added new routes

src/
├── pages/
│   ├── AdminDashboard.jsx         ✅ NEW - Admin dashboard UI
│   └── RestaurantOnboarding.jsx   ✅ NEW - Onboarding form
└── App.jsx                        ✅ UPDATED - Added routes
```

---

## ✅ **Ready to Test!**

**URLs:**
```
Admin Dashboard: http://localhost:5173/admin
Restaurant Onboarding: http://localhost:5173/partner-with-us
```

**Test Flow:**
```
1. Register a restaurant via onboarding form
2. Login as admin
3. View dashboard
4. Approve the restaurant
5. Restaurant appears on homepage
6. Done! 🎉
```

---

**Created:** 2026-02-02  
**Features:** Admin Dashboard + Self-Onboarding  
**Status:** ✅ Complete & Ready to Use!  
**Time to Build:** Added in current session
