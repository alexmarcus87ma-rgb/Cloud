"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Game = "tetris" | "pacman";

export default function SelectGamePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [selecting, setSelecting] = useState<Game | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
    if (!isPending && session?.user?.game) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  async function handleSelect(game: Game) {
    setSelecting(game);
    setError("");
    try {
      const { error: updateError } = await authClient.updateUser({ game });
      if (updateError) {
        setError(updateError.message?.toUpperCase() ?? "UPDATE FAILED");
        setSelecting(null);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("CONNECTION ERROR. RETRY.");
      setSelecting(null);
    }
  }

  if (isPending || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="animate-cursor-blink text-[10px] tracking-widest text-[#00D4FF]">
          LOADING...
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="mb-4 text-[9px] tracking-widest text-[#00D4FF]/50"
          >
            WELCOME, {session.user.name?.toUpperCase() ?? "PLAYER"}
          </p>
          <h1
            className="mb-2 text-sm leading-loose tracking-widest text-[#00D4FF]"
            style={{ textShadow: "0 0 6px #00D4FF, 0 0 18px #00D4FF, 0 0 40px #00D4FF" }}
          >
            SELECT YOUR GAME
          </h1>
          <div
            className="mt-3 text-[10px] tracking-widest"
            style={{ color: "#FF0080", textShadow: "0 0 8px #FF0080" }}
          >
            ▓▒░ THIS CHOICE IS PERMANENT ░▒▓
          </div>
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Tetris card */}
          <button
            onClick={() => handleSelect("tetris")}
            disabled={!!selecting}
            className="group relative rounded border border-[#00D4FF] bg-[#08001F] p-8 text-left transition-all hover:bg-[#00D4FF]/5 disabled:opacity-50"
            style={{
              boxShadow:
                selecting === "tetris"
                  ? "0 0 20px #00D4FF, 0 0 40px rgba(0,212,255,0.4)"
                  : "0 0 8px rgba(0,212,255,0.4)",
            }}
          >
            {/* Tetris ASCII art */}
            <div
              className="mb-6 font-retro text-[8px] leading-relaxed text-[#00D4FF]"
              style={{ textShadow: "0 0 6px #00D4FF" }}
            >
              <pre>{`  ████
  ████
████
████`}</pre>
            </div>

            <h2
              className="mb-3 text-base tracking-widest text-[#00D4FF]"
              style={{ textShadow: "0 0 8px #00D4FF, 0 0 20px #00D4FF" }}
            >
              TETRIS
            </h2>
            <p className="text-[8px] leading-relaxed tracking-wider text-[#00D4FF]/60">
              STACK THE BLOCKS.
              <br />
              CLEAR THE LINES.
              <br />
              SURVIVE.
            </p>

            {selecting === "tetris" && (
              <div
                className="animate-cursor-blink mt-4 text-[8px] tracking-widest text-[#00D4FF]"
                style={{ textShadow: "0 0 6px #00D4FF" }}
              >
                LOCKING IN...
              </div>
            )}
          </button>

          {/* Pacman card */}
          <button
            onClick={() => handleSelect("pacman")}
            disabled={!!selecting}
            className="group relative rounded border border-[#FF0080] bg-[#08001F] p-8 text-left transition-all hover:bg-[#FF0080]/5 disabled:opacity-50"
            style={{
              boxShadow:
                selecting === "pacman"
                  ? "0 0 20px #FF0080, 0 0 40px rgba(255,0,128,0.4)"
                  : "0 0 8px rgba(255,0,128,0.4)",
            }}
          >
            {/* Pacman ASCII art */}
            <div
              className="mb-6 font-retro text-[8px] leading-relaxed text-[#FF0080]"
              style={{ textShadow: "0 0 6px #FF0080" }}
            >
              <pre>{` ████
██████ ·  ·
 ████
      · ·`}</pre>
            </div>

            <h2
              className="mb-3 text-base tracking-widest text-[#FF0080]"
              style={{ textShadow: "0 0 8px #FF0080, 0 0 20px #FF0080" }}
            >
              PAC-MAN
            </h2>
            <p className="text-[8px] leading-relaxed tracking-wider text-[#FF0080]/60">
              EAT THE DOTS.
              <br />
              DODGE THE GHOSTS.
              <br />
              DOMINATE.
            </p>

            {selecting === "pacman" && (
              <div
                className="animate-cursor-blink mt-4 text-[8px] tracking-widest text-[#FF0080]"
                style={{ textShadow: "0 0 6px #FF0080" }}
              >
                LOCKING IN...
              </div>
            )}
          </button>
        </div>

        {error && (
          <div
            className="mt-6 rounded border border-[#FF0080] px-4 py-3 text-center text-[9px] tracking-widest text-[#FF0080]"
            style={{ textShadow: "0 0 6px #FF0080", boxShadow: "0 0 6px rgba(255,0,128,0.3)" }}
          >
            ⚠ {error}
          </div>
        )}

        <p className="mt-10 text-center text-[8px] tracking-widest text-[#00D4FF]/30">
          ⚠ CANNOT BE CHANGED AFTER SELECTION
        </p>
      </div>
    </main>
  );
}
