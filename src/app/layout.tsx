import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "K-Chat Friends",
  description: "Chat with Korean AI friends — mobile web demo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoKr.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-noto-kr), var(--font-geist-sans), system-ui" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
