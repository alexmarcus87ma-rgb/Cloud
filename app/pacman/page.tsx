"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// ─── Maze ─────────────────────────────────────────────────────────────────────
// 0=empty(ghost house/tunnel) 1=wall 2=dot 3=power pellet 4=door
const MAZE_DATA: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,3,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,3,1],
  [1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,1],
  [1,2,2,2,2,1,1,2,1,1,2,1,1,2,1,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,2,1,1,4,1,1,2,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1],
  [1,1,1,1,2,1,2,1,0,0,0,0,0,1,2,1,2,1,1,1,1],
  [0,0,0,0,2,1,2,1,0,0,0,0,0,1,2,1,2,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1],
  [1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1],
  [1,1,1,1,2,1,2,1,1,2,1,2,1,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,1,2,1,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,2,1,2,1,2,1,2,1,1,2,1,1,2,1],
  [1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,1],
  [1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1],
  [1,2,2,2,2,1,1,2,2,2,2,2,2,2,1,1,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const ROWS = MAZE_DATA.length;   // 21
const COLS = MAZE_DATA[0].length; // 21
const CELL = 24;
const TUNNEL_ROW = 9;
const TOTAL_DOTS = MAZE_DATA.flat().filter(v => v === 2 || v === 3).length;

// ─── Types ────────────────────────────────────────────────────────────────────
type Dir = { x: number; y: number };
const DIRS: Record<string, Dir> = {
  left: {x:-1,y:0}, right: {x:1,y:0}, up: {x:0,y:-1}, down: {x:0,y:1},
};
const OPPOSITE: Record<string, string> = { left:"right", right:"left", up:"down", down:"up" };

interface Entity { x: number; y: number; }
interface Ghost extends Entity {
  name: "blinky"|"pinky"|"inky"|"clyde";
  color: string;
  dir: string;
  state: "chase"|"scatter"|"frightened"|"dead"|"house";
  releaseTimer: number; // ticks before leaving ghost house
  frightenedTimer: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function passable(row: number, col: number, forGhost=false): boolean {
  if(row<0||row>=ROWS) return false;
  if(col<0||col>=COLS) return col<0||col>=COLS; // tunnel warp handled separately
  const v = MAZE_DATA[row][col];
  if(v===1) return false;
  if(v===4) return forGhost; // door: only ghosts pass
  return true;
}

function wrapCol(col: number): number {
  if(col<0) return COLS-1;
  if(col>=COLS) return 0;
  return col;
}

function canMove(row: number, col: number, dir: Dir, forGhost=false): boolean {
  const nr = row+dir.y;
  const nc = col+dir.x;
  if(row===TUNNEL_ROW && (nc<0||nc>=COLS)) return true; // tunnel
  return passable(nr, nc, forGhost);
}

function dist(ax:number,ay:number,bx:number,by:number): number {
  return Math.abs(ax-bx)+Math.abs(ay-by);
}

function chaseDir(ghost: Ghost, target: {x:number,y:number}): string {
  const opts = Object.entries(DIRS).filter(([d])=>d!==OPPOSITE[ghost.dir]);
  let best=""; let bestD=Infinity;
  for(const [d,dir] of opts){
    if(!canMove(ghost.y,ghost.x,dir,true)) continue;
    const d2 = dist(ghost.x+dir.x, ghost.y+dir.y, target.x, target.y);
    if(d2<bestD){bestD=d2;best=d;}
  }
  return best||ghost.dir;
}

function randomDir(ghost: Ghost): string {
  const opts = Object.entries(DIRS).filter(([d])=>d!==OPPOSITE[ghost.dir] && canMove(ghost.y,ghost.x,DIRS[d],true));
  if(!opts.length) return OPPOSITE[ghost.dir];
  return opts[Math.floor(Math.random()*opts.length)][0];
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function drawMaze(ctx: CanvasRenderingContext2D, maze: number[][]) {
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const v = maze[r][c];
    const x=c*CELL, y=r*CELL;
    if(v===1){
      ctx.fillStyle="#000080";
      ctx.fillRect(x,y,CELL,CELL);
      ctx.strokeStyle="#0000FF";
      ctx.lineWidth=1;
      ctx.strokeRect(x+0.5,y+0.5,CELL-1,CELL-1);
    } else if(v===4){
      ctx.fillStyle="#000";
      ctx.fillRect(x,y,CELL,CELL);
      ctx.strokeStyle="#FF00FF";
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x,y+CELL/2); ctx.lineTo(x+CELL,y+CELL/2); ctx.stroke();
    } else {
      ctx.fillStyle="#000"; ctx.fillRect(x,y,CELL,CELL);
    }
  }
}

function drawDots(ctx: CanvasRenderingContext2D, maze: number[][], t: number) {
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const v=maze[r][c];
    const cx=c*CELL+CELL/2, cy=r*CELL+CELL/2;
    if(v===2){
      ctx.fillStyle="#FFD700";
      ctx.beginPath(); ctx.arc(cx,cy,2.5,0,Math.PI*2); ctx.fill();
    } else if(v===3){
      const pulse=0.7+0.3*Math.sin(t/200);
      ctx.globalAlpha=pulse;
      ctx.fillStyle="#FFD700";
      ctx.shadowColor="#FFD700"; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1; ctx.shadowBlur=0;
    }
  }
}

