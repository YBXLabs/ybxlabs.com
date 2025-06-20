<template>
  <div class="payment-setup-container">
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
      <!-- Payment Form Overlay -->
      <div class="payment-overlay">
        <div class="payment-form-container">
          <div class="payment-form">
            <div class="form-header">
              <h1 class="form-title">Create Payment</h1>
              <p class="form-subtitle">Enter your payment details to proceed</p>
            </div>

            <form @submit.prevent="proceedToPayment" class="payment-input-form">
              <!-- Amount Input -->
              <div class="input-group">
                <label for="amount" class="input-label">Amount</label>
                <div class="amount-input-container" :class="{ 'error': amountError }">
                  <span class="currency-symbol">{{ selectedCurrencySymbol }}</span>
                  <input
                    id="amount"
                    v-model="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    max="100000"
                    placeholder="0.00"
                    class="amount-input"
                    :class="{ 'error': amountError }"
                    @input="validateAmount"
                    required
                  />
                </div>
                <div v-if="amountError" class="error-text">{{ amountError }}</div>
              </div>

              <!-- Currency Selection -->
              <div class="input-group">
                <label for="currency" class="input-label">Currency</label>
                <div class="currency-select-container">
                  <div 
                    class="currency-select-display"
                    @click.stop="toggleDropdown"
                  >
                    <span class="currency-display-text">
                      {{ selectedCurrencyDetails?.symbol }} {{ selectedCurrency }} - {{ selectedCurrencyDetails?.name }}
                    </span>
                                         <Icon name="ph:caret-down" class="select-icon" :class="{ 'rotate-180': showCurrencyDropdown }" />
                  </div>
                  
                  <div v-if="showCurrencyDropdown" class="currency-dropdown">
                    <div class="currency-search">
                      <input
                        v-model="currencySearch"
                        type="text"
                        placeholder="Search currencies..."
                        class="currency-search-input"
                        @click.stop
                      />
                                             <Icon name="ph:magnifying-glass" class="search-icon" />
                    </div>
                    
                    <div class="currency-options">
                      <div
                        v-for="currency in filteredCurrencies"
                        :key="currency.code"
                        class="currency-option"
                        :class="{ 'selected': currency.code === selectedCurrency }"
                        @click="selectCurrency(currency.code)"
                      >
                        <div class="currency-symbol">{{ currency.symbol }}</div>
                        <div class="currency-details">
                          <div class="currency-code">{{ currency.code }}</div>
                          <div class="currency-name">{{ currency.name }}</div>
                        </div>
                      </div>
                      
                      <div v-if="filteredCurrencies.length === 0" class="no-results">
                        No currencies found matching "{{ currencySearch }}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gateway selection will be shown in next step for INR -->

              <!-- Payment Preview -->
              <div v-if="amount && !amountError" class="payment-preview">
                <div class="preview-header">
                  <h3>Payment Preview</h3>
                </div>
                <div class="preview-details">
                  <div class="preview-amount">
                    {{ formattedAmount }}
                  </div>
                  <div class="preview-description">
                    You will be charged {{ formattedAmount }}{{ isINRCurrency ? '' : ' via Razorpay' }}
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button 
                  type="submit" 
                  :disabled="!isFormValid || loading"
                  class="proceed-button"
                >
                  <Icon v-if="loading" name="ph:spinner" class="loading-icon" />
                  <span v-if="loading">Processing...</span>
                  <span v-else>Proceed to Payment</span>
                </button>
                
                <button 
                  type="button" 
                  @click="goHome"
                  class="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>

            <!-- Quick Amount Buttons -->
            <div class="quick-amounts">
              <p class="quick-amounts-label">Quick amounts:</p>
              <div class="quick-amounts-grid">
                <button 
                  v-for="quickAmount in quickAmounts" 
                  :key="quickAmount"
                  type="button"
                  @click="setQuickAmount(quickAmount)"
                  class="quick-amount-btn"
                  :class="{ 'active': parseFloat(amount) === quickAmount }"
                >
                  {{ selectedCurrencySymbol }}{{ quickAmount }}
                </button>
              </div>
            </div>

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
// Use clean payment layout instead of default Prismic layout
definePageMeta({
  layout: 'payment'
})

