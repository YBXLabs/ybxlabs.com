<template>
  <div class="payment-container">
    <!-- Background Image -->
    <div 
      class="payment-background"
      :style="{ 
        backgroundImage: `url(/assets/payment-bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }"
    >
      <!-- Payment Overlay -->
      <div class="payment-overlay">
        <!-- Payment Form -->
        <div v-if="!showThankYou" class="payment-form-container">
          <div class="payment-form">
            <h1 class="payment-title">Complete Your Payment</h1>
            <div class="amount-display">
              <span class="amount-text">{{ formattedAmount }}</span>
            </div>
            
            <div class="payment-details">
              <p class="payment-description">You are about to pay {{ formattedAmount }}</p>
              <p class="secure-text">🔒 Secure payment powered by {{ gateway === 'phonepe' ? 'PhonePe' : 'Razorpay' }}</p>
            </div>

            <button 
              @click="initiatePayment" 
              :disabled="loading"
              class="pay-button"
            >
              <span v-if="loading">
                <template v-if="gateway === 'phonepe'">Loading PhonePe Payment...</template>
                <template v-else>Processing...</template>
              </span>
              <span v-else>Pay {{ formattedAmount }} via {{ gateway === 'phonepe' ? 'PhonePe' : 'Razorpay' }}</span>
            </button>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Thank You Screen -->
        <div v-else class="thank-you-container">
          <div class="thank-you-content">
            <div class="success-icon">✅</div>
            <h1 class="thank-you-title">Payment Successful!</h1>
            <div class="payment-success-details">
              <h3>Payment Details:</h3>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">{{ formattedAmount }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">{{ paymentDetails.payment_id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">{{ paymentDetails.order_id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ paymentDetails.method }}</span>
              </div>
              <div class="detail-row" v-if="paymentDetails.created_at">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ formatDate(paymentDetails.created_at) }}</span>
              </div>
            </div>
            <button @click="goToPayments" class="home-button">
              Pay More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use clean payment layout instead of default Prismic layout
definePageMeta({
  layout: 'payment'
})

interface PaymentDetails {
  payment_id?: string
  order_id?: string
  amount?: number
  currency?: string
  status?: string
  method?: string
  created_at?: number
}

const route = useRoute()
const router = useRouter()

// Extract amount and gateway from URL
const amountParam = Array.isArray(route.params.amount) 
  ? route.params.amount[0] || ''
  : route.params.amount || ''
const gatewayParam = route.query.gateway as string || 'razorpay'

const amount = ref(0)
const currency = ref('INR')
const gateway = ref(gatewayParam)
const loading = ref(false)
const error = ref('')
const showThankYou = ref(false)
const paymentDetails = ref<PaymentDetails>({})

// Parse amount from URL parameter (e.g., "10INR" -> 10)
const parseAmount = (param: string) => {
  if (!param) {
    error.value = 'Invalid amount format'
    return
  }
  
  const match = param.match(/^(\d+(?:\.\d+)?)([A-Z]{3})?$/i)
  if (match) {
    amount.value = parseFloat(match[1])
    currency.value = match[2]?.toUpperCase() || 'INR'
  } else {
    // Fallback: try to extract just the number
    const numMatch = param.match(/\d+(?:\.\d+)?/)
    if (numMatch) {
      amount.value = parseFloat(numMatch[0])
    } else {
      error.value = 'Invalid amount format'
    }
  }
}

// Currency symbol mapping - All Razorpay supported currencies
const getCurrencySymbol = (currencyCode: string) => {
  const symbols: { [key: string]: string } = {
    'AED': 'د.إ', 'ALL': 'L', 'AMD': '֏', 'ARS': '$', 'AUD': 'A$', 'AWG': 'ƒ',
    'AZN': '₼', 'BAM': 'КМ', 'BBD': '$', 'BDT': '৳', 'BGN': 'лв', 'BHD': '.د.ب',
    'BIF': 'Fr', 'BMD': '$', 'BND': '$', 'BOB': 'Bs.', 'BRL': 'R$', 'BSD': '$',
    'BTN': 'Nu.', 'BWP': 'P', 'BZD': '$', 'CAD': 'C$', 'CHF': 'CHF', 'CLP': '$',
    'CNY': '¥', 'COP': '$', 'CRC': '₡', 'CUP': '$', 'CVE': '$', 'CZK': 'Kč',
    'DJF': 'Fr', 'DKK': 'kr', 'DOP': '$', 'DZD': 'د.ج', 'EGP': '£', 'ETB': 'Br',
    'EUR': '€', 'FJD': '$', 'GBP': '£', 'GHS': '₵', 'GIP': '£', 'GMD': 'D',
    'GNF': 'Fr', 'GTQ': 'Q', 'GYD': '$', 'HKD': 'HK$', 'HNL': 'L', 'HRK': 'kn',
    'HTG': 'G', 'HUF': 'Ft', 'IDR': 'Rp', 'ILS': '₪', 'INR': '₹', 'IQD': 'ع.د',
    'ISK': 'kr', 'JMD': '$', 'JOD': 'د.ا', 'JPY': '¥', 'KES': 'Sh', 'KGS': 'с',
    'KHR': '៛', 'KMF': 'Fr', 'KRW': '₩', 'KWD': 'د.ك', 'KYD': '$', 'KZT': '₸',
    'LAK': '₭', 'LKR': 'Rs', 'LRD': '$', 'LSL': 'L', 'MAD': 'د.م.', 'MDL': 'L',
    'MGA': 'Ar', 'MKD': 'ден', 'MMK': 'Ks', 'MNT': '₮', 'MOP': 'P', 'MUR': 'Rs',
    'MVR': '.ރ', 'MWK': 'MK', 'MXN': '$', 'MYR': 'RM', 'MZN': 'MT', 'NAD': '$',
    'NGN': '₦', 'NIO': 'C$', 'NOK': 'kr', 'NPR': 'Rs', 'NZD': 'NZ$', 'OMR': 'ر.ع.',
    'PEN': 'S/', 'PGK': 'K', 'PHP': '₱', 'PKR': 'Rs', 'PLN': 'zł', 'PYG': '₲',
    'QAR': 'ر.ق', 'RON': 'lei', 'RSD': 'дин.', 'RUB': '₽', 'RWF': 'Fr', 'SAR': 'ر.س',
    'SCR': 'Rs', 'SEK': 'kr', 'SGD': 'S$', 'SLL': 'Le', 'SOS': 'Sh', 'SSP': '£',
    'SVC': '₡', 'SZL': 'L', 'THB': '฿', 'TND': 'د.ت', 'TRY': '₺', 'TTD': '$',
    'TWD': 'NT$', 'TZS': 'Sh', 'UAH': '₴', 'UGX': 'Sh', 'USD': '$', 'UYU': '$',
    'UZS': 'so\'m', 'VND': '₫', 'VUV': 'Vt', 'XAF': 'Fr', 'XCD': '$', 'XOF': 'Fr',
    'XPF': 'Fr', 'YER': '﷼', 'ZAR': 'R', 'ZMW': 'ZK'
  }
  return symbols[currencyCode.toUpperCase()] || ''
}

// Format amount for display
const formattedAmount = computed(() => {
  const symbol = getCurrencySymbol(currency.value)
  return symbol ? `${symbol}${amount.value}` : `${amount.value} ${currency.value}`
})

// Initialize payment data
onMounted(() => {
  parseAmount(amountParam)
  
  if (amount.value <= 0) {
    error.value = 'Invalid payment amount'
  }
})

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Load PhonePe script
const loadPhonePeScript = () => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if ((window as any).PhonePeCheckout) {
      resolve(true)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://mercury.phonepe.com/web/bundle/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Initiate payment process
const initiatePayment = async () => {
  try {
    loading.value = true
    error.value = ''

    // Handle PhonePe payment flow
    if (gateway.value === 'phonepe' && currency.value === 'INR') {
      console.log('Starting PhonePe payment flow...')
      
      // Enable iFrame mode for in-website payment experience
      const forceRedirectMode = false
      
      // Create PhonePe order first
      console.log('Creating PhonePe order...')
      const orderData = await $fetch('/api/payment/create-order', {
        method: 'POST',
        body: {
          amount: amount.value,
          currency: currency.value,
          gateway: 'phonepe'
        }
      }) as any

      if (!orderData.success) {
        throw new Error('Failed to create PhonePe payment order')
      }

      console.log('PhonePe order created:', orderData)

      // Store access token for verification
      sessionStorage.setItem('phonepe_access_token', orderData.access_token)
      sessionStorage.setItem('phonepe_merchant_order_id', orderData.merchant_order_id)

      // Skip iFrame attempt if force redirect mode is enabled
      if (forceRedirectMode) {
        console.log('Force redirect mode enabled, skipping iFrame attempt')
        // Give user feedback before redirect
        error.value = 'Redirecting to PhonePe...'
        await new Promise(resolve => setTimeout(resolve, 1000))
        window.location.href = orderData.redirect_url
        return
      }

      // Add timeout to prevent getting stuck
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PhonePe initialization timeout')), 15000) // 15 second timeout
      })

      try {
        // Try to load PhonePe script and use iFrame mode with timeout
        console.log('Loading PhonePe script...')
        
        await Promise.race([
          (async () => {
            const phonepeScriptLoaded = await loadPhonePeScript()
            
            if (phonepeScriptLoaded) {
              console.log('PhonePe script loaded successfully')
              
              // Wait a bit for the script to initialize
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              const phonepeCheckout = (window as any).PhonePeCheckout
              console.log('PhonePeCheckout available:', !!phonepeCheckout)
              
              if (phonepeCheckout && typeof phonepeCheckout.transact === 'function') {
                console.log('Attempting PhonePe iFrame mode...')
                
                // Use the redirect URL as tokenUrl for iFrame mode
                const tokenUrl = orderData.redirect_url
                console.log('Using tokenUrl:', tokenUrl)
                
                // Define callback function for payment completion
                const callback = (response: string) => {
                  console.log('PhonePe payment callback:', response)
                  
                  if (response === 'USER_CANCEL') {
                    console.log('User cancelled payment')
                    error.value = 'Payment cancelled by user'
                    loading.value = false
                  } else if (response === 'CONCLUDED') {
                    console.log('Payment concluded, verifying...')
                    // Payment completed (success or failure), verify the status
                    verifyPhonePePayment()
                  }
                }
                
                // Configure PhonePe payment options for iFrame mode
                phonepeCheckout.transact({
                  tokenUrl: tokenUrl,
                  callback: callback,
                  type: 'IFRAME'
                })
                
                console.log('PhonePe iFrame mode initiated successfully')
                return true // Success
              } else {
                console.warn('PhonePeCheckout.transact not available')
                return false
              }
            } else {
              console.warn('Failed to load PhonePe script')
              return false
            }
          })(),
          timeoutPromise
        ])
        
        // If we reach here, iFrame worked
        console.log('PhonePe iFrame integration completed')
        return
        
      } catch (timeoutOrError) {
        console.warn('PhonePe iFrame mode failed or timed out:', timeoutOrError)
      }

      // Fallback: Use traditional redirect mode  
      console.log('Falling back to PhonePe redirect mode')
      
      // Give user feedback before redirect
      error.value = 'Redirecting to PhonePe...'
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      window.location.href = orderData.redirect_url
      return
    }

    // Handle Razorpay payment flow (existing logic)
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      throw new Error('Failed to load payment gateway')
    }

    // Create order
    const orderData = await $fetch('/api/payment/create-order', {
      method: 'POST',
      body: {
        amount: amount.value,
        currency: currency.value,
        gateway: 'razorpay'
      }
    }) as any

    if (!orderData.success) {
      throw new Error('Failed to create payment order')
    }

    // Configure Razorpay options
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'YBX Labs',
      description: `Payment of ${formattedAmount.value}`,
      order_id: orderData.order_id,
      handler: async (response: any) => {
        await verifyPayment(response)
      },
      modal: {
        ondismiss: () => {
          loading.value = false
        }
      },
      theme: {
        color: '#3B82F6'
      }
    }

    // Open Razorpay checkout
    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()

  } catch (err: any) {
    console.error('Payment initiation error:', err)
    error.value = err.message || 'Payment initiation failed'
    loading.value = false
  }
}

// Verify PhonePe payment specifically
const verifyPhonePePayment = async () => {
  try {
    const accessToken = sessionStorage.getItem('phonepe_access_token')
    const merchantOrderId = sessionStorage.getItem('phonepe_merchant_order_id')

    if (!accessToken || !merchantOrderId) {
      throw new Error('PhonePe payment session expired')
    }

    const verificationData = await $fetch('/api/payment/verify', {
      method: 'POST',
      body: {
        gateway: 'phonepe',
        merchantOrderId,
        accessToken
      }
    }) as any

    // Clear stored data
    sessionStorage.removeItem('phonepe_access_token')
    sessionStorage.removeItem('phonepe_merchant_order_id')

    if (verificationData.success) {
      paymentDetails.value = verificationData
      showThankYou.value = true
    } else {
      throw new Error('Payment verification failed')
    }
  } catch (err: any) {
    console.error('PhonePe payment verification error:', err)
    error.value = err.message || 'Payment verification failed'
  } finally {
    loading.value = false
  }
}

// Verify payment (for Razorpay)
const verifyPayment = async (response?: any) => {
  try {
    // Handle Razorpay verification
    const verificationData = await $fetch('/api/payment/verify', {
      method: 'POST',
      body: {
        gateway: 'razorpay',
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      }
    }) as any

    if (verificationData.success) {
      paymentDetails.value = verificationData
      showThankYou.value = true
    } else {
      throw new Error('Payment verification failed')
    }
  } catch (err: any) {
    console.error('Payment verification error:', err)
    error.value = err.message || 'Payment verification failed'
  } finally {
    loading.value = false
  }
}

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// Go to payments page
const goToPayments = () => {
  router.push('/payment')
}

// Dynamic SEO - watch for changes in amount, currency, and gateway
watch([amount, currency, gateway], () => {
  const gatewayName = gateway.value === 'phonepe' ? 'PhonePe' : 'Razorpay'
  useHead({
    title: `Pay ${formattedAmount.value} - YBX Labs`,
    meta: [
      { name: 'description', content: `Secure payment of ${formattedAmount.value} via ${gatewayName}` }
    ]
  })
}, { immediate: true })
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  position: relative;
}

.payment-background {
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}

.payment-overlay {
  min-height: 100vh;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding: 20px;
}

.payment-form-container,
.thank-you-container {
  max-width: 500px;
  width: 100%;
}

.payment-form,
.thank-you-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.payment-title,
.thank-you-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #1F2937;
}

.amount-display {
  margin-bottom: 30px;
}

.amount-text {
  font-size: 3rem;
  font-weight: bold;
  color: #3B82F6;
}

.payment-details {
  margin-bottom: 40px;
}

.payment-description {
  font-size: 1.125rem;
  color: #4B5563;
  margin-bottom: 10px;
}

.secure-text {
  font-size: 0.875rem;
  color: #10B981;
  font-weight: 500;
}

.pay-button {
  width: 100%;
  background: #3B82F6;
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  border: none;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-button:hover:not(:disabled) {
  background: #2563EB;
  transform: translateY(-2px);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 8px;
  font-weight: 500;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.payment-success-details {
  text-align: left;
  margin: 30px 0;
  background: #F9FAFB;
  padding: 20px;
  border-radius: 12px;
}

.payment-success-details h3 {
  margin-bottom: 16px;
  color: #1F2937;
  font-weight: 600;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E5E7EB;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6B7280;
}

.detail-value {
  font-weight: 600;
  color: #1F2937;
  word-break: break-all;
}

.home-button {
  background: #10B981;
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.home-button:hover {
  background: #059669;
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .payment-form,
  .thank-you-content {
    padding: 30px 20px;
  }
  
  .amount-text {
    font-size: 2.5rem;
  }
  
  .payment-title,
  .thank-you-title {
    font-size: 1.5rem;
  }
}
</style> 