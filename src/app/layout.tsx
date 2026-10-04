import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Delcom Posts",
    template: "%s · Delcom Posts",
  },
  description:
    "Berbagi cerita dan foto sampul, lengkap dengan suka dan komentar. Dibangun dengan Next.js dan Delcom Open API.",
};

export const viewport: Viewport = {
  themeColor: "#4338ca",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-stone-100 text-slate-800 antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}