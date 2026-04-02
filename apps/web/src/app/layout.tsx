import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pocket Cricket Cards',
  description:
    'Relive the 90s. Collect legendary cricket cards inspired by Big Babol Pocket Cricket. Open packs, trade with friends, and battle with your collection.',
  keywords: ['cricket', 'cards', 'collecting', '90s', 'nostalgia', 'Big Babol'],
  openGraph: {
    title: 'Pocket Cricket Cards',
    description: 'Relive the 90s. Collect legends.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-white font-body antialiased min-h-screen">
        <div className="max-w-md mx-auto min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
