import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: { message: "Email wajib diisi" } }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: { message: "Email tidak ditemukan" } }, { status: 404 });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetLink = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log(`[Password Reset] Link untuk ${email}: ${resetLink}`);

    return NextResponse.json({ message: "Link reset password telah dikirim" });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message || "Terjadi kesalahan" } }, { status: 500 });
  }
}
