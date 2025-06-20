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
        <!-- Loading Screen -->
        <div v-if="loading" class="payment-form-container">
          <div class="payment-form">
            <div class="loading-content">
              <Icon name="ph:spinner" class="loading-spinner" />
              <h1 class="loading-title">Verifying Payment...</h1>
              <p class="loading-description">Please wait while we confirm your PhonePe payment</p>
            </div>
          </div>
        </div>

        <!-- Success Screen -->
        <div v-else-if="paymentSuccess" class="thank-you-container">
          <div class="thank-you-content">
            <div class="success-icon">✅</div>
            <h1 class="thank-you-title">Payment Successful!</h1>
            <div class="payment-success-details">
              <h3>Payment Details:</h3>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">₹{{ paymentDetails.amount }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">{{ paymentDetails.transaction_id || paymentDetails.order_id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Gateway:</span>
                <span class="detail-value">PhonePe</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">{{ paymentDetails.status }}</span>
              </div>
            </div>
            <button @click="goToPayments" class="home-button">
              Pay More
            </button>
          </div>
        </div>

        <!-- Error Screen -->
        <div v-else class="payment-form-container">
          <div class="payment-form">
            <div class="error-content">
              <div class="error-icon">❌</div>
              <h1 class="error-title">Payment Failed</h1>
              <p class="error-description">{{ error || 'Unable to verify payment status' }}</p>
              <div class="error-actions">
                <button @click="goToPayments" class="retry-button">Try Again</button>
                <button @click="goHome" class="home-button">Go Home</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use clean payment layout
definePageMeta({
  layout: 'payment'
})

interface PaymentDetails {
  order_id?: string
  merchant_order_id?: string
  amount?: number
  currency?: string
  status?: string
  transaction_id?: string
  method?: string
  created_at?: number
  gateway?: string
}

const router = useRouter()
const loading = ref(true)
const paymentSuccess = ref(false)
const error = ref('')
const paymentDetails = ref<PaymentDetails>({})

// Verify PhonePe payment on page load
onMounted(async () => {
  try {
    // Get stored PhonePe data
    const accessToken = sessionStorage.getItem('phonepe_access_token')
    const merchantOrderId = sessionStorage.getItem('phonepe_merchant_order_id')

    if (!accessToken || !merchantOrderId) {
      throw new Error('Payment session expired. Please try again.')
    }

    // Verify payment with PhonePe
    const verificationData = await $fetch('/api/payment/verify', {
      method: 'POST',
      body: {
        gateway: 'phonepe',
        merchantOrderId,
        accessToken
      }
    }) as any

    if (verificationData.success) {
      paymentDetails.value = verificationData
      paymentSuccess.value = true
      
      // Clear stored data
      sessionStorage.removeItem('phonepe_access_token')
      sessionStorage.removeItem('phonepe_merchant_order_id')
    } else {
      throw new Error('Payment verification failed')
    }
  } catch (err: any) {
    console.error('PhonePe verification error:', err)
    error.value = err.message || 'Payment verification failed'
    paymentSuccess.value = false
  } finally {
    loading.value = false
  }
})

// Navigate to payments page
const goToPayments = () => {
  router.push('/payment')
}

// Navigate to home page
const goHome = () => {
  router.push('/')
}

// SEO
useHead({
  title: 'Payment Status - YBX Labs',
  meta: [
    { name: 'description', content: 'PhonePe payment verification status' }
  ]
})
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

.loading-content {
  text-align: center;
}

.loading-spinner {
  font-size: 3rem;
  color: #5f259f;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1F2937;
}

.loading-description {
  color: #6B7280;
  font-size: 1rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.thank-you-title,
.error-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #1F2937;
}

.error-description {
  color: #EF4444;
  margin-bottom: 30px;
  font-size: 1.1rem;
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

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.retry-button {
  background: #3B82F6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: #2563EB;
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .payment-form,
  .thank-you-content {
    padding: 30px 20px;
  }
  
  .thank-you-title,
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style> 