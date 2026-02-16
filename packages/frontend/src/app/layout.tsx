import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OffMark - Get Early Access",
  description: "Join the waitlist for OffMark - Your fashion community platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
