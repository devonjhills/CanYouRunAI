import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { JsonLd } from "./components/JsonLd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.canyourunai.com"),
  title: {
    default: "CanYouRunAI.com - Check if your system can run local LLMs",
    template: "%s | CanYouRunAI.com",
  },
  description:
    "Check if your system can run local Large Language Models like LLaMA, Mistral, and GPT4All. Free system compatibility checker for AI models.",
  keywords: [
    "AI compatibility checker",
    "LLM system requirements",
    "run AI locally",
    "AI hardware requirements",
    "LLaMA compatibility",
    "Mistral requirements",
    "local AI models",
  ],
  authors: [{ name: "CanYouRunAI Team" }],
  creator: "CanYouRunAI.com",
  publisher: "CanYouRunAI.com",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.canyourunai.com",
    siteName: "CanYouRunAI.com",
    title: "Check if your system can run local LLMs",
    description:
      "Free tool to check if your computer can run local Large Language Models",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CanYouRunAI.com - AI System Compatibility Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CanYouRunAI.com - Check if your system can run local LLMs",
    description:
      "Free tool to check if your computer can run local Large Language Models",
    images: ["/og-image.jpg"],
    creator: "@canyourunai",
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
  verification: {
    google: "your-google-site-verification-code", // Add your verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <JsonLd />
        </ThemeProvider>
      </body>
    </html>
  );
}
