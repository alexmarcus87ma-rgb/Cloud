"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLS = 10;
const ROWS = 20;
const CELL = 28;

const COLORS: Record<string, string> = {
  I: "#00FFFF",
  O: "#FFD700",
  T: "#FF00FF",
  S: "#00FF41",
  Z: "#FF4500",
  J: "#4169E1",
  L: "#FF8C00",
};

// Each entry = list of rotations; each rotation = list of [col, row] offsets
const SHAPES: Record<string, number[][][]> = {
  I: [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]], [[0,2],[1,2],[2,2],[3,2]], [[1,0],[1,1],[1,2],[1,3]]],
  O: [[[1,0],[2,0],[1,1],[2,1]]],
  T: [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]],
  S: [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]]],
  Z: [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]]],
  J: [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]], [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]]],
  L: [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]],
};

const TYPES = Object.keys(SHAPES);
const LINE_SCORES = [0, 100, 300, 500, 800];
const WALL_KICKS = [[0,0],[-1,0],[1,0],[0,-1],[-2,0],[2,0]];

// ─── Types ────────────────────────────────────────────────────────────────────
type Cell = string | null;
type Board = Cell[][];
interface Piece { type: string; rot: number; x: number; y: number; }

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function mkBoard(): Board { return Array.from({length: ROWS}, () => Array(COLS).fill(null)); }
function rnd(): Piece { return { type: TYPES[Math.floor(Math.random() * TYPES.length)], rot: 0, x: 3, y: -1 }; }
function cells(p: Piece): [number,number][] {
  return SHAPES[p.type][p.rot % SHAPES[p.type].length].map(([dc,dr]) => [p.x+dc, p.y+dr]);
}
function valid(board: Board, p: Piece): boolean {
  return cells(p).every(([c,r]) => c>=0 && c<COLS && r<ROWS && (r<0 || board[r][c]===null));
}
function lock(board: Board, p: Piece): Board {
  const b = board.map(r=>[...r]);
  cells(p).forEach(([c,r]) => { if(r>=0) b[r][c]=COLORS[p.type]; });
  return b;
}
function sweep(board: Board): [Board, number] {
  const kept = board.filter(r => r.some(c=>c===null));
  const cleared = ROWS - kept.length;
  return [[...Array.from({length:cleared},()=>Array(COLS).fill(null)), ...kept], cleared];
}
function ghostY(board: Board, p: Piece): number {
  let y = p.y;
  while (valid(board, {...p, y: y+1})) y++;
  return y;
}

// ─── Draw ──���──────────────────────────────────────────────────────────────────
function drawCell(ctx: CanvasRenderingContext2D, c: number, r: number, color: string, alpha=1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, 3);
  ctx.fillRect(c*CELL+1, r*CELL+1, 3, CELL-2);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(c*CELL+1, r*CELL+CELL-4, CELL-2, 3);
  ctx.globalAlpha = 1;
}

function render(canvas: HTMLCanvasElement, board: Board, piece: Piece | null, next: Piece) {
  const ctx = canvas.getContext("2d")!;
  const W = COLS*CELL, H = ROWS*CELL;
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = "rgba(0,255,65,0.06)"; ctx.lineWidth = 0.5;
  for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*CELL);ctx.lineTo(W,r*CELL);ctx.stroke();}
  for(let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,H);ctx.stroke();}

  // Board
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]) drawCell(ctx,c,r,board[r][c]!);

  // Ghost + piece
  if(piece){
    const gy = ghostY(board, piece);
    cells({...piece, y:gy}).forEach(([c,r])=>{ if(r>=0){ ctx.globalAlpha=0.15; ctx.fillStyle=COLORS[piece.type]; ctx.fillRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2); ctx.globalAlpha=1; }});
    cells(piece).forEach(([c,r])=>{ if(r>=0) drawCell(ctx,c,r,COLORS[piece.type]); });
  }

  // Border glow
  ctx.shadowColor = "#00FF41"; ctx.shadowBlur = 8;
  ctx.strokeStyle = "#00FF41"; ctx.lineWidth = 2;
  ctx.strokeRect(1,1,W-2,H-2);
  ctx.shadowBlur = 0;
}

