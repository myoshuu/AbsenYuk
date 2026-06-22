import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLogsByAbsensi } from "@/models/absensi";
import { apiError } from "@/lib/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; absensiId: string }> }) {
  const { absensiId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const logs = await getLogsByAbsensi(Number(absensiId));
    return NextResponse.json(logs);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
