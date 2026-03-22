import type { Metadata } from "next";
import "./globals.css";
import { APP_URL } from "@/app.constants";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiffMind — Semantic Code Diff Analyzer",
  description:
    "Go beyond line diffs. DiffMind uses AST parsing and AI to explain what your code changes actually mean — breaking changes, complexity shifts, and actionable fixes.",
  keywords: [
    "code diff",
    "semantic analysis",
    "AST parser",
    "code review",
    "tree-sitter",
    "AI code analyzer",
  ],
  authors: [{ name: "Vicky" }],
  openGraph: {
    title: "DiffMind — Semantic Code Diff Analyzer",
    description:
      "Go beyond line diffs. DiffMind uses AST parsing and AI to explain what your code changes actually mean.",
    url: APP_URL,
    siteName: "DiffMind",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiffMind — Semantic Code Diff Analyzer",
    description:
      "Go beyond line diffs. DiffMind uses AST parsing and AI to explain what your code changes actually mean.",
  },
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
