// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { OWNER_NAME } from "@/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finatic AI — Real-Time Financial Product Comparison",
  description:
    "Finatic AI compares live APYs, CD rates, money market options and credit card offers — instantly and transparently.",
  themeColor: "#0F63D8",
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "Finatic AI — Real-Time Financial Product Comparison",
    description:
      "Finatic AI compares live APYs, CD rates, money market options and credit card offers — instantly and transparently.",
    url: "https://yourdomain.com",
    siteName: "Finatic AI",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Finatic AI — Real-Time Financial Product Comparison",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        {/* Accessibility: skip link for keyboard users */}
        <a
          href="#content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white p-2 rounded shadow"
        >
          Skip to content
        </a>

        {/* Top header */}
        <header
          className="w-full border-b bg-background/60 backdrop-blur-sm"
          role="banner"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                {/* Inline piggy logo (SVG) */}
                <Link href="/" className="flex items-center gap-3 no-underline">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                    className="rounded"
                  >
                    <circle cx="32" cy="32" r="30" fill="#0F63D8" />
                    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 36c0 0 4-10 18-10 0 0 6 0 10 6 0 0 0 8-8 12" />
                    </g>
                  </svg>

                  <div className="text-sm font-semibold tracking-tight text-foreground">
                    <span style={{ lineHeight: 1 }}>Finatic&nbsp;AI</span>
                    <span className="sr-only"> — Real-time financial product comparison</span>
                  </div>
                </Link>
              </div>

              <nav aria-label="Main navigation" className="flex items-center gap-3 text-sm">
                <Link href="/terms" className="text-muted-foreground hover:text-foreground underline">
                  Terms
                </Link>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground underline">
                  Docs
                </Link>
                <span className="px-3 py-1 rounded bg-muted/10 text-xs text-muted-foreground">Live</span>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content container */}
        <div className="min-h-screen flex flex-col">
          <main id="content" className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full border-t bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-muted-foreground">
              <div>
                © {new Date().getFullYear()} {OWNER_NAME ?? "Finatic AI"}. All rights reserved.
              </div>
              <div className="flex items-center gap-3">
                <Link href="/privacy" className="underline">
                  Privacy
                </Link>
                <Link href="/contact" className="underline">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
