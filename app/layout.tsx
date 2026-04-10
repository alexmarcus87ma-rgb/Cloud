import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Your Retro Gaming Platform",
  description: "Cyberpunk arcade — pick your game, climb the leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pressStart2P.variable}>
      <body className="font-retro bg-black text-neon-green antialiased">
        {/* Scanlines overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
