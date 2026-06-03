import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { PlanLimitProvider } from "@/src/context/PlanLimitContext";
import PWARegister from "@/src/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventia - Gestión de Eventos",
  description: "Plataforma de gestión de eventos",
  appleWebApp: {
    capable: true,
    title: "Eventia",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script para evitar flash de tema incorrecto */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var dark = theme === 'dark' || 
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
                    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList.add(dark ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <PWARegister />
            <PlanLimitProvider>
              {children}
            </PlanLimitProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

