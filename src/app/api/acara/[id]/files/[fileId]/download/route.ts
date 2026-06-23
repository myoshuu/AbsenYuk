import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase-server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const file = await prisma.acaraFile.findUnique({
      where: { id: parseInt(fileId) },
    });
    if (!file || file.acaraId !== parseInt(id)) {
      return NextResponse.json({ error: { message: "File tidak ditemukan" } }, { status: 404 });
    }

    const { data, error } = await supabase.storage
      .from("chum-bucket")
      .createSignedUrl(file.path, 3600);

    if (error || !data) {
      return NextResponse.json(
        { error: { message: "File tidak ditemukan di penyimpanan" } },
        { status: 404 }
      );
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
