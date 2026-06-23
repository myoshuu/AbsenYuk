import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFiles, createFile, deleteFile } from "@/models/file";
import { apiError } from "@/lib/errors";
import { supabase } from "@/lib/supabase-server";

const ALLOWED = ["pdf", "xlsx", "xls", "docx", "doc"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const files = await getFiles(Number(id));
    return NextResponse.json(files);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role === "user") return NextResponse.json({ error: { message: "Hanya organizer yang bisa upload" } }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: { message: "File tidak ditemukan" } }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED.includes(ext)) {
      return NextResponse.json({ error: { message: "Hanya PDF, Excel, atau Word" } }, { status: 400 });
    }

    const fileName = `${id}-${Date.now()}.${ext}`;
    const storagePath = `acara-${id}/${fileName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("chum-bucket")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: { message: "Gagal mengupload file ke penyimpanan" } },
        { status: 502 }
      );
    }

    await createFile({
      acara_id: Number(id),
      uploader_id: (session.user as any).id,
      nama_file: fileName,
      nama_asli: file.name,
      tipe_file: ext,
      ukuran: file.size,
      path: storagePath,
    });

    return NextResponse.json({ message: "File berhasil diupload" }, { status: 201 });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
