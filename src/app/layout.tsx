import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "Ehemaligenturnier · SC Münster 08 Handball",
    template: "%s · Ehemaligenturnier SC Münster 08",
  },
  description: "Das Wiedersehen der Ehemaligen der Handballabteilung des SC Münster 08. Melde dich an und sieh, wer schon dabei ist.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Ehemaligenturnier SC Münster 08",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
