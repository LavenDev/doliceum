/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'licea-webscraper'
const basePath = isProd ? `/${repoName}` : ''
const assetPrefix = isProd ? `/${repoName}` : ''

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: basePath,
  assetPrefix: assetPrefix,
}

module.exports = nextConfig

