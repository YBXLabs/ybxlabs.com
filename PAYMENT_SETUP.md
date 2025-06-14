# Payment System Setup Guide

This guide will help you set up the Razorpay payment system for your YBX Labs website.

## 🚀 Quick Start

Your payment system is now ready! Follow these steps to get it running:

### 1. Environment Variables

Create a `.env` file in your project root with your Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# App Configuration  
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to get Razorpay keys:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate or copy your Key ID and Key Secret
4. Use **Test Mode** keys for development
5. Use **Live Mode** keys for production

### 2. Background Image

Add your payment background image:
1. Place your background image in `public/assets/`
2. Name it `payment-bg.png` (or update the path in the component)
3. Recommended size: 1920x1080px or higher

### 3. Test the Payment System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit payment URLs in your browser:
   - `http://localhost:3000/payment` - **Payment form** (enter custom amount & currency)
   - `http://localhost:3000/payment/100INR` - Direct ₹100 payment
   - `http://localhost:3000/payment/50USD` - Direct $50 payment
   - `http://localhost:3000/payment/1000INR` - Direct ₹1000 payment

## 📋 Features Implemented

✅ **Payment Form UI**: Custom amount & currency selection at `/payment`  
✅ **Multi-Currency Support**: 100+ currencies with proper symbols  
✅ **Searchable Currency Dropdown**: Find currencies by code, name, or symbol  
✅ **Smart Quick Amount Buttons**: Intelligent amounts based on currency type  
✅ **Dynamic Payment URLs**: `/payment/[amount]` format (e.g., `/payment/10INR`)  
✅ **Razorpay Integration**: Complete payment gateway setup  
✅ **Background Image**: Customizable full-screen background  
✅ **Payment Overlay**: Clean UI with payment form overlay  
✅ **Real-time Validation**: Form validation with error messages  
✅ **Payment Preview**: Live preview of payment amount  
✅ **Success Screen**: Thank you page with payment details  
✅ **Payment Verification**: Secure server-side verification  
✅ **Error Handling**: Comprehensive error management  
✅ **Mobile Responsive**: Works on all devices  
✅ **TypeScript Support**: Fully typed implementation  

## 🔧 Technical Details

### API Endpoints Created

- `POST /api/payment/create-order` - Creates Razorpay order
- `POST /api/payment/verify` - Verifies payment signature

### File Structure

```
server/
├── api/
│   └── payment/
│       ├── create-order.post.ts
│       └── verify.post.ts
app/
├── pages/
│   └── payment/
│       ├── index.vue          (payment form)
│       └── [amount].vue       (payment processing)
public/
├── assets/
│   ├── payment-bg.png (add your image here)
│   └── README-payment-bg.md
```

### URL Format Support

The system supports these URL formats:

**Payment Form (Recommended):**
- `/payment` → Custom amount & currency selection form

**Direct Payment URLs:**
- `/payment/100INR` → ₹100
- `/payment/50USD` → $50
- `/payment/1000EUR` → €1000
- `/payment/25.50GBP` → £25.50
- `/payment/50` → ₹50 (defaults to INR)

### Supported Currencies

The payment form supports **100+ currencies** - all currencies supported by Razorpay! 🌍

**Major Currencies Include:**
- 🇮🇳 **INR** - Indian Rupee (₹)
- 🇺🇸 **USD** - US Dollar ($)
- 🇪🇺 **EUR** - Euro (€)
- 🇬🇧 **GBP** - British Pound (£)
- 🇯🇵 **JPY** - Japanese Yen (¥)
- 🇦🇺 **AUD** - Australian Dollar (A$)
- 🇨🇦 **CAD** - Canadian Dollar (C$)
- 🇨🇭 **CHF** - Swiss Franc (CHF)
- 🇸🇬 **SGD** - Singapore Dollar (S$)
- 🇰🇷 **KRW** - Korean Won (₩)
- 🇷🇺 **RUB** - Russian Ruble (₽)
- 🇹🇷 **TRY** - Turkish Lira (₺)
- 🇺🇦 **UAH** - Ukrainian Hryvnia (₴)
- 🇻🇳 **VND** - Vietnamese Dong (₫)
- 🇹🇭 **THB** - Thai Baht (฿)
- **And 90+ more currencies!**

**Features:**
- 🔍 **Searchable Currency Dropdown** - Find currencies by code, name, or symbol
- 🎯 **Smart Quick Amounts** - Pre-configured amounts based on currency value
- 💱 **Proper Currency Symbols** - Native symbols for all currencies
- 🌐 **Global Support** - Major currencies from every continent

**Smart Quick Amounts by Currency Type:**
- **High Value** (BHD, KWD, OMR): 1, 5, 10, 25, 50, 100
- **Major Developed** (USD, EUR, GBP): $5, $10, $25, $50, $100, $250  
- **Medium Value** (INR, CNY, BRL): ₹50, ₹100, ₹250, ₹500, ₹1000, ₹2500
- **Zero Decimal** (JPY, KRW, VND): ¥1000, ¥5000, ¥10000, ¥25000, ¥50000, ¥100000

### Security Features

- ✅ Server-side payment verification
- ✅ Secure signature validation
- ✅ Environment variables for sensitive data
- ✅ CSRF protection via Nuxt
- ✅ Input validation and sanitization

## 🎨 Customization

### Styling
The payment page uses Tailwind CSS classes. You can customize:
- Colors in the component styles
- Layout and spacing
- Animation effects
- Responsive breakpoints

### Branding
Update the company name in the payment options:
```typescript
// In app/pages/payment/[amount].vue
name: 'YBX Labs', // Change this to your company name
```

### Currency Support
To add support for other currencies, update the parsing logic in the `parseAmount` function.

## 🧪 Testing

### Test Mode (Development)
1. Use Razorpay test API keys
2. Use test card numbers provided by Razorpay
3. All transactions will be simulated

### Test Card Numbers (Razorpay)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Production Deployment
1. Replace test API keys with live keys
2. Update `NUXT_PUBLIC_APP_URL` to your domain
3. Test with small amounts first
4. Enable webhooks for production reliability

## 🚨 Security Checklist

- [ ] Never commit `.env` file to version control
- [ ] Use environment variables for all sensitive data
- [ ] Implement rate limiting on payment APIs
- [ ] Set up proper CORS policies
- [ ] Enable HTTPS in production
- [ ] Monitor payment logs for suspicious activity

## 🆘 Troubleshooting

### Common Issues

**"Invalid amount format" error:**
- Ensure URL follows format `/payment/[number]INR`
- Check that amount is a valid number

**"Failed to load payment gateway" error:**
- Check internet connection
- Verify Razorpay script is loading
- Check console for JavaScript errors

**"Payment verification failed" error:**
- Verify API keys are correct
- Check that webhook signature validation is working
- Ensure server can access Razorpay APIs

**Environment variables not loading:**
- Restart development server after adding `.env`
- Check `.env` file is in project root
- Verify variable names match exactly

## 📞 Support

For Razorpay-specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For implementation issues:
- Check the browser console for errors
- Review server logs for API errors
- Verify all dependencies are installed

---

**🎉 Your payment system is ready!** 

- Visit `/payment` for the **payment form** with currency selection
- Or visit `/payment/100INR` to test a direct payment link 