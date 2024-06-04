import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DrawingProvider } from "./context/drawing-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Canvas"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DrawingProvider>
          {children}
        </DrawingProvider>
        </body>
    </html>
  );
}
