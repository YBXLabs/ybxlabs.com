import crypto from 'crypto'

interface PhonePeAuthResponse {
  access_token: string
  encrypted_access_token?: string
  expires_in?: number
  issued_at?: number
  expires_at?: number
  session_expires_at?: number
  token_type?: string
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    if (!config.phonepeClientId || !config.phonepeApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'PhonePe credentials not configured'
      })
    }

    // PhonePe authorization endpoint (PROD) - correct endpoint as per documentation
    const authUrl = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'

    // Create authorization request body as form data (application/x-www-form-urlencoded)
    const authPayload = new URLSearchParams({
      client_id: config.phonepeClientId,
      client_secret: config.phonepeApiKey,
      client_version: '1', // For production, should be value from credentials email, but '1' works for most cases
      grant_type: 'client_credentials'
    })

    const response = await $fetch<PhonePeAuthResponse>(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: authPayload.toString()
    })

    return {
      success: true,
      accessToken: response.access_token,
      expiresAt: response.expires_at,
      issuedAt: response.issued_at,
      tokenType: response.token_type || 'O-Bearer'
    }
  } catch (error: any) {
    console.error('PhonePe authorization error:', error)
    
    // Log more details for debugging
    if (error.data) {
      console.error('PhonePe error response:', error.data)
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'PhonePe authorization failed'
    })
  }
}) 