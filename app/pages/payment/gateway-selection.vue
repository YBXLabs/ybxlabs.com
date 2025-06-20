<template>
  <div class="gateway-selection-container">
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
      <!-- Gateway Selection Overlay -->
      <div class="payment-overlay">
        <div class="gateway-form-container">
          <div class="gateway-form">
            <div class="form-header">
              <h1 class="form-title">Choose Payment Gateway</h1>
              <p class="form-subtitle">Select your preferred payment method</p>
            </div>

            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="summary-amount">{{ formattedAmount }}</div>
              <div class="summary-description">Choose how you'd like to pay</div>
            </div>

            <!-- Gateway Selection -->
            <form @submit.prevent="proceedToPayment" class="gateway-selection-form">
              <div class="gateway-options">
                <label class="gateway-option" :class="{ 'selected': selectedGateway === 'razorpay' }">
                  <input 
                    type="radio" 
                    name="gateway" 
                    value="razorpay" 
                    v-model="selectedGateway"
                    class="gateway-radio"
                  />
                  <div class="gateway-content">
                    <div class="gateway-logo">
                      <Icon name="simple-icons:razorpay" class="gateway-icon razorpay-color" />
                    </div>
                    <div class="gateway-info">
                      <div class="gateway-name">Razorpay</div>
                      <div class="gateway-description">Cards, UPI, Net Banking & More for Global Users</div>
                      <div class="gateway-features">
                        <span class="feature-tag">Credit/Debit Cards</span>
                        <span class="feature-tag">UPI</span>
                        <span class="feature-tag">Net Banking</span>
                        <span class="feature-tag">Wallets</span>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label class="gateway-option" :class="{ 'selected': selectedGateway === 'phonepe' }">
                  <input 
                    type="radio" 
                    name="gateway" 
                    value="phonepe" 
                    v-model="selectedGateway"
                    class="gateway-radio"
                  />
                  <div class="gateway-content">
                    <div class="gateway-logo">
                      <Icon name="simple-icons:phonepe" class="gateway-icon phonepe-color" />
                    </div>
                    <div class="gateway-info">
                      <div class="gateway-name">PhonePe</div>
                      <div class="gateway-description">UPI, Cards & Net Banking Payments for Indian Users</div>
                      <div class="gateway-features">
                        <span class="feature-tag">UPI</span>
                        <span class="feature-tag">Credit/Debit Cards</span>
                        <span class="feature-tag">Net Banking</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button 
                  type="submit" 
                  :disabled="!selectedGateway || loading"
                  class="proceed-button"
                >
                  <Icon v-if="loading" name="ph:spinner" class="loading-icon" />
                  <span v-if="loading">Processing...</span>
                  <span v-else>Pay {{ formattedAmount }} via {{ selectedGateway === 'phonepe' ? 'PhonePe' : 'Razorpay' }}</span>
                </button>
                
                <button 
                  type="button" 
                  @click="goBack"
                  class="back-button"
                >
                  <Icon name="ph:arrow-left" class="back-icon" />
                  Back to Payment Form
                </button>
              </div>
            </form>

            <!-- Security Notice -->
            <div class="security-notice">
              <Icon name="ph:shield-check" class="security-icon" />
              <span>Secure payment processing</span>
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

const router = useRouter()
const route = useRoute()

// Extract payment details from query params
const amount = ref(0)
const currency = ref('INR')
const selectedGateway = ref('razorpay')
const loading = ref(false)

// Initialize from query params
onMounted(() => {
  const queryAmount = route.query.amount as string
  const queryCurrency = route.query.currency as string
  
  if (queryAmount) {
    amount.value = parseFloat(queryAmount)
  }
  
  if (queryCurrency) {
    currency.value = queryCurrency
  }
  
  // Redirect if not INR or missing params
  if (!queryAmount || !amount.value || currency.value !== 'INR') {
    router.push('/payment')
  }
})

// Format amount for display
const formattedAmount = computed(() => {
  return `₹${amount.value.toFixed(2)}`
})

// Proceed to payment processing
const proceedToPayment = () => {
  if (!selectedGateway.value) return
  
  loading.value = true
  
  // Navigate to payment processing page
  const paymentUrl = `/payment/${amount.value}${currency.value}?gateway=${selectedGateway.value}`
  router.push(paymentUrl)
}

// Go back to payment form
const goBack = () => {
  router.push('/payment')
}

// SEO
useHead({
  title: `Choose Payment Gateway - ${formattedAmount.value} - YBX Labs`,
  meta: [
    { name: 'description', content: `Select your payment gateway for ${formattedAmount.value} payment` }
  ]
})
</script>

<style scoped>
.gateway-selection-container {
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

.gateway-form-container {
  max-width: 600px;
  width: 100%;
}

.gateway-form {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1F2937;
}

.form-subtitle {
  color: #6B7280;
  font-size: 1rem;
}

.payment-summary {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
}

.summary-amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3B82F6;
  margin-bottom: 8px;
}

.summary-description {
  color: #6B7280;
  font-size: 1rem;
}

.gateway-selection-form {
  width: 100%;
}

.gateway-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.gateway-option {
  display: block;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.gateway-option:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.gateway-option.selected {
  border-color: #3B82F6;
  background: #F0F9FF;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.gateway-radio {
  display: none;
}

.gateway-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gateway-logo {
  flex-shrink: 0;
}

.gateway-icon {
  font-size: 2.5rem;
}

.razorpay-color {
  color: #3B82F6;
}

.phonepe-color {
  color: #5f259f;
}

.gateway-info {
  flex: 1;
}

.gateway-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.gateway-description {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 12px;
}

.gateway-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  background: #E5E7EB;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.gateway-option.selected .feature-tag {
  background: #DBEAFE;
  color: #1D4ED8;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.proceed-button {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.proceed-button:hover:not(:disabled) {
  background: #2563EB;
  transform: translateY(-2px);
}

.proceed-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-button {
  background: #F3F4F6;
  color: #374151;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.back-button:hover {
  background: #E5E7EB;
}

.back-icon {
  font-size: 1rem;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #10B981;
  font-size: 0.875rem;
  font-weight: 500;
}

.security-icon {
  font-size: 1rem;
}

@media (max-width: 640px) {
  .gateway-form {
    padding: 30px 20px;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .summary-amount {
    font-size: 2rem;
  }
  
  .gateway-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .gateway-info {
    text-align: center;
  }
}
</style> 