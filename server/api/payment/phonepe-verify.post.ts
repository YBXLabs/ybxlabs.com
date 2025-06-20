interface PhonePeOrderStatusResponse {
  orderId: string
  state: string
  amount: number
  expireAt: number
  metaInfo?: {
    udf1?: string
    udf2?: string
    udf3?: string
    udf4?: string
    udf5?: string
  }
  paymentDetails?: Array<{
    transactionId: string
    paymentMode: string
    timestamp: number
    amount: number
    state: string
    rail?: {
      type: string
      utr?: string
      upiTransactionId?: string
      vpa?: string
    }
    instrument?: {
      type: string
      maskedAccountNumber?: string
      accountType?: string
    }
  }>
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { merchantOrderId, accessToken } = body

    if (!merchantOrderId || !accessToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required payment verification parameters'
      })
    }

    // PhonePe Order Status API endpoint (PROD) - as per documentation
    const statusUrl = `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`

    const response = await $fetch<PhonePeOrderStatusResponse>(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`
      }
    })

    // Convert state to match our expected format
    const isSuccess = response.state === 'COMPLETED'
    
    // Get transaction details from payment details if available
    const paymentDetail = response.paymentDetails?.[0]
    const transactionId = paymentDetail?.transactionId
    const paymentMethod = paymentDetail?.paymentMode?.toLowerCase() || 'phonepe'
    const timestamp = paymentDetail?.timestamp
    
    return {
      success: isSuccess,
      order_id: response.orderId,
      merchant_order_id: merchantOrderId,
      amount: Number(response.amount) / 100, // Convert back from paisa
      currency: 'INR',
      status: response.state,
      transaction_id: transactionId,
      method: paymentMethod,
      created_at: timestamp,
      gateway: 'phonepe',
      expire_at: response.expireAt,
      meta_info: response.metaInfo
    }
  } catch (error: any) {
    console.error('PhonePe payment verification error:', error)
    
    // Log more details for debugging
    if (error.data) {
      console.error('PhonePe verify order error response:', error.data)
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'PhonePe payment verification failed'
    })
  }
}) 