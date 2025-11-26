/** @type {import('next').NextConfig} */
// Sprawdź czy jesteśmy na Vercel (nie używamy output: 'export' dla Vercel)
const isVercel = process.env.VERCEL === '1'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'doliceum'

// Dla GitHub Pages potrzebujemy statycznego eksportu z basePath
// Dla Vercel nie używamy output: 'export' - Vercel automatycznie obsługuje Next.js
const nextConfig = {
  reactStrictMode: true,
  // Tylko dla GitHub Pages (nie dla Vercel)
  ...(isGitHubPages && !isVercel && {
    output: 'export',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}`,
  }),
  images: {
    unoptimized: isGitHubPages && !isVercel, // Tylko dla statycznego eksportu (GitHub Pages)
  },
}

module.exports = nextConfig
