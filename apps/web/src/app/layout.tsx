import type { Metadata } from "next";
import { Sour_Gummy, Inconsolata } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { PageHeaderSlot } from "@/components/layout/PageHeaderSlot";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { PageHeaderProvider } from "@/context/PageHeaderContext";
import "./globals.css";

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
      className={`${sourGummy.variable} ${inconsolata.variable} dark`}
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
        <PageTitleProvider>
          <PageHeaderProvider>
            <Header />
            <PageHeaderSlot />
            <main className="pt-[112px] pb-[60px] md:pb-0">{children}</main>
          </PageHeaderProvider>
        </PageTitleProvider>
      </body>
    </html>
  );
}
