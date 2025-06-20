import crypto from 'crypto'

interface PhonePeCreatePaymentRequest {
  merchantOrderId: string
  amount: number
  expireAfter?: number
  metaInfo?: {
    udf1?: string
    udf2?: string
    udf3?: string
    udf4?: string
    udf5?: string
  }
  paymentFlow: {
    type: 'PG_CHECKOUT'
    message?: string
    merchantUrls: {
      redirectUrl: string
    }
  }
}

interface PhonePeCreatePaymentResponse {
  orderId: string
  state: string
  expireAt: number
  redirectUrl: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { amount, accessToken } = body

    if (!amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount is required'
      })
    }

    if (!accessToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Access token is required'
      })
    }

    const config = useRuntimeConfig()
    
    // PhonePe only supports INR
    const currency = 'INR'
    
    // Generate unique merchant order ID
    const merchantOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create payment request as per PhonePe documentation
    const paymentRequest: PhonePeCreatePaymentRequest = {
      merchantOrderId,
      amount: amount * 100, // PhonePe expects amount in paisa (like Razorpay)
      expireAfter: 1200, // 20 minutes
      metaInfo: {
        udf1: 'YBX Labs Payment',
        udf2: currency,
        udf3: amount.toString(),
        udf4: 'Web Payment',
        udf5: 'PhonePe Gateway'
      },
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: `Payment of ₹${amount} for YBX Labs`,
        merchantUrls: {
          redirectUrl: `${config.public.siteUrl}/payment/phonepe-success`
        }
      }
    }

    // PhonePe create payment endpoint (PROD) - as per documentation
    const createPaymentUrl = 'https://api.phonepe.com/apis/pg/checkout/v2/pay'

    const response = await $fetch<PhonePeCreatePaymentResponse>(createPaymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`
      },
      body: paymentRequest
    })

    return {
      success: true,
      order_id: response.orderId,
      merchant_order_id: merchantOrderId,
      amount: amount,
      currency: currency,
      redirect_url: response.redirectUrl,
      expire_at: response.expireAt,
      state: response.state
    }
  } catch (error: any) {
    console.error('PhonePe payment creation error:', error)
    
    // Log more details for debugging
    if (error.data) {
      console.error('PhonePe create order error response:', error.data)
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create PhonePe payment order'
    })
  }
}) 