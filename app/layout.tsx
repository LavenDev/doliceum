import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kalkulator Punktów Rekrutacyjnych - Licea Kraków 2025/2026',
  description: 'Oblicz swoje punkty rekrutacyjne i sprawdź, do których liceów w Krakowie masz szansę się dostać',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

