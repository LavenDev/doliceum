/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Dla Vercel nie potrzebujemy basePath ani output: 'export'
  // Vercel automatycznie obsługuje Next.js bez konfiguracji
  images: {
    unoptimized: true, // Dla statycznych eksportów (GitHub Pages)
  },
}

module.exports = nextConfig