interface Currency {
  code: string
  name: string
  symbol: string
}

const router = useRouter()

// Form data
const amount = ref('')
const selectedCurrency = ref('INR')
const loading = ref(false)
const amountError = ref('')
const currencySearch = ref('')
const showCurrencyDropdown = ref(false)

// Supported currencies - All Razorpay supported currencies
const supportedCurrencies: Currency[] = [
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ' },
  { code: 'ALL', name: 'Albanian lek', symbol: 'L' },
  { code: 'AMD', name: 'Armenian dram', symbol: '֏' },
  { code: 'ARS', name: 'Argentine peso', symbol: '$' },
  { code: 'AUD', name: 'Australian dollar', symbol: 'A$' },
  { code: 'AWG', name: 'Aruban florin', symbol: 'ƒ' },
  { code: 'AZN', name: 'Azerbaijan Manat', symbol: '₼' },
  { code: 'BAM', name: 'Convertible Mark', symbol: 'КМ' },
  { code: 'BBD', name: 'Barbadian dollar', symbol: '$' },
  { code: 'BDT', name: 'Bangladeshi taka', symbol: '৳' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'BIF', name: 'Burundi Franc', symbol: 'Fr' },
  { code: 'BMD', name: 'Bermudian dollar', symbol: '$' },
  { code: 'BND', name: 'Brunei dollar', symbol: '$' },
  { code: 'BOB', name: 'Bolivian boliviano', symbol: 'Bs.' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'BSD', name: 'Bahamian dollar', symbol: '$' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  { code: 'BWP', name: 'Botswana pula', symbol: 'P' },
  { code: 'BZD', name: 'Belize dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss franc', symbol: 'CHF' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'CNY', name: 'Chinese yuan renminbi', symbol: '¥' },
  { code: 'COP', name: 'Colombian peso', symbol: '$' },
  { code: 'CRC', name: 'Costa Rican colon', symbol: '₡' },
  { code: 'CUP', name: 'Cuban peso', symbol: '$' },
  { code: 'CVE', name: 'Cabo Verde Escudo', symbol: '$' },
  { code: 'CZK', name: 'Czech koruna', symbol: 'Kč' },
  { code: 'DJF', name: 'Djibouti Franc', symbol: 'Fr' },
  { code: 'DKK', name: 'Danish krone', symbol: 'kr' },
  { code: 'DOP', name: 'Dominican peso', symbol: '$' },
  { code: 'DZD', name: 'Algerian dinar', symbol: 'د.ج' },
  { code: 'EGP', name: 'Egyptian pound', symbol: '£' },
  { code: 'ETB', name: 'Ethiopian birr', symbol: 'Br' },
  { code: 'EUR', name: 'European euro', symbol: '€' },
  { code: 'FJD', name: 'Fijian dollar', symbol: '$' },
  { code: 'GBP', name: 'Pound sterling', symbol: '£' },
  { code: 'GHS', name: 'Ghanian Cedi', symbol: '₵' },
  { code: 'GIP', name: 'Gibraltar pound', symbol: '£' },
  { code: 'GMD', name: 'Gambian dalasi', symbol: 'D' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'Fr' },
  { code: 'GTQ', name: 'Guatemalan quetzal', symbol: 'Q' },
  { code: 'GYD', name: 'Guyanese dollar', symbol: '$' },
  { code: 'HKD', name: 'Hong Kong dollar', symbol: 'HK$' },
  { code: 'HNL', name: 'Honduran lempira', symbol: 'L' },
  { code: 'HRK', name: 'Croatian kuna', symbol: 'kn' },
  { code: 'HTG', name: 'Haitian gourde', symbol: 'G' },
  { code: 'HUF', name: 'Hungarian forint', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian rupiah', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli new shekel', symbol: '₪' },
  { code: 'INR', name: 'Indian rupee', symbol: '₹' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
  { code: 'ISK', name: 'Iceland Krona', symbol: 'kr' },
  { code: 'JMD', name: 'Jamaican dollar', symbol: '$' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KES', name: 'Kenyan shilling', symbol: 'Sh' },
  { code: 'KGS', name: 'Kyrgyzstani som', symbol: 'с' },
  { code: 'KHR', name: 'Cambodian riel', symbol: '៛' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'Fr' },
  { code: 'KRW', name: 'Korean Won', symbol: '₩' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'KYD', name: 'Cayman Islands dollar', symbol: '$' },
  { code: 'KZT', name: 'Kazakhstani tenge', symbol: '₸' },
  { code: 'LAK', name: 'Lao kip', symbol: '₭' },
  { code: 'LKR', name: 'Sri Lankan rupee', symbol: 'Rs' },
  { code: 'LRD', name: 'Liberian dollar', symbol: '$' },
  { code: 'LSL', name: 'Lesotho loti', symbol: 'L' },
  { code: 'MAD', name: 'Moroccan dirham', symbol: 'د.م.' },
  { code: 'MDL', name: 'Moldovan leu', symbol: 'L' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
  { code: 'MKD', name: 'Macedonian denar', symbol: 'ден' },
  { code: 'MMK', name: 'Myanmar kyat', symbol: 'Ks' },
  { code: 'MNT', name: 'Mongolian tugrik', symbol: '₮' },
  { code: 'MOP', name: 'Macanese pataca', symbol: 'P' },
  { code: 'MUR', name: 'Mauritian rupee', symbol: 'Rs' },
  { code: 'MVR', name: 'Maldivian rufiyaa', symbol: '.ރ' },
  { code: 'MWK', name: 'Malawian kwacha', symbol: 'MK' },
  { code: 'MXN', name: 'Mexican peso', symbol: '$' },
  { code: 'MYR', name: 'Malaysian ringgit', symbol: 'RM' },
  { code: 'MZN', name: 'Mozambique Metical', symbol: 'MT' },
  { code: 'NAD', name: 'Namibian dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian naira', symbol: '₦' },
  { code: 'NIO', name: 'Nicaraguan cordoba', symbol: 'C$' },
  { code: 'NOK', name: 'Norwegian krone', symbol: 'kr' },
  { code: 'NPR', name: 'Nepalese rupee', symbol: 'Rs' },
  { code: 'NZD', name: 'New Zealand dollar', symbol: 'NZ$' },
  { code: 'OMR', name: 'Rial Omani', symbol: 'ر.ع.' },
  { code: 'PEN', name: 'Peruvian sol', symbol: 'S/' },
  { code: 'PGK', name: 'Papua New Guinean kina', symbol: 'K' },
  { code: 'PHP', name: 'Philippine peso', symbol: '₱' },
  { code: 'PKR', name: 'Pakistani rupee', symbol: 'Rs' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
  { code: 'QAR', name: 'Qatari riyal', symbol: 'ر.ق' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  { code: 'RUB', name: 'Russian ruble', symbol: '₽' },
  { code: 'RWF', name: 'Rwanda Franc', symbol: 'Fr' },
  { code: 'SAR', name: 'Saudi Arabian riyal', symbol: 'ر.س' },
  { code: 'SCR', name: 'Seychellois rupee', symbol: 'Rs' },
  { code: 'SEK', name: 'Swedish krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore dollar', symbol: 'S$' },
  { code: 'SLL', name: 'Sierra Leonean leone', symbol: 'Le' },
  { code: 'SOS', name: 'Somali shilling', symbol: 'Sh' },
  { code: 'SSP', name: 'South Sudanese pound', symbol: '£' },
  { code: 'SVC', name: 'Salvadoran colón', symbol: '₡' },
  { code: 'SZL', name: 'Swazi lilangeni', symbol: 'L' },
  { code: 'THB', name: 'Thai baht', symbol: '฿' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'TTD', name: 'Trinidad and Tobago dollar', symbol: '$' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
  { code: 'TZS', name: 'Tanzanian shilling', symbol: 'Sh' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'UGX', name: 'Uganda Shilling', symbol: 'Sh' },
  { code: 'USD', name: 'United States dollar', symbol: '$' },
  { code: 'UYU', name: 'Uruguayan peso', symbol: '$' },
  { code: 'UZS', name: 'Uzbekistani so\'m', symbol: 'so\'m' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'VUV', name: 'Vatu', symbol: 'Vt' },
  { code: 'XAF', name: 'CFA Franc BEAC', symbol: 'Fr' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
  { code: 'XOF', name: 'CFA Franc BCEAO', symbol: 'Fr' },
  { code: 'XPF', name: 'CFP Franc', symbol: 'Fr' },
  { code: 'YER', name: 'Yemeni rial', symbol: '﷼' },
  { code: 'ZAR', name: 'South African rand', symbol: 'R' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' }
]

// Quick amount options
const quickAmounts = ref([10, 25, 50, 100, 500, 1000])

// Filter currencies based on search
const filteredCurrencies = computed(() => {
  if (!currencySearch.value) return supportedCurrencies
  
  const search = currencySearch.value.toLowerCase()
  return supportedCurrencies.filter(currency => 
    currency.code.toLowerCase().includes(search) ||
    currency.name.toLowerCase().includes(search) ||
    currency.symbol.toLowerCase().includes(search)
  )
})

// Get currency symbol for selected currency
const selectedCurrencySymbol = computed(() => {
  const currency = supportedCurrencies.find(c => c.code === selectedCurrency.value)
  return currency?.symbol || selectedCurrency.value
})

// Get selected currency details
const selectedCurrencyDetails = computed(() => {
  return supportedCurrencies.find(c => c.code === selectedCurrency.value)
})

// Check if current currency is INR (show gateway selection)
const isINRCurrency = computed(() => {
  return selectedCurrency.value === 'INR'
})

// Format amount for display
const formattedAmount = computed(() => {
  if (!amount.value) return ''
  const numAmount = parseFloat(amount.value)
  return `${selectedCurrencySymbol.value}${numAmount.toFixed(2)}`
})

// Form validation
const isFormValid = computed(() => {
  return amount.value && 
         parseFloat(amount.value) > 0 && 
         parseFloat(amount.value) <= 100000 && 
         selectedCurrency.value &&
         !amountError.value
})

// Validate amount input
const validateAmount = () => {
  amountError.value = ''
  
  if (!amount.value) {
    amountError.value = 'Amount is required'
    return
  }
  
  const numAmount = parseFloat(amount.value)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    amountError.value = 'Please enter a valid amount'
    return
  }
  
  if (numAmount < 1) {
    amountError.value = 'Minimum amount is 1'
    return
  }
  
  if (numAmount > 100000) {
    amountError.value = 'Maximum amount is 100,000'
    return
  }
}

// Select currency and close dropdown
const selectCurrency = (currencyCode: string) => {
  console.log('Selecting currency:', currencyCode)
  selectedCurrency.value = currencyCode
  showCurrencyDropdown.value = false
  currencySearch.value = ''
  updateQuickAmounts()
}

// Toggle dropdown
const toggleDropdown = () => {
  console.log('Toggling dropdown, current state:', showCurrencyDropdown.value)
  showCurrencyDropdown.value = !showCurrencyDropdown.value
}

// Update currency symbol when currency changes
const updateCurrencySymbol = () => {
  // Trigger reactivity update
  selectedCurrency.value = selectedCurrency.value
}

// Set quick amount
const setQuickAmount = (quickAmount: number) => {
  amount.value = quickAmount.toString()
  validateAmount()
}

// Proceed to payment
const proceedToPayment = () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  const paymentAmount = parseFloat(amount.value)
  
  if (isINRCurrency.value) {
    // For INR: Go to gateway selection step
    router.push(`/payment/gateway-selection?amount=${paymentAmount}&currency=${selectedCurrency.value}`)
  } else {
    // For non-INR: Go directly to Razorpay payment
    const paymentUrl = `/payment/${paymentAmount}${selectedCurrency.value}?gateway=razorpay`
    router.push(paymentUrl)
  }
}

// Go to homepage
const goHome = () => {
  router.push('/')
}

// Close dropdown when clicking outside
const closeCurrencyDropdown = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.currency-select-container')) {
    showCurrencyDropdown.value = false
  }
}

// Initialize form
onMounted(() => {
  // Set default quick amounts based on currency
  updateQuickAmounts()
  
  // Add click outside listener
  document.addEventListener('click', closeCurrencyDropdown)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', closeCurrencyDropdown)
})

// Watch currency changes to update quick amounts
watch(selectedCurrency, () => {
  updateQuickAmounts()
})

// Update quick amounts based on selected currency
const updateQuickAmounts = () => {
  const currency = selectedCurrency.value
  
  // High value currencies (3 decimal places or high value)
  if (['BHD', 'IQD', 'JOD', 'KWD', 'OMR', 'TND'].includes(currency)) {
    quickAmounts.value = [1, 5, 10, 25, 50, 100]
  }
  // Zero decimal currencies (no fractional unit)
  else if (['BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'].includes(currency)) {
    quickAmounts.value = [1000, 5000, 10000, 25000, 50000, 100000]
  }
  // Major developed countries currencies
  else if (['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'SGD', 'NZD', 'SEK', 'NOK', 'DKK'].includes(currency)) {
    quickAmounts.value = [5, 10, 25, 50, 100, 250]
  }
  // Medium value currencies (most developing countries)
  else if (['INR', 'CNY', 'BRL', 'MXN', 'ZAR', 'RUB', 'TRY', 'PLN', 'CZK', 'HUF', 'THB', 'MYR', 'PHP'].includes(currency)) {
    quickAmounts.value = [50, 100, 250, 500, 1000, 2500]
  }
  // Lower value currencies (require higher amounts)
  else if (['IDR', 'VND', 'KRW', 'LAK', 'MMK', 'UZS', 'IRR', 'LBP', 'SLL', 'UGX'].includes(currency)) {
    quickAmounts.value = [10000, 25000, 50000, 100000, 250000, 500000]
  }
  // Default for other currencies
  else {
    quickAmounts.value = [10, 25, 50, 100, 500, 1000]
  }
}

// SEO
useHead({
  title: 'Create Payment - YBX Labs',
  meta: [
    { name: 'description', content: 'Create a secure payment with custom amount and currency selection' }
  ]
})
</script>

<style scoped>
.payment-setup-container {
  min-height: 100vh;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.payment-background {
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.payment-overlay {
  min-height: 100vh;
  width: 100%;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding: 24px;
}

.payment-form-container {
  max-width: 520px;
  width: 100%;
}

.payment-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 28px;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.form-subtitle {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.8;
}

.payment-input-form {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 18px;
}

.input-label {
  display: block;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 0.85rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.amount-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.amount-input-container:focus-within .amount-input {
  border-color: #667eea;
  transform: translateY(-1px);
}

.amount-input-container.error .amount-input {
  border-color: #ef4444;
}

.currency-symbol {
  padding: 14px;
  font-weight: 700;
  color: #475569;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 14px;
  min-width: 56px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  height: calc(1.125rem + 28px);
  box-sizing: border-box;
}

.amount-input {
  flex: 1;
  padding: 14px;
  border: none;
  outline: none;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  border: 2px solid rgba(226, 232, 240, 0.8);
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.amount-input.error {
  color: #EF4444;
}

.currency-select-container {
  position: relative;
}

.currency-select-display {
  width: 100%;
  padding: 14px 50px 14px 16px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.currency-select-display:hover {
  border-color: #667eea;
  transform: translateY(-1px);
}

.currency-display-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
  font-weight: 500;
}

.select-icon {
  color: #6B7280;
  width: 20px;
  height: 20px;
  transition: transform 0.2s;
}

.select-icon.rotate-180 {
  transform: rotate(180deg);
}

.currency-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  z-index: 9999;
  margin-top: 8px;
  max-height: 320px;
  overflow: hidden;
}

.currency-search {
  position: relative;
  padding: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.currency-search-input {
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  font-size: 0.9rem;
  outline: none;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1e293b;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.currency-search-input::placeholder {
  color: #9CA3AF;
  opacity: 0.8;
}

.currency-search-input:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
}

.search-icon {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #6B7280;
  width: 16px;
  height: 16px;
}

.currency-options {
  max-height: 260px;
  overflow-y: auto;
  padding: 8px;
}

.currency-option {
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 12px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid transparent;
}

.currency-option:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.currency-option.selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: #667eea;
}

.currency-option:last-child {
  margin-bottom: 0;
}

.currency-symbol {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  color: #475569;
  flex-shrink: 0;
}

.currency-details {
  flex: 1;
  min-width: 0;
}

.currency-code {
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 2px;
  letter-spacing: 0.025em;
}

.currency-name {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.8;
}

.currency-option.selected .currency-symbol {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.currency-option.selected .currency-code {
  color: #667eea;
  font-weight: 800;
}

.currency-option.selected .currency-name {
  color: #4c1d95;
  opacity: 0.9;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #6B7280;
  font-style: italic;
}

.error-text {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 6px;
  font-weight: 500;
}

.payment-preview {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12);
}

.preview-header h3 {
  color: #4c1d95;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-amount {
  font-size: 2.25rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.preview-description {
  color: #4c1d95;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.proceed-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 28px;
  border-radius: 14px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 
    0 10px 15px -3px rgba(102, 126, 234, 0.4),
    0 4px 6px -2px rgba(102, 126, 234, 0.2);
  letter-spacing: 0.025em;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.proceed-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.proceed-button:hover:not(:disabled)::before {
  left: 100%;
}

.proceed-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(102, 126, 234, 0.4),
    0 10px 10px -5px rgba(102, 126, 234, 0.2);
}

.proceed-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-icon {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cancel-button {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #64748b;
  padding: 12px 28px;
  border-radius: 14px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.025em;
}

.cancel-button:hover {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(148, 163, 184, 0.6);
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.quick-amounts {
  margin-bottom: 20px;
  padding-top: 18px;
  border-top: 2px solid rgba(226, 232, 240, 0.6);
}

.quick-amounts-label {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quick-amounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-amount-btn {
  padding: 12px 8px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.8rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.quick-amount-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.2);
}

.quick-amount-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 8px 15px -3px rgba(102, 126, 234, 0.4);
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #059669;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.security-icon {
  width: 16px;
  height: 16px;
  color: #059669;
}

/* Removed gateway selection styles - now on separate page */

@media (max-width: 640px) {
  .payment-overlay {
    padding: 12px;
  }
  
  .payment-form {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .form-header {
    margin-bottom: 20px;
  }
  
  .form-title {
    font-size: 1.75rem;
  }
  
  .input-group {
    margin-bottom: 16px;
  }
  
  .payment-preview {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .preview-amount {
    font-size: 1.875rem;
  }
  
  .proceed-button {
    padding: 14px 20px;
    font-size: 1rem;
  }
  
  .cancel-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  .quick-amounts {
    margin-bottom: 16px;
    padding-top: 16px;
  }
  
  .quick-amounts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .quick-amount-btn {
    padding: 10px 8px;
    font-size: 0.75rem;
  }
}
</style> 