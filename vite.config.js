import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const lambdaUrl = 'https://lp5h7egegt2wlrfpur4egp6jge0hwvmy.lambda-url.us-east-1.on.aws'
const imageCdnUrls = 'https: https://images.email-platform.com https://imgcdn.email-platform.com'

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: " + imageCdnUrls + "; font-src 'self' data:; connect-src 'self' " + lambdaUrl,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  Server: 'Example Insurance-Frontend',
}

const devSecurityHeaders = {
  ...securityHeaders,
}

delete devSecurityHeaders['Content-Security-Policy']

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    headers: command === 'serve' ? devSecurityHeaders : securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
}))
