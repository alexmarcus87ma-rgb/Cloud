"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Entry { userName: string; score: number; createdAt: number; }
interface LeaderboardData { tetris: Entry[]; pacman: Entry[]; }

const MEDALS = ["🥇","🥈","🥉"];

export default function LeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/leaderboard")
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start bg-[#08001F] px-4 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{backgroundImage:"linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-sm leading-loose tracking-widest text-[#00D4FF]" style={{textShadow:"0 0 6px #00D4FF,0 0 18px #00D4FF"}}>
            GLOBAL LEADERBOARD
          </h1>
          <p className="mt-2 text-[9px] tracking-widest text-[#FF0080]" style={{textShadow:"0 0 6px #FF0080"}}>
            ▓▒░ TOP SCORES ░▒▓
          </p>
        </div>

        {loading && (
          <p className="animate-cursor-blink text-center text-[10px] tracking-widest text-[#00D4FF]">LOADING...</p>
        )}

        {data && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {([
              {key:"tetris" as const, label:"TETRIS", color:"#00D4FF"},
              {key:"pacman" as const, label:"PAC-MAN", color:"#FF0080"},
            ] as const).map(({key,label,color})=>(
              <div key={key} className="rounded border bg-[#08001F]" style={{borderColor:color,boxShadow:`0 0 8px ${color}, 0 0 20px ${color}22`}}>
                <div className="border-b px-6 py-4 text-center text-[11px] tracking-widest" style={{borderColor:color,color,textShadow:`0 0 8px ${color}`}}>
                  {label}
                </div>
                <div className="p-4">
                  {data[key].length===0 && (
                    <p className="py-4 text-center text-[8px] tracking-widest text-[#00D4FF]/30">NO SCORES YET</p>
                  )}
                  {data[key].map((entry,i)=>(
                    <div key={i} className="flex items-center justify-between py-2 border-b border-dashed" style={{borderColor:`${color}22`}}>
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center text-[9px]" style={{color: i<3?color:"#00D4FF", textShadow:i<3?`0 0 6px ${color}`:"none"}}>
                          {i<3 ? MEDALS[i] : `#${i+1}`}
                        </span>
                        <span className="text-[9px] tracking-widest" style={{color: i<3?color:"#00D4FF", textShadow:i<3?`0 0 4px ${color}`:"none"}}>
                          {(entry.userName||"???").toUpperCase().slice(0,12)}
                        </span>
                      </div>
                      <span className="text-[10px] tracking-widest" style={{color: i<3?color:"#00D4FF", textShadow:i<3?`0 0 6px ${color}`:"none"}}>
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <button onClick={()=>router.push("/dashboard")} className="rounded border border-[#00D4FF]/30 bg-[#08001F] px-8 py-3 text-[9px] tracking-widest text-[#00D4FF]/60 hover:border-[#00D4FF] hover:text-[#00D4FF]">
            ← BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </main>
  );
}
