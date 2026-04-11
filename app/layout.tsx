import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "CYBER ARCADE // 2077",
  description: "Cyberpunk arcade — pick your game, climb the leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={pressStart2P.variable}>
      <body className="font-retro antialiased" style={{ background: "#08001F", color: "#00D4FF" }}>
        {/* Scanlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 4px)",
          }}
        />
        {/* Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
