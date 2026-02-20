'use client';

import { Inter, Outfit, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RamadanCountdown from "@/components/sections/RamadanCountdown";
import SplashScreen from "@/components/ui/SplashScreen";
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} ${arabic.variable} font-body antialiased bg-off-white text-slate-text`}
      >
        <SplashScreen />
        {!isAuthPage && (
          <div className="fixed top-0 left-0 right-0 z-[100]">
            <RamadanCountdown />
            <Navbar />
          </div>
        )}
        {children}
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}

