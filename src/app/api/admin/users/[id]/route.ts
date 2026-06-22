import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { username, email, role, password } = await req.json();

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return NextResponse.json({ error: { message: "Format email tidak valid" } }, { status: 400 });
      const dup = await prisma.user.findFirst({ where: { email, id: { not: id } }, select: { id: true } });
      if (dup) return NextResponse.json({ error: { message: "Email sudah digunakan" } }, { status: 409 });
    }
    if (username) {
      if (username.length < 3) return NextResponse.json({ error: { message: "Username minimal 3 karakter" } }, { status: 400 });
      const dup = await prisma.user.findFirst({ where: { username, id: { not: id } }, select: { id: true } });
      if (dup) return NextResponse.json({ error: { message: "Username sudah digunakan" } }, { status: 409 });
    }

    const data: Record<string, unknown> = {};
    if (role) data.role = role;
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: { message: "Password minimal 6 karakter" } }, { status: 400 });
      data.password = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.user.deleteMany({ where: { id, role: { not: "admin" } } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
