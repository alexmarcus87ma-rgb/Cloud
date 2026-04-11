"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message?.toUpperCase() ?? "LOGIN FAILED");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("CONNECTION ERROR. RETRY.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#08001F] px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <h1
            className="mb-2 text-sm leading-loose tracking-widest text-[#00D4FF]"
            style={{ textShadow: "0 0 6px #00D4FF, 0 0 18px #00D4FF, 0 0 40px #00D4FF" }}
          >
            YOUR RETRO
            <br />
            GAMING PLATFORM
          </h1>
          <div
            className="mt-4 text-xs tracking-widest"
            style={{ color: "#FF0080", textShadow: "0 0 8px #FF0080" }}
          >
            ▓▒░ PLAYER LOGIN ░▒▓
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded border border-[#00D4FF] bg-[#08001F] p-8"
          style={{
            boxShadow:
              "0 0 8px #00D4FF, 0 0 20px rgba(0,212,255,0.2), inset 0 0 10px rgba(0,212,255,0.04)",
          }}
        >
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] tracking-widest text-[#00D4FF]"
              style={{ textShadow: "0 0 6px #00D4FF" }}
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="user@arcade.net"
              className="w-full rounded border border-[#00D4FF] bg-[#08001F] px-4 py-3 text-[10px] text-[#00D4FF] placeholder-[#00D4FF]/30 outline-none transition-all focus:border-[#00D4FF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,212,255,0.08)" }}
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="password"
              className="mb-2 block text-[10px] tracking-widest text-[#00D4FF]"
              style={{ textShadow: "0 0 6px #00D4FF" }}
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded border border-[#00D4FF] bg-[#08001F] px-4 py-3 text-[10px] text-[#00D4FF] placeholder-[#00D4FF]/30 outline-none transition-all focus:border-[#00D4FF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,212,255,0.08)" }}
            />
          </div>

          {error && (
            <div
              className="mb-6 rounded border border-[#FF0080] px-4 py-3 text-center text-[9px] leading-relaxed tracking-widest text-[#FF0080]"
              style={{ textShadow: "0 0 6px #FF0080", boxShadow: "0 0 6px rgba(255,0,128,0.3)" }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-[#00D4FF] bg-[#08001F] py-4 text-[11px] tracking-[0.3em] text-[#00D4FF] transition-all hover:bg-[#00D4FF] hover:text-black disabled:opacity-50"
            style={{
              boxShadow: loading ? "none" : "0 0 8px #00D4FF, 0 0 20px rgba(0,212,255,0.3)",
            }}
          >
            {loading ? (
              <span className="animate-cursor-blink">AUTHENTICATING...</span>
            ) : (
              "▶ INSERT COIN"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[8px] tracking-widest text-[#00D4FF]/40">
          NO ACCOUNT?{" "}
          <a
            href="/setup"
            className="text-[#FF0080]/70 underline hover:text-[#FF0080]"
            style={{ textShadow: "0 0 4px #FF0080" }}
          >
            INITIALIZE
          </a>
          <span className="animate-cursor-blink ml-1">_</span>
        </p>
      </div>
    </main>
  );
}
