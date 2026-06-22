import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: { message: "Token dan password wajib diisi" } }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: { message: "Password minimal 6 karakter" } }, { status: 400 });

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset) return NextResponse.json({ error: { message: "Token tidak valid" } }, { status: 400 });
    if (reset.used) return NextResponse.json({ error: { message: "Token sudah digunakan" } }, { status: 400 });
    if (new Date() > reset.expiresAt) return NextResponse.json({ error: { message: "Token sudah kedaluwarsa" } }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });

    return NextResponse.json({ message: "Password berhasil direset" });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message || "Terjadi kesalahan" } }, { status: 500 });
  }
}
