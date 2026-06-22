import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/errors";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    created_at: user.createdAt,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    await prisma.user.update({
      where: { id: userId },
      data: { username: data.username },
    });
    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: { message: error.issues[0].message } }, { status: 400 });
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
