import type { Metadata } from "next";
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
      <head>
      <meta name="facebook-domain-verification" content="byjdeqr1mlr47yl0ptf7xwdrmoa1hc" />
      </head>
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
