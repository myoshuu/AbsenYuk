import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const formData = await req.formData();
  const file = formData.get("avatar") as File;
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Format file tidak didukung" }, { status: 400 });
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}-${Date.now()}.${ext}`;
  const filePath = `uploads/avatars/${fileName}`;

  const fs = require("fs");
  const path = require("path");
  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, fileName), buffer);

  const { prisma } = await import("@/lib/prisma");
  await prisma.user.update({ where: { id: userId }, data: { avatar: `/${filePath}` } });

  const avatarUrl = `/${filePath}`;

  return NextResponse.json({
    message: "Avatar berhasil diubah",
    avatar: avatarUrl,
    updatedAt: new Date().toISOString()
  });
}
