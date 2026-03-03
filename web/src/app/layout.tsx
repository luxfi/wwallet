import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Lux Wallet', template: '%s | Lux Wallet' },
  description: 'Manage your assets on the Lux Network — C, P, and X chains',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Lux Wallet',
    description: 'Manage your assets on the Lux Network — C, P, and X chains',
    url: 'https://wallet.lux.network',
    siteName: 'Lux Wallet',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Lux Wallet' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lux Wallet',
    description: 'Manage your assets on the Lux Network — C, P, and X chains',
    images: ['/og-image.png'],
  },
  metadataBase: new URL('https://wallet.lux.network'),
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
