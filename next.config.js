/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'doliceum'

// Dla GitHub Pages potrzebujemy statycznego eksportu z basePath
// Dla Vercel nie potrzebujemy niczego - automatyczna konfiguracja
const nextConfig = {
  reactStrictMode: true,
  // Tylko dla GitHub Pages - Vercel automatycznie obsługuje Next.js
  ...(isGitHubPages && {
    output: 'export',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}`,
  }),
  images: {
    unoptimized: isGitHubPages, // Tylko dla statycznego eksportu (GitHub Pages)
  },
}

module.exports = nextConfig
