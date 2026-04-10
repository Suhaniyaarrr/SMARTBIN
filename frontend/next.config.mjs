import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const toOriginList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const defaultAllowedDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.56.1:3000',
]

const envAllowedDevOrigins = toOriginList(process.env.NEXT_ALLOWED_DEV_ORIGINS)
const allowedDevOrigins = Array.from(new Set([...defaultAllowedDevOrigins, ...envAllowedDevOrigins]))

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin.replace(/\/$/, '')}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${backendOrigin.replace(/\/$/, '')}/health`,
      },
    ]
  },
}

if (process.env.DEBUG_NEXT_CONFIG === '1') {
  console.log('[next.config] allowedDevOrigins =', allowedDevOrigins)
}

export default nextConfig
