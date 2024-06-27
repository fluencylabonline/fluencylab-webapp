import type { Metadata } from "next";
import Head from 'next/head'; // Import Head component
import AuthProvider from './context/AuthProvider'
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FluencyLab",
  description: "Vem aprender idiomas!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <Head>
        <meta name="facebook-domain-verification" content="8y8nsc78rg9tlgmnxtwr4rpz24ixim" />
      </Head>
      <body className={quicksand.className}>
        <AuthProvider>
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
