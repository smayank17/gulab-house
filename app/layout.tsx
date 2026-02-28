import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gulab House — Premium Homemade Indian Sweets",
  description: "Order premium homemade Gulab Jamun & Kaal Jamun in under 60 seconds.",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-neutral-900 antialiased">{children}</body>
    </html>
  );
}