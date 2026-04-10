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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <h1
            className="mb-2 text-sm leading-loose tracking-widest text-[#00FF41]"
            style={{ textShadow: "0 0 6px #00FF41, 0 0 18px #00FF41, 0 0 40px #00FF41" }}
          >
            YOUR RETRO
            <br />
            GAMING PLATFORM
          </h1>
          <div
            className="mt-4 text-xs tracking-widest"
            style={{ color: "#FF00FF", textShadow: "0 0 8px #FF00FF" }}
          >
            ▓▒░ PLAYER LOGIN ░▒▓
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded border border-[#00FF41] bg-black p-8"
          style={{
            boxShadow:
              "0 0 8px #00FF41, 0 0 20px rgba(0,255,65,0.2), inset 0 0 10px rgba(0,255,65,0.03)",
          }}
        >
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] tracking-widest text-[#00FFFF]"
              style={{ textShadow: "0 0 6px #00FFFF" }}
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
              className="w-full rounded border border-[#00FF41] bg-black px-4 py-3 text-[10px] text-[#00FF41] placeholder-[#00FF41]/30 outline-none transition-all focus:border-[#00FFFF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,255,65,0.08)" }}
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="password"
              className="mb-2 block text-[10px] tracking-widest text-[#00FFFF]"
              style={{ textShadow: "0 0 6px #00FFFF" }}
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
              className="w-full rounded border border-[#00FF41] bg-black px-4 py-3 text-[10px] text-[#00FF41] placeholder-[#00FF41]/30 outline-none transition-all focus:border-[#00FFFF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,255,65,0.08)" }}
            />
          </div>

          {error && (
            <div
              className="mb-6 rounded border border-[#FF00FF] px-4 py-3 text-center text-[9px] leading-relaxed tracking-widest text-[#FF00FF]"
              style={{ textShadow: "0 0 6px #FF00FF", boxShadow: "0 0 6px rgba(255,0,255,0.3)" }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-[#00FF41] bg-black py-4 text-[11px] tracking-[0.3em] text-[#00FF41] transition-all hover:bg-[#00FF41] hover:text-black disabled:opacity-50"
            style={{
              boxShadow: loading ? "none" : "0 0 8px #00FF41, 0 0 20px rgba(0,255,65,0.3)",
            }}
          >
            {loading ? (
              <span className="animate-cursor-blink">AUTHENTICATING...</span>
            ) : (
              "▶ INSERT COIN"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[8px] tracking-widest text-[#00FF41]/40">
          NO ACCOUNT?{" "}
          <a
            href="/setup"
            className="text-[#FF00FF]/70 underline hover:text-[#FF00FF]"
            style={{ textShadow: "0 0 4px #FF00FF" }}
          >
            INITIALIZE
          </a>
          <span className="animate-cursor-blink ml-1">_</span>
        </p>
      </div>
    </main>
  );
}
