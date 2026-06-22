import { NextResponse } from "next/server";
import { findDetailByToken } from "@/models/absensi";
import { apiError } from "@/lib/errors";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const detail = await findDetailByToken(token);
    if (!detail) return NextResponse.json({ error: { message: "QR Code tidak valid" } }, { status: 404 });
    if (detail.status !== "active") return NextResponse.json({ error: { message: "QR Code sudah tidak aktif" } }, { status: 400 });
    if (detail.qr_expires_at && new Date(detail.qr_expires_at) < new Date()) {
      return NextResponse.json({ error: { message: "QR Code sudah kedaluwarsa" } }, { status: 400 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
