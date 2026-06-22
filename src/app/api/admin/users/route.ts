import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;
    const rows = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    });
    return NextResponse.json(rows.map((r) => ({ ...r, created_at: r.createdAt })));
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    const body = await req.json();
    const { username, email, password, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Semua field wajib diisi" } },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingEmail) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" } },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (existingUsername) {
      return NextResponse.json(
        { error: { code: "USERNAME_EXISTS", message: "Username sudah digunakan" } },
        { status: 409 }
      );
    }

    const id = uuidv4().slice(0, 12);
    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { id, username, email, password: hashed, role: role || "user" },
    });

    return NextResponse.json(
      { message: "User berhasil ditambahkan", user: { id, username, email, role: role || "user" } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("username")) {
      return NextResponse.json(
        { error: { code: "USERNAME_EXISTS", message: "Username sudah digunakan" } },
        { status: 409 }
      );
    }
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" } },
        { status: 409 }
      );
    }
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
