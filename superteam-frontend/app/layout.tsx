import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { IntlProvider } from "@/components/providers/intl-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { LazyAiAssistant } from "@/components/chat/ai-assistant-lazy";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "SuperTeam Academy - Interactive Blockchain Education",
    template: "%s | SuperTeam Academy",
  },
  description:
    "Master Solana, Rust, and Web3 development through interactive coding challenges, gamified learning paths, and on-chain credentials.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "SuperTeam Academy",
    title: "SuperTeam Academy - Interactive Blockchain Education",
    description:
      "Master Solana, Rust, and Web3 development through interactive coding challenges, gamified learning paths, and on-chain credentials.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1b231d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${archivo.variable} font-sans antialiased`}
      >
        <IntlProvider
          locale={locale}
          messages={messages as Record<string, unknown>}
        >
          <AppProviders>
            <Navbar />
            {children}
            <LazyAiAssistant />
            <Toaster position="bottom-right" />
          </AppProviders>
        </IntlProvider>
      </body>
    </html>
  );
}
