import crypto from 'crypto'
import Razorpay from 'razorpay'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { gateway = 'razorpay' } = body

    // Handle PhonePe verification
    if (gateway === 'phonepe') {
      const { merchantOrderId, accessToken } = body

      if (!merchantOrderId || !accessToken) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing required PhonePe verification parameters'
        })
      }

      const phonepeResponse = await $fetch('/api/payment/phonepe-verify', {
        method: 'POST',
        body: {
          merchantOrderId,
          accessToken
        }
      }) as any

      return phonepeResponse
    }

    // Handle Razorpay verification (existing logic)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required payment verification parameters'
      })
    }

    const config = useRuntimeConfig()
    
    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId!,
      key_secret: config.razorpayKeySecret!,
    })

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    const isSignatureValid = expectedSignature === razorpay_signature

    if (!isSignatureValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payment signature'
      })
    }

    // Fetch payment details
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    return {
      success: true,
      gateway: 'razorpay',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount: Number(payment.amount) / 100, // Convert back to rupees
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      created_at: payment.created_at
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Payment verification failed'
    })
  }
}) 