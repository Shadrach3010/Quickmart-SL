import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickmart-sl.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QuickMart SL",
    template: "%s | QuickMart SL",
  },
  description: "Shop trusted supermarkets in Sierra Leone with local payments and home delivery.",
  applicationName: "QuickMart SL",
  keywords: ["Sierra Leone groceries", "Freetown delivery", "online supermarket", "QuickMart SL"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "QuickMart SL",
    description: "Groceries from trusted Sierra Leone supermarkets, delivered.",
    url: siteUrl,
    siteName: "QuickMart SL",
    locale: "en_SL",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "QuickMart SL", description: "Your groceries, delivered today." },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-SL" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
