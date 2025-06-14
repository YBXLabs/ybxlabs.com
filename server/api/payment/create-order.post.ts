import Razorpay from 'razorpay'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { amount, currency = 'INR' } = body

    if (!amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount is required'
      })
    }

    const config = useRuntimeConfig()
    
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