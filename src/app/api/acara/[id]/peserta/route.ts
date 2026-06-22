import { NextResponse } from "next/server";
import { auth } from "@/auth";
import * as acaraModel from "@/models/acara";
import { apiError } from "@/lib/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;
    const peserta = await acaraModel.findPesertaByAcara(Number(id), page, limit);
    return NextResponse.json(peserta);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  try {
    await acaraModel.joinAcara(Number(id), userId);
    return NextResponse.json({ message: "Berhasil bergabung" });
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
  try {
    await acaraModel.leaveAcara(Number(id), userId);
    return NextResponse.json({ message: "Berhasil keluar" });
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
    if (!acara) return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
    if (acara.organizer_id !== userId && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { userId: targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (targetUserId === userId) return NextResponse.json({ error: "Tidak bisa mengeluarkan diri sendiri" }, { status: 400 });
    await acaraModel.removePeserta(Number(id), targetUserId);
    return NextResponse.json({ message: "Berhasil mengeluarkan peserta" });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
