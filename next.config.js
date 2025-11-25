/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/licea-webscraper' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/licea-webscraper' : '',
}

module.exports = nextConfig

