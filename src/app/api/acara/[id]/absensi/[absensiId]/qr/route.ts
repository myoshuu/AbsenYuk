import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateQr } from "@/models/absensi";
import { apiError } from "@/lib/errors";

export async function POST(req: Request, { params }: { params: Promise<{ id: string; absensiId: string }> }) {
  const { absensiId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { lokasi } = await req.json().catch(() => ({}));
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const origin = `${proto}://${host}`;
    const result = await generateQr(Number(absensiId), lokasi, 60, origin);
    return NextResponse.json(result);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
