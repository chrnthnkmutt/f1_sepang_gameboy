import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sepang Pocket Grand Prix",
  description: "A playable, pixel-art Sepang racing game for your browser.",
  applicationName: "Pocket Grand Prix",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pocket GP" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#132437",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
