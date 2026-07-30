# Razorpay Credit System Architecture & End-to-End Integration Guide

This document outlines the complete operational flow, database schemas, security measures, and API integration steps for the **Candidate Credit Wallet & Razorpay Payment System** in the AI Interviewer platform.

---

## 1. Credit Model Strategy: Simple Total Wallet

The platform uses a **Unified Credit Wallet System**:
* **Conversion Rate**: **1 Credit = 1 Interview Minute** (A 10-minute AI interview consumes exactly 10 credits).
* **15 Free Starter Credits**: Automatically credited to every new candidate upon registration.
* **Spendable Balance (`availableCredits`)**: Single active wallet pool representing spendable credits.
* **Tiered Pricing for Custom Credits**:
  * `< 50 Credits`: **₹2.50 per credit** (Standard Rate)
  * `≥ 50 Credits`: **₹1.80 per credit** (Bulk Discount Rate)
* **Lifetime Historical Counters**: `totalBonusCredits`, `totalPurchasedCredits`, and `totalUsedCredits` maintain audit statistics and **NEVER decrease** when taking an interview.

### 💡 Simple Numeric Example:

Suppose a candidate has **15 `availableCredits`** and earned **10 `totalBonusCredits`** from referrals.
They take a **10-minute interview** (which uses **10 credits**):

| Field | BEFORE Interview | AFTER 10-Min Interview (-10 Credits) | Explanation |
| :--- | :---: | :---: | :--- |
| **`availableCredits`** *(Spendable Wallet)* | **15** | **5** | Deducts 10 credits. Candidate has 5 credits left. |
| **`totalBonusCredits`** *(Lifetime Bonus Badge)* | **10** | **10** | **STAYS 10** (Historical counter never decreases!). |
| **`totalUsedCredits`** *(Lifetime Usage)* | **0** | **10** | Increases by 10 to record lifetime minutes practiced. |

---

## 2. Architecture & Sequence Flow Diagram

```
[ CANDIDATE (React) ]           [ EXPRESS BACKEND ]            [ RAZORPAY API ]
         |                              |                             |
         | --- 1. Select Custom Credits>|                             |
         |    (e.g., 50 credits)        | --- 2. Calculate ₹90 ------>|
         |                              |     Create Order (Pending)  |
         |                              |<--- 3. Return order_id -----|
         |<-- 4. Receive order_id ------|                             |
         |                              |                             |
         | === 5. Razorpay Checkout Modal (UPI / Card / Netbanking) ==|
         |                              |                             |
         | --- 6. Send Payment Result ->|                             |
         |    (order_id, payment_id,    |                             |
         |     razorpay_signature)      | -- 7. HMAC-SHA256 Check     |
         |                              | -- Idempotency Check        |
         |                              | -- Update User Wallet:      |
         |                              |    availableCredits += 50   |
         |                              |    totalPurchasedCredits+=50|
         |<--- 8. { success: true } ----|                             |
         |                              |                             |
         |                              |<=== 9. Webhook (Fallback) ==|
         |                              |    (payment.captured)       |
```

---

## 3. Database Schemas (MongoDB / Mongoose)

### A. User Schema Extension (`backend/src/modules/users/user.model.js`)

```javascript
credits: {
  // Current spendable credit balance (Default: 15 free starter credits)
  availableCredits: { 
    type: Number, 
    default: 15 
  },
  
  // Reserved for future referral programs, coupons & promo campaigns
  totalBonusCredits: { 
    type: Number, 
    default: 0 
  },

  // Total lifetime credits purchased via Razorpay
  totalPurchasedCredits: { 
    type: Number, 
    default: 0 
  },

  // Total credits spent on AI mock interview sessions
  totalUsedCredits: { 
    type: Number, 
    default: 0 
  },

  // Timestamp of the latest Razorpay top-up
  lastTopUpAt: { 
    type: Date 
  }
}
```

### B. Transaction Audit Schema (`backend/src/modules/payments/models/Transaction.js`)

```javascript
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ["PURCHASE", "USAGE", "REFUND", "BONUS"], 
    required: true 
  },
  credits: { 
    type: Number, 
    required: true 
  }, // Positive for top-up (+50), Negative for interview (-15)
  amount: { 
    type: Number, 
    default: 0 
  }, // Payment amount in INR
  currency: { 
    type: String, 
    default: "INR" 
  },
  razorpayOrderId: { 
    type: String 
  },
  razorpayPaymentId: { 
    type: String 
  },
  razorpaySignature: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ["created", "paid", "failed"], 
    default: "created" 
  },
  description: { 
    type: String, 
    required: true 
  } // e.g., "Purchased 50 Custom Credits", "Mock Interview Session (15 Mins)"
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
```

