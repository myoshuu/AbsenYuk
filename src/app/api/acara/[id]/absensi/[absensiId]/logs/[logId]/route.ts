import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateLog, deleteLog } from "@/models/absensi";
import * as acaraModel from "@/models/acara";
import { apiError } from "@/lib/errors";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; absensiId: string; logId: string }> }
) {
  const { id: acaraId, logId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const acara = await acaraModel.findById(Number(acaraId));
    if (!acara) return NextResponse.json({ error: { message: "Acara tidak ditemukan" } }, { status: 404 });
    if (acara.organizer_id !== userId && role !== "admin") {
      return NextResponse.json({ error: { message: "Tidak memiliki akses" } }, { status: 403 });
    }

    const body = await req.json();
    await updateLog(Number(logId), {
      keterangan: body.keterangan,
      catatan: body.catatan,
    });
    return NextResponse.json({ message: "Log berhasil diperbarui" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; absensiId: string; logId: string }> }
) {
  const { id: acaraId, logId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const acara = await acaraModel.findById(Number(acaraId));
    if (!acara) return NextResponse.json({ error: { message: "Acara tidak ditemukan" } }, { status: 404 });
    if (acara.organizer_id !== userId && role !== "admin") {
      return NextResponse.json({ error: { message: "Tidak memiliki akses" } }, { status: 403 });
    }

    await deleteLog(Number(logId));
    return NextResponse.json({ message: "Log berhasil dihapus" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
