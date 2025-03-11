import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wheeloh - App",
  description: "This app is the ultimate mobile app for car enthusiasts. Identify makes, track rare cars, and share your sightings with passionate friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