---

## 4. End-to-End Implementation Steps

### Phase 1: Candidate Registration (Bonus Allocation)
When a candidate signs up, MongoDB initializes `availableCredits: 15` and `totalBonusCredits: 0`.

### Phase 2: Order Creation (Backend Controlled Pricing)
The candidate specifies custom credits (e.g. 50 credits). The frontend sends `{ credits: 50 }` to the backend.

```javascript
// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  const { credits } = req.body;
  const parsedCredits = Math.max(1, parseInt(credits, 10));

  // Server-side dynamic rate calculation (< 50 credits = ₹2.5, >= 50 credits = ₹1.8)
  const rate = parsedCredits < 50 ? 2.5 : 1.8;
  const amountInRupees = Math.round(parsedCredits * rate);

  const order = await razorpay.orders.create({
    amount: amountInRupees * 100, // In Paise
    currency: "INR",
    receipt: `rec_${Date.now()}_${req.user._id.toString().slice(-4)}`
  });

  // Create pending transaction record
  await Transaction.create({
    userId: req.user._id,
    type: "PURCHASE",
    credits: parsedCredits,
    amount: amountInRupees,
    razorpayOrderId: order.id,
    status: "created",
    description: `Purchased ${parsedCredits} Custom Credits`
  });

  res.status(200).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID
  });
};
```

### Phase 3: HMAC-SHA256 Signature Verification & Wallet Credit
Upon Razorpay checkout modal completion, the frontend submits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.

```javascript
// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Cryptographic Signature Verification
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });

    // Idempotency Check: Protect against duplicate/replay requests
    if (transaction && transaction.status !== "paid") {
      transaction.status = "paid";
      transaction.razorpayPaymentId = razorpay_payment_id;
      transaction.razorpaySignature = razorpay_signature;
      await transaction.save();

      // Atomic Wallet Update
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: {
          "credits.availableCredits": transaction.credits,
          "credits.totalPurchasedCredits": transaction.credits
        },
        "credits.lastTopUpAt": new Date()
      });
    }

    return res.status(200).json({ success: true, message: "Payment verified & credits added!" });
  }

  res.status(400).json({ success: false, message: "Invalid payment signature" });
};
```

### Phase 4: Pre-Interview Credit Guard Middleware
Ensures the candidate has at least 5 available credits before launching an interview session.

```javascript
// Middleware: backend/src/middleware/checkCredits.js
export const checkCredits = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user?.credits || user.credits.availableCredits < 5) {
    return res.status(402).json({
      success: false,
      message: "Insufficient credits. You need at least 5 available credits to start an interview.",
      requireTopUp: true
    });
  }

  next();
};
```

### Phase 5: Post-Interview Credit Deduction & Usage Log
Upon session finish, deduct actual interview duration credits atomically:

```javascript
// POST /api/interviews/:id/complete
export const completeInterview = async (req, res) => {
  const { durationMinutes } = req.body;
  const creditsToDeduct = Math.max(1, durationMinutes);

  // 1. Atomic deduction from spendable balance
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $inc: {
        "credits.availableCredits": -creditsToDeduct,
        "credits.totalUsedCredits": creditsToDeduct
      }
    },
    { new: true }
  );

  // 2. Add usage transaction audit log
  await Transaction.create({
    userId: req.user._id,
    type: "USAGE",
    credits: -creditsToDeduct,
    amount: 0,
    status: "paid",
    description: `Mock Interview Session (${durationMinutes} Mins)`
  });

  res.status(200).json({
    success: true,
    remainingCredits: updatedUser.credits.availableCredits
  });
};
```

---

## 5. Security & Anti-Fraud Checklist

* [x] **Server-Side Price Calculation**: Amounts are computed strictly on Express backend.
* [x] **HMAC-SHA256 Verification**: Signatures verified using `crypto.createHmac('sha256', SECRET)`.
* [x] **Idempotency Guard**: `transaction.status !== 'paid'` prevents double-crediting via replay attacks.
* [x] **Webhook Integration**: Dedicated `/api/payments/webhook` listener handles fallback `payment.captured` events if browser tab closes unexpectedly.
* [x] **Atomic Database Operations**: Using Mongoose `$inc` guarantees thread-safe wallet balance updates without race conditions.
