import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PSGA - Platform Sistem Grup Akademik",
  description: "Platform internal untuk mahasiswa Informatika.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50`}>
        <main>{children}</main>
        {/* Tambahkan Toaster di sini */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
