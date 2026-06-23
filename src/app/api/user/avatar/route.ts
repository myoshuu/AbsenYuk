import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const formData = await req.formData();
  const file = formData.get("avatar") as File;
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Format file tidak didukung" }, { status: 400 });
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}-${Date.now()}.${ext}`;
  const storagePath = `avatars/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("chum-bucket")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: { message: "Gagal mengupload avatar" } },
      { status: 502 }
    );
  }

  const { prisma } = await import("@/lib/prisma");

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (existing?.avatar) {
    let oldKey: string | null = null;
    if (existing.avatar.startsWith("avatars/")) {
      oldKey = existing.avatar;
    } else if (existing.avatar.includes("/object/sign/chum-bucket/")) {
      oldKey = existing.avatar.split("/object/sign/chum-bucket/")[1]?.split("?")[0];
    }
    if (oldKey) {
      await supabase.storage.from("chum-bucket").remove([oldKey]);
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { avatar: storagePath } });

  return NextResponse.json({
    message: "Avatar berhasil diubah",
    avatar: `/api/user/avatar/serve?key=${storagePath}`,
    updatedAt: new Date().toISOString()
  });
}
