import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { updateLog, deleteLog } from "@/models/absensi";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    const { keterangan, catatan } = await req.json();
    if (!keterangan && catatan === undefined)
      return NextResponse.json({ error: { message: "Minimal satu field harus diisi" } }, { status: 400 });
    await updateLog(Number(id), { keterangan, catatan });
    return NextResponse.json({ message: "Log berhasil diperbarui" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    await deleteLog(Number(id));
    return NextResponse.json({ message: "Log berhasil dihapus" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
