import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import * as absensiModel from "@/models/absensi";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const list = await absensiModel.findByAcara(Number(id));
    return NextResponse.json(list);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: acaraId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const { judul } = await req.json();
    const absensiId = await absensiModel.createAbsensi(Number(acaraId), userId, judul);
    return NextResponse.json({ id: absensiId, message: "Sesi absensi dibuat" }, { status: 201 });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
