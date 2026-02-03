# Restaurant Onboarding - Separate Pages Implementation

## Overview
The restaurant onboarding system has been split into two separate pages based on user type:

### 1. **Admin Onboarding** (`/admin/onboarding`)
- **Purpose**: For admins to directly onboard restaurant partners
- **Access**: Admin users only
- **Features**:
  - Full restaurant information form
  - Subscription plan selection (Basic, Premium, Enterprise)
  - Instant approval (status = 'approved' by default)
  - Direct activation - restaurant can access dashboard immediately
  - Admin badge indicator
  - Blue color scheme

### 2. **Self Onboarding** (`/partner-with-us`)
- **Purpose**: For restaurant owners to register themselves
- **Access**: Public (anyone can apply)
- **Features**:
  - Full restaurant information form
  - Application goes to "pending" status
  - Requires admin approval before activation
  - Shows informational cards about benefits
  - Orange color scheme
  - Success message indicates "Pending Admin Approval"

## Routes Added

```javascript
// Admin Route
<Route path="/admin/onboarding" element={<AdminOnboarding />} />

// Public Route (Self Registration)
<Route path="/partner-with-us" element={<SelfOnboarding />} />

// Legacy Route (kept for backward compatibility)
<Route path="/restaurant-onboarding" element={<RestaurantOnboarding />} />
```

## Navigation

### From Admin Dashboard:
- New "Add Restaurant" card in Quick Actions section
- Navigates to `/admin/onboarding`
- Has purple gradient background with "NEW" badge

### From Navbar:
- "Partner with Us" link (🏪 Partner with Us)
- Visible to all users
- Navigates to `/partner-with-us` (self onboarding)

## Backend API Endpoints Expected

### For Admin Onboarding:
```
POST /api/admin/onboarding/restaurant
Headers: Authorization: Bearer <admin_token>
Body: {
  restaurantName, ownerName, email, phone,
  address, city, state, pincode,
  cuisine[], description,
  fssaiLicense, gstNumber,
  subscriptionPlan, status: 'approved'
}
```

### For Self Onboarding:
```
POST /api/onboarding/restaurant
Body: {
  restaurantName, ownerName, email, phone,
  address, city, state, pincode,
  cuisine[], description,
  fssaiLicense, gstNumber
}
Response: Application submitted with status: 'pending'
```

## Key Differences

| Feature | Admin Onboarding | Self Onboarding |
|---------|-----------------|-----------------|
| Route | `/admin/onboarding` | `/partner-with-us` |
| Access | Admin only | Public |
| Approval | Instant | Requires review |
| Status | `approved` | `pending` |
| Subscription | Admin selects | Assigned later |
| Color Theme | Blue | Orange |
| Success Message | "Added Successfully" | "Pending Approval" |

## Files Created/Modified

### New Files:
1. `src/pages/AdminOnboarding.jsx` - Admin onboarding interface
2. `src/pages/SelfOnboarding.jsx` - Self-registration interface
3. `RESTAURANT_ONBOARDING_SETUP.md` - This documentation

### Modified Files:
1. `src/App.jsx` - Added new routes
2. `src/pages/AdminDashboard.jsx` - Added "Add Restaurant" quick action

## Next Steps (Backend)

Create the following backend routes:
1. `POST /api/admin/onboarding/restaurant` - Admin adds restaurant
2. Modify existing `POST /api/onboarding/restaurant` - Set status as 'pending'
3. `GET /api/admin/restaurants` - List all restaurants with approval status
4. `PUT /api/admin/restaurants/:id/approve` - Approve pending restaurants

---

**Implementation Date**: February 3, 2026  
**Status**: ✅ Frontend Complete - Backend Integration Pending
