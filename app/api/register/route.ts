import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const Body = z.object({
  email: z.string().email().max(254),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, dashes or underscores"),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`register:${ip}`, { windowMs: 60_000, max: 5 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429 },
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid input", details: (err as Error).message },
      { status: 400 },
    );
  }

  const email = body.email.toLowerCase();
  const username = body.username;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const which = existing.email === email ? "email" : "username";
    return NextResponse.json(
      { error: `This ${which} is already taken` },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
    select: { id: true, email: true, username: true },
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}
