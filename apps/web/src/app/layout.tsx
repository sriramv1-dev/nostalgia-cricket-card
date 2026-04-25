import type { Metadata } from "next";
import {
  Inter,
  Roboto_Mono,
  Fredoka,
  Sour_Gummy,
  Inconsolata,
  Nunito,
} from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inconsolata",
});

const sourGummy = Sour_Gummy({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-sour-gummy",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Pocket Cricket Cards",
  description:
    "Relive the 90s. Collect legendary cricket cards inspired by Big Babol Pocket Cricket. Open packs, trade with friends, and battle with your collection.",
  keywords: ["cricket", "cards", "collecting", "90s", "nostalgia", "Big Babol"],
  openGraph: {
    title: "Pocket Cricket Cards",
    description: "Relive the 90s. Collect legends.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${nunito.variable} ${robotoMono.variable} ${fredoka.variable} ${sourGummy.variable} ${inconsolata.variable} dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-gray-950 text-white font-body antialiased min-h-screen">
        <Header />
        <main className="pt-[60px] pb-[60px] md:pb-0">{children}</main>
      </body>
    </html>
  );
}
