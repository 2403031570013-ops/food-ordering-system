# Razorpay Compliance & Live Mode Checklist

## 🟢 Section 1: Razorpay Submission Answers
Copy-paste these answers directly into the Razorpay Activation Form.

### 1. Business Description
> "FoodHub is a hyper-local food delivery aggregator connecting customers with local restaurants. We allow users to browse menus, place orders, and pay online securely. We operate as a marketplace model where we facilitate orders between registered restaurant partners and end consumers. Our platform includes a customer app for ordering, a restaurant partner dashboard for order management, and an admin panel for platform oversight."

### 2. Product Flow Explanation
> "1. User logs in/signs up on the FoodHub platform.
> 2. User browses listed restaurants and adds food items to their cart.
> 3. User proceeds to checkout and enters delivery address.
> 4. User clicks 'Pay Now' which initiates an order in our system.
> 5. We trigger the Razorpay Standard Checkout modal.
> 6. Upon successful payment, Razorpay returns a payment ID and signature.
> 7. Our backend verifies the signature and marks the order as 'Paid'.
> 8. A webhook listener on our server acts as a backup to confirm payments if the UI flow is interrupted.
> 9. The restaurant receives the order and prepares it for delivery."

### 3. Refund & Cancellation Policy
> "Cancellations:
> - Users can cancel an order within 60 seconds of placing it for a full refund.
> - Once the restaurant accepts the order (status: 'Preparing'), cancellations are not allowed.
> 
> Refunds:
> - Auto-refunds are initiated immediately if a duplicate payment is detected.
> - Refunds are processed if the restaurant cancels the order due to unavailability.
> - Refunds are credited back to the original source within 5-7 business days."

### 4. Webhook Security Explanation
> "We use Razorpay Webhooks to listen for 'payment.captured' and 'payment.failed' events. We strictly verify the `x-razorpay-signature` header using our secret key before processing any event. This ensures that only genuine requests from Razorpay are accepted. We also implement idempotency checks to prevent processing the same webhook event twice."

### 5. Domain Ownership Explanation
> "The domain [your-domain.com] is owned and managed by [Company Legal Name]. We have full control over the DNS records and the hosting environment (hosted on Render/Vercel)."

---

## 🟢 Section 2: Live Mode Checklist (Pre-Go-Live)

### 1. Environment Variables
- [ ] Create a production `.env` file (do not commit to Git).
- [ ] Set `RAZORPAY_KEY_ID` to your **Live** Key ID.
- [ ] Set `RAZORPAY_KEY_SECRET` to your **Live** Key Secret.
- [ ] Set `RAZORPAY_WEBHOOK_SECRET` to a strong, random string.

### 2. Razorpay Dashboard Settings
- [ ] **Webhooks**: processing URL `https://your-domain.com/api/payment/webhook`.
- [ ] **Events**: Enable `payment.captured` and `payment.failed`.
- [ ] **Branding**: Upload your Logo and set Brand Color in Razorpay Settings.

### 3. Legal & Compliance Pages
Ensure these pages are visible on your website footer:
- [ ] Privacy Policy
- [ ] Terms & Conditions
- [ ] Refund & Cancellation Policy
- [ ] Contact Us (Must show Phone Number & Physical Address)

### 4. Security
- [ ] Ensure your site is served over **HTTPS**.
- [ ] Verify that `console.log` containing sensitive data is removed.

---

## 🟢 Section 3: Admin & Settlement Features (Implemented)

### Admin Payment Panel
- **URL**: `/admin/payments`
- **Features**:
  - View all transactions with associated Order IDs.
  - Filter by Status (Paid, Failed, Refunded).
  - **Manual Refund Button**: One-click refund for any paid order.
  - **Auto-Refund Indicator**: Shows if a payment was marked as duplicate.

### Auto-Refund Mechanism
- System automatically detects if a payment comes in for an order that is ALREADY paid.
- It triggers a refund via Razorpay API instantly.
- Logs the `refundId` in the database.

---

**Status**: READY FOR SUBMISSION 🚀
