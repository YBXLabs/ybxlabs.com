import Razorpay from 'razorpay'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { amount, currency = 'INR', gateway = 'razorpay' } = body

    if (!amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount is required'
      })
    }

    const config = useRuntimeConfig()

    // If PhonePe is selected and currency is INR
    if (gateway === 'phonepe' && currency === 'INR') {
      // First get PhonePe access token
      const authResponse = await $fetch('/api/payment/phonepe-auth', {
        method: 'POST'
      }) as any

      if (!authResponse.success) {
        throw new Error('Failed to authenticate with PhonePe')
      }

      // Create PhonePe payment order
      const phonepeResponse = await $fetch('/api/payment/phonepe-create-order', {
        method: 'POST',
        body: {
          amount,
          accessToken: authResponse.accessToken
        }
      }) as any

      return {
        success: true,
        gateway: 'phonepe',
        order_id: phonepeResponse.order_id,
        merchant_order_id: phonepeResponse.merchant_order_id,
        amount: phonepeResponse.amount,
        currency: phonepeResponse.currency,
        redirect_url: phonepeResponse.redirect_url,
        access_token: authResponse.accessToken // Pass token for verification later
      }
    }

    // For Razorpay (default) or non-INR currencies
    // Debug logging for environment variables
    console.log('Environment Debug:', {
      hasKeyId: !!config.razorpayKeyId,
      hasKeySecret: !!config.razorpayKeySecret,
      keyIdLength: config.razorpayKeyId?.length || 0,
      keySecretLength: config.razorpayKeySecret?.length || 0,
      nodeEnv: process.env.NODE_ENV
    })

    if (!config.razorpayKeyId || !config.razorpayKeySecret) {
      console.error('Missing Razorpay credentials:', {
        keyId: !!config.razorpayKeyId,
        keySecret: !!config.razorpayKeySecret
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Payment gateway not configured'
      })
    }
    
    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    })

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    }

    const order = await razorpay.orders.create(options)

    return {
      success: true,
      gateway: 'razorpay',
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: config.razorpayKeyId
    }
  } catch (error) {
    console.error('Payment order creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create payment order'
    })
  }
}) 