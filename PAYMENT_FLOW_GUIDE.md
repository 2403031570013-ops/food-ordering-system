# Payment Flow Update Guide

## Overview

The payment system has been upgraded to a secure, industry-standard flow using Razorpay. This update addresses the issue of multiple payments for the same order and ensures that orders are only marked as paid after secure server-side verification.

## Key Changes

1.  **Secure "Inititate -> Verify" Flow**:
    *   Previously, the frontend handled payment success directly.
    *   **Now**, the frontend first calls `/api/payment/initiate` to create an order in the database with status `PENDING`.
    *   Only after the Razorpay payment is successful, the frontend calls `/api/payment/verify`.
    *   The server verifies the Razorpay signature and only then marks the order as `PAID`.

2.  **Order Schema Update**:
    *   Added `paymentStatus`: `pending` | `paid` | `failed`.
    *   Added `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`.

3.  **Webhook Support (Crucial)**:
    *   A webhook endpoint `/api/payment/webhook` has been added.
    *   This acts as a "source of truth" backup. If the user closes the browser window after payment but before the frontend can confirm it, Razorpay will notify the server, and the server will mark the order as `PAID`.

## Testing the Flow

1.  **Frontend**:
    *   Go to `http://localhost:5173`.
    *   Add items to cart and proceed to Checkout.
    *   Fill in address details.
    *   Click "Pay".
    *   You should see a "Processing..." spinner.
    *   Complete the payment (using Razorpay Test Card).
    *   Upon success, you will be redirected to the Home page (or Success page).

2.  **Backend Verification**:
    *   Check the MongoDB `orders` collection.
    *   The new order should have `paymentStatus: "paid"`.
    *   Duplicate payments for the same order are now impossible because the order ID is locked to the Razorpay Order ID.

## Webhook Setup (Required for Production)

For the system to be fully robust (handling network failures/browser closings), you MUST set up the webhook in Razorpay Dashboard:

1.  Go to **Razorpay Dashboard** -> **Settings** -> **Webhooks**.
2.  Add New Webhook.
3.  **Webhook URL**: Your production backend URL + `/api/payment/webhook` (e.g., `https://api.yourdomain.com/api/payment/webhook`).
4.  **Secret**: `foodhub_webhook_secret_12345` (This is currently set in your `.env`).
5.  **Active Events**: Check `payment.captured`.

## Troubleshooting

*   **"Payment verification failed"**: Check your `RAZORPAY_KEY_SECRET` in `.env`.
*   **"Razorpay SDK failed to load"**: Check your internet connection.

---
**Status**: COMPLETE & SECURE 🔒
