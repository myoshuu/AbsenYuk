import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import * as acaraModel from "@/models/acara";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const acara = await acaraModel.findById(Number(id));
    if (!acara) return NextResponse.json({ error: { message: "Acara tidak ditemukan" } }, { status: 404 });
    return NextResponse.json(acara);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const acara = await acaraModel.findById(Number(id));
    if (!acara) return NextResponse.json({ error: { message: "Acara tidak ditemukan" } }, { status: 404 });
    if (acara.organizer_id !== userId && role !== "admin") {
      return NextResponse.json({ error: { message: "Tidak memiliki akses" } }, { status: 403 });
    }

    const body = await req.json();
    await acaraModel.update(Number(id), body);
    return NextResponse.json({ message: "Acara berhasil diperbarui" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const acara = await acaraModel.findById(Number(id));
    if (!acara) return NextResponse.json({ error: { message: "Acara tidak ditemukan" } }, { status: 404 });
    if (acara.organizer_id !== userId && role !== "admin") {
      return NextResponse.json({ error: { message: "Tidak memiliki akses" } }, { status: 403 });
    }
    await acaraModel.remove(Number(id));
    return NextResponse.json({ message: "Acara berhasil dihapus" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
