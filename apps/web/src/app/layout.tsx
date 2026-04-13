import type { Metadata } from 'next'
import { Inter, Roboto_Mono, Supermercado_One } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

const supermercado = Supermercado_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-supermercado',
})

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
    <html lang="en" className={`${inter.variable} ${robotoMono.variable} ${supermercado.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-gray-950 text-white font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
