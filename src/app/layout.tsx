import type { Metadata } from "next";
import { Inter, Oswald, Patrick_Hand } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bar Manager IO - Modular SaaS for Gastronomy Management",
  description: "Next-gen B2B Multi-tenant platform for restaurant and bar management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} ${patrickHand.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}
