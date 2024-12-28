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
    images: "https://firebasestorage.googleapis.com/v0/b/fluencylab-webapp.appspot.com/o/anima%C3%A7%C3%B5es%2Fbrand-looping-only.webm?alt=media&token=040f0a1f-e733-4cd7-9062-e904c577d2c1", // Replace with actual image URL
    siteName: "FluencyLab",
    type: "website",
  },
  themeColor: "#21B5DE",
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
