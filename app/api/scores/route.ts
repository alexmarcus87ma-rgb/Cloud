import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { score, game } = (await req.json()) as { score: number; game: string };

  if (typeof score !== "number" || !["tetris", "pacman"].includes(game)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  db.prepare(
    `INSERT INTO score (id, userId, userName, game, score, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    session.user.id,
    session.user.name ?? "UNKNOWN",
    game,
    score,
    Date.now()
  );

  return NextResponse.json({ ok: true });
}
