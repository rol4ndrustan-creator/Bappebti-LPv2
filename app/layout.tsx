import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { ToastProvider } from "@/components/shared/toast-provider";
import { DemoSessionProvider } from "@/lib/demo-session";
import { PublikAuthProvider } from "@/lib/publik-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Layanan Pengaduan Bappebti",
  description: "Demo platform pengaduan terintegrasi Bappebti - PT Capio Teknologi Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DemoSessionProvider>
          <PublikAuthProvider>
            <ToastProvider>
              <TopNav />
              <div className="flex flex-1 min-h-0">{children}</div>
            </ToastProvider>
          </PublikAuthProvider>
        </DemoSessionProvider>
      </body>
    </html>
  );
}
