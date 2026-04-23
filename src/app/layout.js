import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Root metadata - Base metadata for the entire app
 * Language-specific metadata is handled in [lang]/layout.js
 */
export const metadata = {
  title: "FitBalance",  
  description: "Personalized nutrition guidance and wellness support",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo1.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

/**
 * Root Layout Component
 * Minimal layout that provides fonts and global styles
 * Language-specific layout ([lang]/layout.js) wraps this
 */
export default function RootLayout({ children }) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
