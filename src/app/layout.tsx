import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";
import localFont from "next/font/local";
import "./globals.css";

import styles from './layout.module.css';
import { GlobalContextProvider } from "~/contexts/GlobalContext";

const honkai = localFont({
  variable: "--font-honkai",
  src: [
    {
      path: '../assets/fonts/medium.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/bold.woff2',
      weight: '700',
      style: 'normal',
    }
  ],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Мозаика грёз | Honkai: Star Rail",
  description: "Интерактивная паззл игра по мотивам Мозаики грёз из Honkai: Star Rail",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ],
    shortcut: [
      { url: '/favicon.ico' }
    ]
  },
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="ru" className={honkai.variable}>
      <body>
        <GlobalContextProvider className={styles.base}>
          {children}
        </GlobalContextProvider>
      </body>
    </html>
  );
}