// ─── Component ────��───────────────────────────────────────────────────────────
export default function TetrisPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    board: mkBoard(), piece: null as Piece|null, next: rnd(),
    score: 0, lines: 0, level: 1,
    status: "playing" as "playing"|"gameover",
    lastDrop: 0, scoreSaved: false,
  });

  const [ui, setUi] = useState({ score:0, lines:0, level:1 });
  const [status, setStatus] = useState<"playing"|"gameover">("playing");
  const [finalScore, setFinalScore] = useState(0);

  // Auth guard
  useEffect(()=>{
    if(!isPending && !session) router.push("/login");
  },[session, isPending, router]);

  const doGameOver = useCallback(()=>{
    const s = stateRef.current;
    s.status = "gameover";
    setStatus("gameover");
    setFinalScore(s.score);
    if(!s.scoreSaved && session){
      s.scoreSaved = true;
      fetch("/api/scores",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({score:s.score,game:"tetris"})}).catch(()=>{});
    }
  },[session]);

  const spawn = useCallback(()=>{
    const s = stateRef.current;
    const p = {...s.next, x:3, y:-1};
    s.next = rnd();
    if(!valid(s.board, p)){ doGameOver(); return; }
    s.piece = p;
  },[doGameOver]);

  const drop = useCallback(()=>{
    const s = stateRef.current;
    if(!s.piece || s.status!=="playing") return;
    const moved = {...s.piece, y: s.piece.y+1};
    if(valid(s.board, moved)){
      s.piece = moved;
    } else {
      s.board = lock(s.board, s.piece);
      const [nb, cleared] = sweep(s.board);
      s.board = nb;
      s.score += LINE_SCORES[cleared] * s.level;
      s.lines += cleared;
      s.level = Math.floor(s.lines/10)+1;
      setUi({score:s.score, lines:s.lines, level:s.level});
      s.piece = null;
      spawn();
    }
  },[spawn]);

  // Draw next piece preview
  const drawNext = useCallback(()=>{
    const nc = nextCanvasRef.current; if(!nc) return;
    const ctx = nc.getContext("2d")!;
    ctx.fillStyle = "#000"; ctx.fillRect(0,0,nc.width,nc.height);
    const s = stateRef.current;
    const p = s.next;
    const cs = cells({...p, x:0, y:0});
    const minC = Math.min(...cs.map(([c])=>c));
    const minR = Math.min(...cs.map(([,r])=>r));
    cs.forEach(([c,r])=>{
      const px = (c-minC)*CELL+8, py = (r-minR)*CELL+8;
      ctx.fillStyle = COLORS[p.type];
      ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
      ctx.fillStyle="rgba(255,255,255,0.25)";
      ctx.fillRect(px+1,py+1,CELL-2,3);
    });
  },[]);

  // Keyboard
  useEffect(()=>{
    const s = stateRef.current;
    const onKey = (e: KeyboardEvent)=>{
      if(s.status!=="playing"||!s.piece) return;
      switch(e.key){
        case "ArrowLeft": e.preventDefault();
          { const p={...s.piece,x:s.piece.x-1}; if(valid(s.board,p)) s.piece=p; } break;
        case "ArrowRight": e.preventDefault();
          { const p={...s.piece,x:s.piece.x+1}; if(valid(s.board,p)) s.piece=p; } break;
        case "ArrowUp": e.preventDefault();
          { const newRot=(s.piece.rot+1)%SHAPES[s.piece.type].length;
            for(const [dx,dy] of WALL_KICKS){
              const p={...s.piece,rot:newRot,x:s.piece.x+dx,y:s.piece.y+dy};
              if(valid(s.board,p)){s.piece=p;break;}
            }} break;
        case "ArrowDown": e.preventDefault(); drop(); s.score+=1; break;
        case " ": e.preventDefault();
          { let dy=0;
            while(valid(s.board,{...s.piece,y:s.piece.y+dy+1})) dy++;
            s.score+=dy*2; s.piece={...s.piece,y:s.piece.y+dy};
            drop(); } break;
        case "z": case "Z":
          { const newRot=(s.piece.rot+SHAPES[s.piece.type].length-1)%SHAPES[s.piece.type].length;
            for(const [dx,dy] of WALL_KICKS){
              const p={...s.piece,rot:newRot,x:s.piece.x+dx,y:s.piece.y+dy};
              if(valid(s.board,p)){s.piece=p;break;}
            }} break;
      }
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[drop]);

  // Game loop
  useEffect(()=>{
    const s = stateRef.current;
    s.board=mkBoard(); s.next=rnd(); s.score=0; s.lines=0; s.level=1;
    s.status="playing"; s.scoreSaved=false; s.lastDrop=0;
    setUi({score:0,lines:0,level:1}); setStatus("playing");
    spawn();

    let raf: number;
    function loop(ts: number){
      const s = stateRef.current;
      const speed = Math.max(80, 800-(s.level-1)*70);
      if(s.status==="playing" && ts-s.lastDrop>speed){
        drop();
        s.lastDrop=ts;
      }
      if(canvasRef.current) render(canvasRef.current, s.board, s.piece, s.next);
      drawNext();
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function restart(){
    const s = stateRef.current;
    s.board=mkBoard(); s.next=rnd(); s.score=0; s.lines=0; s.level=1;
    s.status="playing"; s.scoreSaved=false; s.lastDrop=0;
    setUi({score:0,lines:0,level:1}); setStatus("playing");
    spawn();
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4 py-8 select-none">
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{backgroundImage:"linear-gradient(rgba(0,255,65,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

      {/* Header */}
      <div className="relative z-10 mb-4 text-center">
        <h1 className="text-[10px] tracking-widest" style={{color:"#00FFFF",textShadow:"0 0 8px #00FFFF"}}>
          ▶ TETRIS
        </h1>
      </div>

      <div className="relative z-10 flex gap-6 items-start">
        {/* Game canvas */}
        <div className="relative">
          <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} className="block"/>
          {status==="gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <p className="mb-2 text-[10px] tracking-widest" style={{color:"#FF00FF",textShadow:"0 0 8px #FF00FF"}}>GAME OVER</p>
              <p className="mb-6 text-[9px] tracking-widest text-[#00FF41]">SCORE: {finalScore}</p>
              <button onClick={restart} className="rounded border border-[#00FF41] bg-black px-6 py-2 text-[9px] tracking-widest text-[#00FF41] hover:bg-[#00FF41] hover:text-black" style={{boxShadow:"0 0 6px #00FF41"}}>
                ▶ PLAY AGAIN
              </button>
              <button onClick={()=>router.push("/dashboard")} className="mt-3 text-[8px] tracking-widest text-[#00FF41]/40 hover:text-[#00FF41]">
                DASHBOARD
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4 w-28">
          {[
            {label:"SCORE",val:ui.score},
            {label:"LINES",val:ui.lines},
            {label:"LEVEL",val:ui.level},
          ].map(({label,val})=>(
            <div key={label} className="rounded border border-[#00FF41]/30 bg-black px-3 py-2 text-center">
              <p className="mb-1 text-[7px] tracking-widest text-[#00FFFF]">{label}</p>
              <p className="text-[11px] tracking-widest text-[#00FF41]" style={{textShadow:"0 0 6px #00FF41"}}>{val}</p>
            </div>
          ))}

          <div className="rounded border border-[#00FF41]/30 bg-black px-3 py-2">
            <p className="mb-2 text-center text-[7px] tracking-widest text-[#00FFFF]">NEXT</p>
            <canvas ref={nextCanvasRef} width={4*CELL} height={4*CELL} className="block mx-auto"/>
          </div>

          <div className="rounded border border-[#00FF41]/10 bg-black px-3 py-2">
            <p className="mb-1 text-[7px] tracking-widest text-[#00FFFF]/60">CONTROLS</p>
            {[["←→","MOVE"],["↑","ROTATE"],["↓","SOFT DROP"],["SPC","HARD DROP"],["Z","ROT CCW"]].map(([k,v])=>(
              <div key={k} className="flex justify-between text-[6px] tracking-wide">
                <span className="text-[#FF00FF]">{k}</span>
                <span className="text-[#00FF41]/50">{v}</span>
              </div>
            ))}
          </div>

          <button onClick={()=>router.push("/dashboard")} className="rounded border border-[#FF00FF]/30 bg-black py-2 text-[7px] tracking-widest text-[#FF00FF]/50 hover:text-[#FF00FF]">
            ← BACK
          </button>
        </div>
      </div>
    </main>
  );
}
