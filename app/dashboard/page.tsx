"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && !session.user.game) router.push("/select-game");
    if (!isPending && session && session.user.game) router.push(`/${session.user.game}`);
  }, [session, isPending, router]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  if (isPending || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="animate-cursor-blink text-[10px] tracking-widest text-[#00FF41]">LOADING...</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(0,255,65,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.04) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

      <div className="relative z-10 text-center">
        <p className="mb-2 text-[9px] tracking-widest text-[#00FF41]/50">WELCOME BACK</p>
        <h1 className="mb-10 text-sm leading-loose tracking-widest text-[#00FF41]" style={{textShadow:"0 0 6px #00FF41, 0 0 18px #00FF41"}}>
          {session.user.name?.toUpperCase() ?? "PLAYER"}
        </h1>

        {/* Both games */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <a
            href="/tetris"
            className="rounded border px-12 py-5 text-base tracking-[0.3em] transition-all hover:opacity-80"
            style={{borderColor:"#00FFFF",color:"#00FFFF",textShadow:"0 0 8px #00FFFF, 0 0 20px #00FFFF",boxShadow:"0 0 10px #00FFFF, 0 0 24px #00FFFF33"}}
          >
            ▶ TETRIS
          </a>
          <a
            href="/pacman"
            className="rounded border px-12 py-5 text-base tracking-[0.3em] transition-all hover:opacity-80"
            style={{borderColor:"#FF00FF",color:"#FF00FF",textShadow:"0 0 8px #FF00FF, 0 0 20px #FF00FF",boxShadow:"0 0 10px #FF00FF, 0 0 24px #FF00FF33"}}
          >
            ▶ PAC-MAN
          </a>
        </div>

        {/* Secondary actions */}
        <div className="mt-8 flex items-center justify-center gap-8">
          <a href="/leaderboard" className="text-[9px] tracking-widest text-[#00FF41]/50 underline hover:text-[#00FF41]">
            LEADERBOARD
          </a>
          <button onClick={handleSignOut} className="text-[9px] tracking-widest text-[#FF00FF]/40 hover:text-[#FF00FF]">
            SIGN OUT
          </button>
        </div>
      </div>
    </main>
  );
}
