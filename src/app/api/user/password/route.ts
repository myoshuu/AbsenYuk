import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/errors";
import { passwordSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = passwordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) return NextResponse.json({ error: { message: "User tidak ditemukan" } }, { status: 404 });

    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: { message: "Password saat ini salah" } }, { status: 400 });

    const hashed = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: { message: error.issues[0].message } }, { status: 400 });
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
