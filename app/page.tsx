import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: "linear-gradient(160deg, #08001F 0%, #0D0028 50%, #08001F 100%)" }}
    >
      {/* Circuit grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        backgroundImage:
          "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Horizontal accent lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/3 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #FF0080 30%, #9B00FF 70%, transparent)", opacity: 0.4 }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-1/3 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #00D4FF 30%, #9B00FF 70%, transparent)", opacity: 0.3 }} />

      <div className="relative z-10 flex flex-col items-center text-center">

        <div className="mb-4 text-[9px] tracking-[0.5em]"
          style={{ color: "#9B00FF", textShadow: "0 0 8px #9B00FF, 0 0 20px #9B00FF" }}>
          ▓▒░ NEURAL NET ░▒▓
        </div>

        <h1 className="mb-2 text-2xl leading-snug tracking-widest sm:text-3xl"
          style={{ color: "#00D4FF", textShadow: "0 0 8px #00D4FF, 0 0 28px #00D4FF, 0 0 60px #9B00FF" }}>
          CYBER
          <br />
          ARCADE
        </h1>

        <div className="mb-2 text-[9px] tracking-[0.3em]"
          style={{ color: "#FF0080", textShadow: "0 0 6px #FF0080" }}>
          // 2 0 7 7
        </div>

        <div className="mb-10 mt-2 text-[8px] tracking-[0.4em]"
          style={{ color: "#FFE600", textShadow: "0 0 6px #FFE600" }}>
          INSERT CREDIT TO JACK IN
        </div>

        <pre className="mb-10 text-[7px] leading-relaxed" aria-hidden="true"
          style={{ color: "rgba(0,212,255,0.35)" }}>{`  ██████╗██╗   ██╗██████╗ ███████╗██████╗
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
 ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
 ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
 ╚██████╗   ██║   ██████╔╝███████╗██║  ██║
  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝`}</pre>

        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="rounded border px-8 py-4 text-center"
            style={{ borderColor: "rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.04)", boxShadow: "0 0 12px rgba(0,212,255,0.25), inset 0 0 12px rgba(0,212,255,0.04)" }}>
            <div className="mb-2 text-base tracking-widest" style={{ color: "#00D4FF", textShadow: "0 0 8px #00D4FF" }}>
              TETRIS
            </div>
            <pre className="text-[8px] leading-snug" style={{ color: "rgba(0,212,255,0.5)" }}>{`  ████
  ████
████
████`}</pre>
          </div>
          <div className="rounded border px-8 py-4 text-center"
            style={{ borderColor: "rgba(255,0,128,0.5)", background: "rgba(255,0,128,0.04)", boxShadow: "0 0 12px rgba(255,0,128,0.25), inset 0 0 12px rgba(255,0,128,0.04)" }}>
            <div className="mb-2 text-base tracking-widest" style={{ color: "#FF0080", textShadow: "0 0 8px #FF0080" }}>
              PAC-MAN
            </div>
            <pre className="text-[8px] leading-snug" style={{ color: "rgba(255,0,128,0.5)" }}>{` ████
██████ · ·
 ████`}</pre>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/setup"
            className="rounded border px-10 py-4 text-[10px] tracking-[0.3em] transition-all hover:bg-[#00D4FF] hover:text-[#08001F]"
            style={{ borderColor: "#00D4FF", color: "#00D4FF", boxShadow: "0 0 10px #00D4FF, 0 0 24px rgba(0,212,255,0.3)" }}
          >
            ▶ JACK IN
          </Link>
          <Link
            href="/login"
            className="rounded border px-10 py-4 text-[10px] tracking-[0.3em] transition-all hover:border-[#9B00FF] hover:text-[#9B00FF]"
            style={{ borderColor: "rgba(155,0,255,0.6)", color: "rgba(155,0,255,0.85)", boxShadow: "0 0 8px rgba(155,0,255,0.25)" }}
          >
            ▶ RECONNECT
          </Link>
        </div>

        <div className="mt-10">
          <Link
            href="/leaderboard"
            className="text-[8px] tracking-widest underline hover:text-[#FFE600]"
            style={{ color: "rgba(255,230,0,0.5)", textShadow: "0 0 4px #FFE600" }}
          >
            ◈ GLOBAL NETRUNNER RANKINGS
          </Link>
        </div>

        <div className="mt-16 text-[7px] tracking-widest" style={{ color: "rgba(0,212,255,0.2)" }}>
          © 2077 CYBER ARCADE CORP · MEGACITY ONE · ALL RIGHTS RESERVED
        </div>
      </div>
    </main>
  );
}
