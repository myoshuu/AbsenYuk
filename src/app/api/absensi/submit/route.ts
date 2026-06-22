import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { submitAbsensi, findDetailByToken } from "@/models/absensi";
import { apiError } from "@/lib/errors";

export async function POST(req: Request) {
  const session = await auth();

  try {
    const { token, keterangan, catatan } = await req.json();
    const detail = await findDetailByToken(token);
    if (!detail) return NextResponse.json({ error: { message: "QR Code tidak valid" } }, { status: 404 });
    if (detail.status !== "active") return NextResponse.json({ error: { message: "Sesi absensi sudah ditutup" } }, { status: 400 });

    const userId = session ? (session.user as any).id : "anonymous";
    await submitAbsensi(detail.absensi_id, userId, keterangan || "hadir", catatan);
    return NextResponse.json({ message: "Absensi berhasil dicatat" });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: { message: "Anda sudah melakukan absensi" } }, { status: 409 });
    }
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
