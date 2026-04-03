import type { Metadata } from "next";
import "./globals.css";
import { APP_URL } from "@/app.constants";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "DiffMind — Free AI Code Diff Tool (No Login) | Analyze GitHub PR & Code Changes",

  description:
    "DiffMind is a free AI-powered code diff tool — no signup required. Compare two code versions or analyze GitHub pull requests instantly. Detect breaking changes, understand logic differences, and get intelligent code review insights.",

  keywords: [
    "AI code diff tool",
    "semantic code diff",
    "git diff alternative",
    "code difference analyzer",
    "compare code online",
    "free code diff tool",
    "online code diff tool no signup",
    "compare code online free",
    "no login code comparison tool",

    "AST code analysis",
    "tree-sitter analyzer",
    "abstract syntax tree tool",
    "code complexity analyzer",
    "cyclomatic complexity checker",

    "AI code review tool",
    "AI developer tools",
    "automated code review AI",
    "code analysis using AI",
    "ai code review tool free",

    "github PR analyzer",
    "pull request code review tool",
    "github diff analyzer",
    "code review automation",
    "github pull request analyzer free",

    "detect breaking changes in code",
    "find bugs in code changes",
    "analyze code changes impact",
    "understand code differences",

    "compare two code files and find logic changes",
    "ai tool to analyze code differences",
    "semantic diff tool for developers",
    "nextjs code analysis tools",
    "best code diff tool for developers",

    "diffmind",
    "diffmind app",
  ],

  authors: [{ name: "Vicky" }],
  creator: "Vicky",
  publisher: "DiffMind",

  metadataBase: new URL(APP_URL),

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title:
      "Free AI Code Diff Tool — No Login Required | DiffMind",
    description:
      "Compare code instantly or analyze GitHub pull requests with AI. No signup required. Detect breaking changes and understand code differences smarter.",
    url: APP_URL,
    siteName: "DiffMind",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${APP_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: "DiffMind AI Code Diff Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free AI Code Diff Tool (No Login) — DiffMind",
    description:
      "Analyze GitHub PRs or compare code instantly. No signup required. AI-powered semantic diff analysis.",
    images: [`${APP_URL}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="canonical" href={APP_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "DiffMind",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "Free AI-powered code diff tool with no signup required. Compare code or analyze GitHub pull requests instantly.",
              url: APP_URL,
              author: {
                "@type": "Person",
                name: "Vicky",
              },
            }),
          }}
        />
      </head>

      <body>
        <Header />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}