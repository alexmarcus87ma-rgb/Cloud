import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 py-12">
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Title */}
        <div
          className="mb-4 text-[10px] tracking-[0.5em] text-[#FF00FF]"
          style={{ textShadow: "0 0 8px #FF00FF, 0 0 20px #FF00FF" }}
        >
          ▓▒░ WELCOME TO ░▒▓
        </div>

        <h1
          className="mb-2 text-2xl leading-snug tracking-widest text-[#00FF41] sm:text-3xl"
          style={{
            textShadow:
              "0 0 8px #00FF41, 0 0 24px #00FF41, 0 0 60px #00FF41",
          }}
        >
          RETRO
          <br />
          ARCADE
        </h1>

        <div
          className="mb-12 mt-4 text-[9px] tracking-[0.4em] text-[#00FFFF]"
          style={{ textShadow: "0 0 6px #00FFFF" }}
        >
          INSERT COIN TO CONTINUE
        </div>

        {/* ASCII art decoration */}
        <pre
          className="mb-12 text-[8px] leading-relaxed text-[#00FF41]/40"
          aria-hidden="true"
        >{`  ██████╗ ███████╗████████╗██████╗  ██████╗
  ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗
  ██████╔╝█████╗     ██║   ██████╔╝██║   ██║
  ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║
  ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝
  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ `}</pre>

        {/* Game previews */}
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div
            className="rounded border border-[#00FFFF]/40 bg-black px-8 py-4 text-center"
            style={{ boxShadow: "0 0 8px rgba(0,255,255,0.2)" }}
          >
            <div
              className="mb-2 text-base tracking-widest text-[#00FFFF]"
              style={{ textShadow: "0 0 8px #00FFFF" }}
            >
              TETRIS
            </div>
            <pre className="text-[8px] leading-snug text-[#00FFFF]/50">{`  ████
  ████
████
████`}</pre>
          </div>
          <div
            className="rounded border border-[#FF00FF]/40 bg-black px-8 py-4 text-center"
            style={{ boxShadow: "0 0 8px rgba(255,0,255,0.2)" }}
          >
            <div
              className="mb-2 text-base tracking-widest text-[#FF00FF]"
              style={{ textShadow: "0 0 8px #FF00FF" }}
            >
              PAC-MAN
            </div>
            <pre className="text-[8px] leading-snug text-[#FF00FF]/50">{` ████
██████ · ·
 ████`}</pre>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/setup"
            className="rounded border border-[#00FF41] bg-black px-10 py-4 text-[11px] tracking-[0.3em] text-[#00FF41] transition-all hover:bg-[#00FF41] hover:text-black"
            style={{
              boxShadow: "0 0 8px #00FF41, 0 0 20px rgba(0,255,65,0.3)",
            }}
          >
            ▶ NEW PLAYER
          </Link>
          <Link
            href="/login"
            className="rounded border border-[#00FFFF]/60 bg-black px-10 py-4 text-[11px] tracking-[0.3em] text-[#00FFFF]/80 transition-all hover:border-[#00FFFF] hover:text-[#00FFFF]"
            style={{ boxShadow: "0 0 6px rgba(0,255,255,0.2)" }}
          >
            ▶ PLAYER LOGIN
          </Link>
        </div>

        {/* Leaderboard link */}
        <div className="mt-10">
          <Link
            href="/leaderboard"
            className="text-[8px] tracking-widest text-[#FF00FF]/40 underline hover:text-[#FF00FF]"
            style={{ textShadow: "0 0 4px #FF00FF" }}
          >
            VIEW GLOBAL LEADERBOARD
          </Link>
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 text-[7px] tracking-widest text-[#00FF41]/20">
          © 1989 RETRO ARCADE SYSTEMS · ALL RIGHTS RESERVED
        </div>
      </div>
    </main>
  );
}