function drawPacman(ctx: CanvasRenderingContext2D, p: Entity & {dir:string,mouthAngle:number}) {
  const cx = p.x*CELL+CELL/2, cy = p.y*CELL+CELL/2;
  const angle = {right:0,down:0.5,left:1,up:1.5}[p.dir]||0;
  const mouth = p.mouthAngle;
  ctx.fillStyle="#FFD700";
  ctx.shadowColor="#FFD700"; ctx.shadowBlur=6;
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.arc(cx,cy,CELL/2-2, (angle+mouth/2)*Math.PI, (angle+2-mouth/2)*Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur=0;
}

function drawGhost(ctx: CanvasRenderingContext2D, g: Ghost, t: number) {
  const cx=g.x*CELL+CELL/2, cy=g.y*CELL+CELL/2;
  const r=CELL/2-2;
  let color = g.color;
  if(g.state==="frightened"){
    color = t%600<300?"#0000CC":"#FFFFFF";
  } else if(g.state==="dead"){
    // draw eyes only
    ctx.fillStyle="#00FFFF";
    ctx.beginPath(); ctx.arc(cx-3,cy-2,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+3,cy-2,3,0,Math.PI*2); ctx.fill();
    return;
  }
  ctx.fillStyle=color;
  ctx.shadowColor=color; ctx.shadowBlur=8;
  // body
  ctx.beginPath();
  ctx.arc(cx,cy-1,r,Math.PI,0);
  // wavy bottom
  const steps=4; const sw=r*2/steps;
  for(let i=0;i<steps;i++){
    const bx=cx-r+i*sw;
    ctx.quadraticCurveTo(bx+sw/4,cy+r+(i%2===0?3:-3),bx+sw/2,cy+r);
    ctx.quadraticCurveTo(bx+3*sw/4,cy+r-(i%2===0?3:-3),bx+sw,cy+r-1);
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur=0;
  // eyes
  if(g.state!=="frightened"){
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.arc(cx-3,cy-2,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+3,cy-2,3.5,0,Math.PI*2); ctx.fill();
    const dx={right:1,left:-1,up:0,down:0}[g.dir]||0;
    const dy={up:-1,down:1,left:0,right:0}[g.dir]||0;
    ctx.fillStyle="#00F";
    ctx.beginPath(); ctx.arc(cx-3+dx,cy-2+dy,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+3+dx,cy-2+dy,2,0,Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.arc(cx-3,cy,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+3,cy,2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#fff"; ctx.lineWidth=1.5;
    ctx.beginPath();
    for(let i=0;i<5;i++) ctx.lineTo(cx-4+i*2,cy+3+(i%2===0?1:-1));
    ctx.stroke();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PacmanPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  type Status = "countdown"|"playing"|"dying"|"levelup"|"gameover";

  const stateRef = useRef<{
    maze: number[][];
    pac: Entity & { dir: string; nextDir: string; mouthAngle: number; mouthDir: number; };
    ghosts: Ghost[];
    score: number; lives: number; dotsLeft: number; level: number;
    ghostCombo: number; frightenedTotal: number;
    status: Status; statusTimer: number;
    lastTick: number; tickInterval: number;
    scoreSaved: boolean; countdown: number;
  }>({
    maze: MAZE_DATA.map(r=>[...r]),
    pac: {x:10,y:17,dir:"left",nextDir:"left",mouthAngle:0,mouthDir:1},
    ghosts: [
      {name:"blinky",color:"#FF0000",x:10,y:5,dir:"left",state:"chase",releaseTimer:0,frightenedTimer:0},
      {name:"pinky", color:"#FFB8FF",x:9, y:8,dir:"up",  state:"house",releaseTimer:120,frightenedTimer:0},
      {name:"inky",  color:"#00FFFF",x:10,y:8,dir:"up",  state:"house",releaseTimer:240,frightenedTimer:0},
      {name:"clyde", color:"#FFB852",x:11,y:8,dir:"up",  state:"house",releaseTimer:360,frightenedTimer:0},
    ],
    score:0, lives:3, dotsLeft:TOTAL_DOTS, level:1,
    ghostCombo:0, frightenedTotal:0,
    status:"countdown", statusTimer:180, lastTick:0, tickInterval:150,
    scoreSaved:false, countdown:3,
  });

  const [ui, setUi] = useState({score:0, lives:3, level:1});
  const [status, setStatus] = useState<Status>("countdown");
  const [finalScore, setFinalScore] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(()=>{
    if(!isPending&&!session) router.push("/login");
  },[session,isPending,router]);

  const doGameOver = useCallback(()=>{
    const s=stateRef.current;
    s.status="gameover";
    setStatus("gameover");
    setFinalScore(s.score);
    if(!s.scoreSaved&&session){
      s.scoreSaved=true;
      fetch("/api/scores",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({score:s.score,game:"pacman"})}).catch(()=>{});
    }
  },[session]);

  function initState(s: typeof stateRef.current, level=1){
    s.maze=MAZE_DATA.map(r=>[...r]);
    s.pac={x:10,y:17,dir:"left",nextDir:"left",mouthAngle:0,mouthDir:1};
    const speed=Math.max(80,150-level*8);
    s.ghosts=[
      {name:"blinky",color:"#FF0000",x:10,y:5,dir:"left",state:"chase",releaseTimer:0,frightenedTimer:0},
      {name:"pinky", color:"#FFB8FF",x:9, y:8,dir:"up",  state:"house",releaseTimer:Math.max(0,120-level*10),frightenedTimer:0},
      {name:"inky",  color:"#00FFFF",x:10,y:8,dir:"up",  state:"house",releaseTimer:Math.max(0,240-level*20),frightenedTimer:0},
      {name:"clyde", color:"#FFB852",x:11,y:8,dir:"up",  state:"house",releaseTimer:Math.max(0,360-level*30),frightenedTimer:0},
    ];
    s.dotsLeft=TOTAL_DOTS; s.level=level; s.ghostCombo=0; s.frightenedTotal=0;
    s.status="countdown"; s.statusTimer=180; s.tickInterval=speed; s.countdown=3;
  }

  const tick = useCallback(()=>{
    const s=stateRef.current;
    if(s.status!=="playing") return;

    // ── Pac-Man mouth ──
    s.pac.mouthAngle += s.pac.mouthDir*0.08;
    if(s.pac.mouthAngle>0.3||s.pac.mouthAngle<0.02) s.pac.mouthDir*=-1;

    // ── Pac-Man movement ──
    const tryDir=(d:string)=>{
      const dir=DIRS[d];
      if(!dir) return false;
      const nr=s.pac.y+dir.y, nc=s.pac.x+dir.x;
      if(s.pac.y===TUNNEL_ROW&&(nc<0||nc>=COLS)){ s.pac.x=wrapCol(nc); return true; }
      if(passable(nr,nc,false)){ s.pac.x=nc; s.pac.y=nr; return true; }
      return false;
    };
    const moved = tryDir(s.pac.nextDir)
      ? (s.pac.dir=s.pac.nextDir, true)
      : tryDir(s.pac.dir)
        ? true
        : false;
    if(moved){} // suppress lint

    // ── Eat dot/pellet ──
    const cell=s.maze[s.pac.y][s.pac.x];
    if(cell===2){
      s.maze[s.pac.y][s.pac.x]=0;
      s.score+=10; s.dotsLeft--;
      setUi(u=>({...u,score:s.score}));
    } else if(cell===3){
      s.maze[s.pac.y][s.pac.x]=0;
      s.score+=50; s.dotsLeft--;
      setUi(u=>({...u,score:s.score}));
      // frighten ghosts
      s.ghostCombo=0;
      s.frightenedTotal=(s.frightenedTotal+1);
      s.ghosts.forEach(g=>{ if(g.state!=="house"&&g.state!=="dead"){ g.state="frightened"; g.frightenedTimer=300; }});
    }

    // ── Level complete ──
    if(s.dotsLeft<=0){ s.status="levelup"; s.statusTimer=120; return; }

    // ── Ghost logic ──
    s.ghosts.forEach(g=>{
      if(g.state==="house"){
        g.releaseTimer--;
        if(g.releaseTimer<=0){
          // move toward door (col 10, row 6)
          if(g.y>6){ g.y--; } else { g.x=10; g.state="chase"; g.dir="left"; }
        } else {
          // bounce inside house
          if(g.y<=7&&g.dir==="up") g.dir="down";
          if(g.y>=9&&g.dir==="down") g.dir="up";
          g.y+=DIRS[g.dir].y;
        }
        return;
      }

      if(g.state==="frightened"){
        g.frightenedTimer--;
        if(g.frightenedTimer<=0) g.state="chase";
      }

      if(g.state==="dead"){
        // return to ghost house
        const target={x:10,y:8};
        const d=chaseDir(g,target);
        const dir=DIRS[d];
        if(g.y===TUNNEL_ROW&&(g.x+dir.x<0||g.x+dir.x>=COLS)) g.x=wrapCol(g.x+dir.x);
        else { g.x+=dir.x; g.y+=dir.y; }
        g.dir=d;
        if(g.x===10&&g.y===8){ g.state="chase"; }
        return;
      }

      // Choose direction
      let target:{x:number,y:number};
      if(g.state==="frightened"){
        g.dir=randomDir(g);
      } else {
        // scatter corners every 7s
        const scatter=Math.floor(Date.now()/7000)%2===0;
        const corners:{blinky:{x:number,y:number},pinky:{x:number,y:number},inky:{x:number,y:number},clyde:{x:number,y:number}}={
          blinky:{x:COLS-2,y:1}, pinky:{x:1,y:1}, inky:{x:COLS-2,y:ROWS-2}, clyde:{x:1,y:ROWS-2},
        };
        if(scatter){
          target=corners[g.name];
        } else {
          const pac=s.pac;
          if(g.name==="blinky") target={x:pac.x,y:pac.y};
          else if(g.name==="pinky"){ const d=DIRS[pac.dir]||DIRS.left; target={x:pac.x+d.x*4,y:pac.y+d.y*4}; }
          else if(g.name==="inky"){ const d=dist(g.x,g.y,pac.x,pac.y)>8?{x:pac.x,y:pac.y}:corners.inky; target=d; }
          else { target=dist(g.x,g.y,pac.x,pac.y)<8?corners.clyde:{x:pac.x,y:pac.y}; }
        }
        g.dir=chaseDir(g,target);
      }

      const dir=DIRS[g.dir];
      if(g.y===TUNNEL_ROW&&(g.x+dir.x<0||g.x+dir.x>=COLS)) g.x=wrapCol(g.x+dir.x);
      else { g.x+=dir.x; g.y+=dir.y; }
    });

    // ── Collision pac vs ghosts ──
    for(const g of s.ghosts){
      if(g.x===s.pac.x&&g.y===s.pac.y){
        if(g.state==="frightened"){
          g.state="dead";
          s.ghostCombo++;
          const pts=200*Math.pow(2,s.ghostCombo-1);
          s.score+=pts;
          setUi(u=>({...u,score:s.score}));
        } else if(g.state==="chase"){
          s.lives--;
          setUi(u=>({...u,lives:s.lives}));
          if(s.lives<=0){ doGameOver(); return; }
          s.status="dying"; s.statusTimer=90;
          return;
        }
      }
    }
  },[doGameOver]);

  function resetPositions(s: typeof stateRef.current){
    s.pac={x:10,y:17,dir:"left",nextDir:"left",mouthAngle:0,mouthDir:1};
    s.ghosts.forEach(g=>{
      if(g.name==="blinky"){g.x=10;g.y=5;g.dir="left";g.state="chase";}
      else if(g.name==="pinky"){g.x=9;g.y=8;g.dir="up";g.state="house";g.releaseTimer=80;}
      else if(g.name==="inky"){g.x=10;g.y=8;g.dir="up";g.state="house";g.releaseTimer=160;}
      else {g.x=11;g.y=8;g.dir="up";g.state="house";g.releaseTimer=240;}
    });
    s.status="countdown"; s.statusTimer=180; s.countdown=3;
  }

  // Keyboard
  useEffect(()=>{
    const keyMap:{[k:string]:string}={"ArrowLeft":"left","ArrowRight":"right","ArrowUp":"up","ArrowDown":"down","a":"left","d":"right","w":"up","s":"down","A":"left","D":"right","W":"up","S":"down"};
    const onKey=(e:KeyboardEvent)=>{
      const d=keyMap[e.key];
      if(d){ e.preventDefault(); stateRef.current.pac.nextDir=d; }
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[]);

  // Game loop
  useEffect(()=>{
    const s=stateRef.current;
    initState(s,1);
    setUi({score:0,lives:3,level:1}); setStatus("countdown"); setCountdown(3);

    let raf:number;
    let lastTickTime=0;
    let frameT=0;

    function loop(ts:number){
      const s=stateRef.current;
      frameT=ts;

      // Status machine
      if(s.status==="countdown"){
        s.statusTimer--;
        const cd=Math.ceil(s.statusTimer/60);
        if(cd!==s.countdown){ s.countdown=cd; setCountdown(cd); }
        if(s.statusTimer<=0){ s.status="playing"; setStatus("playing"); }
      } else if(s.status==="dying"){
        s.statusTimer--;
        if(s.statusTimer<=0){ resetPositions(s); setStatus("countdown"); }
      } else if(s.status==="levelup"){
        s.statusTimer--;
        if(s.statusTimer<=0){ const nl=s.level+1; initState(s,nl); setUi(u=>({...u,level:nl})); setStatus("countdown"); setCountdown(3); }
      } else if(s.status==="gameover"){
        // just render
      } else {
        // playing - tick at tickInterval
        if(ts-lastTickTime>s.tickInterval){ tick(); lastTickTime=ts; }
      }

      // Render
      const canvas=canvasRef.current; if(!canvas) { raf=requestAnimationFrame(loop); return; }
      const ctx=canvas.getContext("2d")!;
      ctx.fillStyle="#000"; ctx.fillRect(0,0,canvas.width,canvas.height);
      drawMaze(ctx,s.maze);
      drawDots(ctx,s.maze,frameT);
      s.ghosts.forEach(g=>drawGhost(ctx,g,frameT));
      drawPacman(ctx,s.pac);

      // Overlay for countdown/dying
      if(s.status==="countdown"||s.status==="dying"){
        ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#FFD700"; ctx.font="bold 32px monospace"; ctx.textAlign="center";
        ctx.fillText(s.status==="dying"?"💀":s.countdown>0?`${s.countdown}`:"GO!", canvas.width/2, canvas.height/2);
      }
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function restart(){
    const s=stateRef.current;
    initState(s,1);
    setUi({score:0,lives:3,level:1}); setStatus("countdown"); setCountdown(3);
    s.scoreSaved=false;
  }

  const livesArr=Array.from({length:Math.max(0,ui.lives)},(_,i)=>i);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4 py-8 select-none">
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{backgroundImage:"linear-gradient(rgba(255,0,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,0,255,0.02) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

      <div className="relative z-10 mb-3 flex w-full max-w-[540px] items-center justify-between">
        <h1 className="text-[10px] tracking-widest" style={{color:"#FF00FF",textShadow:"0 0 8px #FF00FF"}}>▶ PAC-MAN</h1>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[7px] tracking-widest text-[#00FFFF]/60">SCORE</p>
            <p className="text-[11px] tracking-widest text-[#00FF41]" style={{textShadow:"0 0 6px #00FF41"}}>{ui.score}</p>
          </div>
          <div className="text-center">
            <p className="text-[7px] tracking-widest text-[#00FFFF]/60">LVL</p>
            <p className="text-[11px] tracking-widest text-[#FFD700]">{ui.level}</p>
          </div>
          <div className="flex items-center gap-1">
            {livesArr.map(i=>(
              <div key={i} className="h-4 w-4 rounded-full" style={{background:"#FFD700",boxShadow:"0 0 4px #FFD700"}}/>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL}
          className="block rounded border border-[#FF00FF]"
          style={{boxShadow:"0 0 12px #FF00FF, 0 0 30px rgba(255,0,255,0.2)"}}
        />
        {status==="gameover"&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded">
            <p className="mb-2 text-[10px] tracking-widest" style={{color:"#FF00FF",textShadow:"0 0 8px #FF00FF"}}>GAME OVER</p>
            <p className="mb-6 text-[9px] tracking-widest text-[#00FF41]">SCORE: {finalScore}</p>
            <button onClick={restart} className="rounded border border-[#FF00FF] bg-black px-6 py-2 text-[9px] tracking-widest text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black" style={{boxShadow:"0 0 6px #FF00FF"}}>
              ▶ PLAY AGAIN
            </button>
            <button onClick={()=>router.push("/dashboard")} className="mt-3 text-[8px] tracking-widest text-[#00FF41]/40 hover:text-[#00FF41]">
              DASHBOARD
            </button>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-6 text-[7px] tracking-widest text-[#FF00FF]/40">
        {[["WASD / ↑↓←→","MOVE"],["POWER PELLET","FRIGHTEN GHOSTS"]].map(([k,v])=>(
          <span key={k}><span className="text-[#FF00FF]/60">{k}</span> {v}</span>
        ))}
        <button onClick={()=>router.push("/dashboard")} className="ml-4 text-[#FF00FF]/30 hover:text-[#FF00FF]">← BACK</button>
      </div>
    </main>
  );
}
