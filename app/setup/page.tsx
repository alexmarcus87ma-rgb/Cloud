"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("PASSWORDS DO NOT MATCH");
      return;
    }
    if (password.length < 8) {
      setError("PASSWORD MUST BE AT LEAST 8 CHARACTERS");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (authError) {
        setError(authError.message?.toUpperCase() ?? "REGISTRATION FAILED");
      } else {
        router.push("/select-game");
      }
    } catch {
      setError("CONNECTION ERROR. RETRY.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#08001F] px-4 py-12">
      {/* Background grid */}
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
        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            className="animate-glitch mb-2 text-center text-sm leading-loose tracking-widest text-[#00D4FF] sm:text-base"
            style={{
              textShadow:
                "0 0 6px #00D4FF, 0 0 18px #00D4FF, 0 0 40px #00D4FF",
            }}
          >
            YOUR RETRO
            <br />
            GAMING PLATFORM
          </h1>
          <div
            className="mt-4 text-xs tracking-widest"
            style={{ color: "#FF0080", textShadow: "0 0 8px #FF0080" }}
          >
            ▓▒░ INITIALIZE ACCOUNT ░▒▓
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded border border-[#00D4FF] bg-[#08001F] p-8"
          style={{
            boxShadow:
              "0 0 8px #00D4FF, 0 0 20px rgba(0,212,255,0.2), inset 0 0 10px rgba(0,212,255,0.04)",
          }}
        >
          {/* Player name */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="mb-2 block text-[10px] tracking-widest text-[#00D4FF]"
              style={{ textShadow: "0 0 6px #00D4FF" }}
            >
              PLAYER NAME
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="username"
              placeholder="ENTER CALLSIGN..."
              className="w-full rounded border border-[#00D4FF] bg-[#08001F] px-4 py-3 text-[10px] text-[#00D4FF] placeholder-[#00D4FF]/30 outline-none transition-all focus:border-[#00D4FF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,212,255,0.08)" }}
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-[10px] tracking-widest text-[#00D4FF]"
              style={{ textShadow: "0 0 6px #00D4FF" }}
            >
              SET PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="MIN 8 CHARACTERS"
              className="w-full rounded border border-[#00D4FF] bg-[#08001F] px-4 py-3 text-[10px] text-[#00D4FF] placeholder-[#00D4FF]/30 outline-none transition-all focus:border-[#00D4FF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,212,255,0.08)" }}
            />
          </div>

          {/* Confirm password */}
          <div className="mb-8">
            <label
              htmlFor="confirm"
              className="mb-2 block text-[10px] tracking-widest text-[#00D4FF]"
              style={{ textShadow: "0 0 6px #00D4FF" }}
            >
              CONFIRM PASSWORD
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="REPEAT PASSWORD"
              className="w-full rounded border border-[#00D4FF] bg-[#08001F] px-4 py-3 text-[10px] text-[#00D4FF] placeholder-[#00D4FF]/30 outline-none transition-all focus:border-[#00D4FF]"
              style={{ boxShadow: "inset 0 0 6px rgba(0,212,255,0.08)" }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mb-6 rounded border border-[#FF0080] px-4 py-3 text-center text-[9px] leading-relaxed tracking-widest text-[#FF0080]"
              style={{ textShadow: "0 0 6px #FF0080", boxShadow: "0 0 6px rgba(255,0,128,0.3)" }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-[#00D4FF] bg-[#08001F] py-4 text-[11px] tracking-[0.3em] text-[#00D4FF] transition-all hover:bg-[#00D4FF] hover:text-black disabled:opacity-50"
            style={{
              boxShadow: loading
                ? "none"
                : "0 0 8px #00D4FF, 0 0 20px rgba(0,212,255,0.3)",
            }}
          >
            {loading ? (
              <span className="animate-cursor-blink">INITIALIZING...</span>
            ) : (
              "▶ ACTIVATE ACCOUNT"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-[8px] tracking-widest text-[#00D4FF]/40">
          ALREADY REGISTERED?{" "}
          <a
            href="/login"
            className="text-[#FF0080]/70 underline hover:text-[#FF0080]"
            style={{ textShadow: "0 0 4px #FF0080" }}
          >
            LOGIN
          </a>
          <span className="animate-cursor-blink ml-1">_</span>
        </p>
      </div>
    </main>
  );
}
