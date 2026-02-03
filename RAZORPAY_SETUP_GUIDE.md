# 💳 RAZORPAY API KEY SETUP GUIDE (हिंदी + English)

## 🎯 आपका सवाल | Your Question

**"Razorpay से API key चाहिए और site को live करना होगा?"**

**जवाब:** अभी site को live करने की जरूरत **नहीं** है! 🚫

पहले **Test Mode** में काम करें। बाद में live करेंगे। ✅

---

## 📋 दो तरीके हैं | Two Options

### Option 1: Test Mode (Recommended अभी के लिए)
- ✅ FREE
- ✅ Site live करने की जरूरत नहीं
- ✅ Testing के लिए
- ✅ Fake payments (no real money)
- ⚠️ Only you can test

### Option 2: Live Mode (बाद में)
- 💰 Real payments
- 📄 KYC documents needed
- 🌐 Site must be live
- ⏱️ Verification takes 1-2 days

---

## 🚀 STEP-BY-STEP: TEST MODE API KEY कैसे पाएं

### Step 1: Razorpay Account बनाएं
```
1. Open: https://razorpay.com/
2. Click: "Sign Up" (top right)
3. Fill details:
   - Email: anikjain4470@gmail.com (your email)
   - Password: (choose strong password)
   - Business Name: Food Ordering System
   - Phone: (your number)
4. Verify email
5. Login
```

### Step 2: Dashboard में जाएं
```
After login:
1. You'll see: Razorpay Dashboard
2. Look at sidebar
3. Click: "Settings" (⚙️ icon at bottom)
```

### Step 3: API Keys पाएं
```
In Settings:
1. Click: "API Keys" (left menu)
2. You'll see:
   - Mode: Test Mode ✅
   - Key ID: rzp_test_XXXXXXXXXXXXXX
   - Key Secret: [Click "Generate Secret"]
3. Copy both keys!
```

### Step 4: Keys को .env में डालें
```
Open: server/.env file
Add these lines:
```

---

## 📝 .ENV में क्या Add करें

```env
# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**⚠️ Important:**
- Replace `XXXXXX` with your actual keys
- Never share these keys publicly!
- Test keys start with: `rzp_test_`
- Live keys start with: `rzp_live_`

---

## 🎯 EXACT STEPS (Visual Guide)

### Razorpay Dashboard:
```
┌──────────────────────────────────┐
│  Razorpay Dashboard              │
│                                  │
│  Sidebar:                        │
│  ┌────────────────┐             │
│  │ Home           │             │
│  │ Transactions   │             │
│  │ Customers      │             │
│  │ ...            │             │
│  │ ⚙️ Settings    │ ← CLICK     │
│  └────────────────┘             │
│                                  │
│  Settings Page:                  │
│  ┌────────────────┐             │
│  │ API Keys  ←────────── CLICK  │
│  │ Webhooks       │             │
│  │ Team           │             │
│  └────────────────┘             │
│                                  │
│  API Keys Section:               │
│  ┌──────────────────────────┐   │
│  │ Mode: [Test] [Live]      │   │
│  │       ^^^^^ Select Test  │   │
│  │                          │   │
│  │ Key ID:                  │   │
│  │ rzp_test_ABC123...       │   │
│  │ [Copy]                   │   │
│  │                          │   │
│  │ Key Secret:              │   │
│  │ [Generate Secret]  ←CLICK│   │
│  │ ***************          │   │
│  │ [Copy]                   │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

---

## ✅ TEST करने के लिए Fake Card Details

जब payment test करें, तो ये fake details use करें:

### Test Card Numbers (All work):
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

### Or:
```
Card Number: 5555 5555 5555 4444
CVV: 123
Expiry: 12/25
```

### UPI Test:
```
UPI ID: success@razorpay
```

**⚠️ ये सिर्फ Test Mode में काम करेंगे!**

---

## 🔧 अब Project में Razorpay कैसे Add करें

### मैं आपके लिए करूँ? (Should I add it for you?)

अगर हाँ, तो मैं:
1. ✅ `.env` में Razorpay config add करूँगा
2. ✅ Backend में payment route बनाऊंगा
3. ✅ Frontend में payment button add करूँगा
4. ✅ Test करने का तरीका बताऊँगा

**बस मुझे बताओ:**
- आपके Razorpay Test API Keys क्या हैं?

या आप खुद add करना चाहते हो तो guide दे सकता हूं।

---

## 🌐 LIVE करने के लिए (बाद में जब ready हो)

### Live Mode के लिए Requirements:

1. **KYC Documents:**
   - PAN Card
   - Aadhaar Card
   - Bank Account Details
   - GST Certificate (optional for small business)

2. **Business Details:**
   - Business Name
   - Business Address
   - Business Type

3. **Website/App:**
   - Must be live and working
   - Should have proper terms & privacy policy
   - Contact information

4. **Verification Time:**
   - 1-2 working days
   - Razorpay team will review

### Live Mode Steps:
```
1. Razorpay Dashboard → Settings
2. Switch from "Test" to "Live" mode
3. Complete KYC
4. Submit for verification
5. Wait for approval
6. Get Live API Keys (rzp_live_XXXX)
7. Update .env with live keys
```

---

## 💡 मेरी सलाह | My Recommendation

### अभी करें:
1. ✅ Test Mode में API keys लें
2. ✅ Local में payment test करें
3. ✅ सब कुछ ठीक से काम कर रहा है check करें

### बाद में करें (जब site ready हो):
1. 📄 KYC complete करें
2. 🌐 Site को live करें (deploy)
3. 🔑 Live API keys लें
4. 💳 Real payments शुरू करें

---

## 🎓 Test Mode vs Live Mode

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Real Money | ❌ No | ✅ Yes |
| KYC Required | ❌ No | ✅ Yes |
| Site Must be Live | ❌ No | ✅ Yes |
| Verification | ✅ Instant | ⏱️ 1-2 days |
| Testing | ✅ Unlimited | ❌ Real transactions only |
| Best for | 🧪 Development | 🚀 Production |

---

## 📞 Razorpay Support

**Need Help?**
- Docs: https://razorpay.com/docs/
- Support: https://razorpay.com/support/
- Email: support@razorpay.com
- Phone: 1800-123-5555

---

## ⚡ QUICK START (अभी शुरू करें)

### 3 Minutes में Start करें:

1. **Sign Up**: https://razorpay.com/signup
2. **Login**: Dashboard खोलें
3. **Get Keys**: Settings → API Keys → Copy
4. **Tell Me**: Keys मुझे दें, मैं setup कर दूंगा

या

4. **Add Yourself**: `.env` में paste करें:
   ```env
   RAZORPAY_KEY_ID=your_test_key_id_here
   RAZORPAY_KEY_SECRET=your_test_secret_key_here
   ```

---

## ✨ सवाल था, जवाब है!

**Q: "Site को live करना होगा?"**
**A:** नहीं! पहले Test Mode में काम करो। ✅

**Q: "Real payments कब शुरू करूं?"**
**A:** जब site पूरी तरह ready हो और test हो जाए। ⏳

**Q: "Free है?"**
**A:** Test Mode completely FREE है! Live mode में Razorpay 2% charge लेता है per transaction. 💰

---

**अगला कदम:** Razorpay पर जाओ और Test API Keys लो। फिर मुझे बताओ, मैं integration कर दूंगा! 🚀

---

**Created:** 2026-02-02  
**Status:** Ready for Test Mode setup  
**Time needed:** 5 minutes
