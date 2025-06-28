import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import AuthProvider from './context/AuthProvider'
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FluencyLab",
  description: "Vem aprender idiomas com a gente!",
  keywords: "idiomas, aprender idiomas, FluencyLab, ensino de idiomas, aprender inglês, aprender espanhol, fluency, estudar ingles, ingles, espanhol",
  robots: "index, follow",  // Instructions for search engines to index and follow links
  openGraph: {
    title: "FluencyLab",
    description: "Vem aprender idiomas com a gente!",
    url: "https://www.fluencylab.me", // Replace with the actual URL
    images: "https://www.fluencylab.me/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ficon-brand.ce44cb2b.png&w=128&q=75", // Replace with actual image URL
    siteName: "FluencyLab",
    type: "website",
  },
  themeColor: "#1A237E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <head>
      <meta name="facebook-domain-verification" content="g1muw31ez0tols60duvhrf6gv3ntfv" />
      </head>
      <body className={quicksand.className}>
        <AuthProvider>
          <main>
            {children}
            <Analytics />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
