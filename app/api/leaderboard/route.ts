import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const tetris = db
    .prepare(
      `SELECT userName, score, createdAt FROM score
       WHERE game = 'tetris' ORDER BY score DESC LIMIT 10`
    )
    .all();

  const pacman = db
    .prepare(
      `SELECT userName, score, createdAt FROM score
       WHERE game = 'pacman' ORDER BY score DESC LIMIT 10`
    )
    .all();

  return NextResponse.json({ tetris, pacman });
}
