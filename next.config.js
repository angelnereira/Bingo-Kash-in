/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimización para Vercel
  output: 'standalone',
  typescript: {
    // En producción, ignorar errores temporalmente
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // En producción, ignorar warnings temporalmente
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
