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
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="animate-cursor-blink text-[10px] tracking-widest text-[#00FF41]">
          LOADING...
        </p>
      </main>
    );
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

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="mb-4 text-[9px] tracking-widest text-[#00FF41]/50"
          >
            WELCOME, {session.user.name?.toUpperCase() ?? "PLAYER"}
          </p>
          <h1
            className="mb-2 text-sm leading-loose tracking-widest text-[#00FF41]"
            style={{ textShadow: "0 0 6px #00FF41, 0 0 18px #00FF41, 0 0 40px #00FF41" }}
          >
            SELECT YOUR GAME
          </h1>
          <div
            className="mt-3 text-[10px] tracking-widest"
            style={{ color: "#FF00FF", textShadow: "0 0 8px #FF00FF" }}
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
            className="group relative rounded border border-[#00FFFF] bg-black p-8 text-left transition-all hover:bg-[#00FFFF]/5 disabled:opacity-50"
            style={{
              boxShadow:
                selecting === "tetris"
                  ? "0 0 20px #00FFFF, 0 0 40px rgba(0,255,255,0.4)"
                  : "0 0 8px rgba(0,255,255,0.4)",
            }}
          >
            {/* Tetris ASCII art */}
            <div
              className="mb-6 font-retro text-[8px] leading-relaxed text-[#00FFFF]"
              style={{ textShadow: "0 0 6px #00FFFF" }}
            >
              <pre>{`  ████
  ████
████
████`}</pre>
            </div>

            <h2
              className="mb-3 text-base tracking-widest text-[#00FFFF]"
              style={{ textShadow: "0 0 8px #00FFFF, 0 0 20px #00FFFF" }}
            >
              TETRIS
            </h2>
            <p className="text-[8px] leading-relaxed tracking-wider text-[#00FFFF]/60">
              STACK THE BLOCKS.
              <br />
              CLEAR THE LINES.
              <br />
              SURVIVE.
            </p>

            {selecting === "tetris" && (
              <div
                className="animate-cursor-blink mt-4 text-[8px] tracking-widest text-[#00FFFF]"
                style={{ textShadow: "0 0 6px #00FFFF" }}
              >
                LOCKING IN...
              </div>
            )}
          </button>

          {/* Pacman card */}
          <button
            onClick={() => handleSelect("pacman")}
            disabled={!!selecting}
            className="group relative rounded border border-[#FF00FF] bg-black p-8 text-left transition-all hover:bg-[#FF00FF]/5 disabled:opacity-50"
            style={{
              boxShadow:
                selecting === "pacman"
                  ? "0 0 20px #FF00FF, 0 0 40px rgba(255,0,255,0.4)"
                  : "0 0 8px rgba(255,0,255,0.4)",
            }}
          >
            {/* Pacman ASCII art */}
            <div
              className="mb-6 font-retro text-[8px] leading-relaxed text-[#FF00FF]"
              style={{ textShadow: "0 0 6px #FF00FF" }}
            >
              <pre>{` ████
██████ ·  ·
 ████
      · ·`}</pre>
            </div>

            <h2
              className="mb-3 text-base tracking-widest text-[#FF00FF]"
              style={{ textShadow: "0 0 8px #FF00FF, 0 0 20px #FF00FF" }}
            >
              PAC-MAN
            </h2>
            <p className="text-[8px] leading-relaxed tracking-wider text-[#FF00FF]/60">
              EAT THE DOTS.
              <br />
              DODGE THE GHOSTS.
              <br />
              DOMINATE.
            </p>

            {selecting === "pacman" && (
              <div
                className="animate-cursor-blink mt-4 text-[8px] tracking-widest text-[#FF00FF]"
                style={{ textShadow: "0 0 6px #FF00FF" }}
              >
                LOCKING IN...
              </div>
            )}
          </button>
        </div>

        {error && (
          <div
            className="mt-6 rounded border border-[#FF00FF] px-4 py-3 text-center text-[9px] tracking-widest text-[#FF00FF]"
            style={{ textShadow: "0 0 6px #FF00FF", boxShadow: "0 0 6px rgba(255,0,255,0.3)" }}
          >
            ⚠ {error}
          </div>
        )}

        <p className="mt-10 text-center text-[8px] tracking-widest text-[#00FF41]/30">
          ⚠ CANNOT BE CHANGED AFTER SELECTION
        </p>
      </div>
    </main>
  );
}
