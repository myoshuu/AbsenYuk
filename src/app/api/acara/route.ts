import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { acaraSchema } from "@/lib/validations";
import * as acaraModel from "@/models/acara";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "list";

  try {
    if (type === "browse") {
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 50;
      const rows = await acaraModel.findBrowsable(userId, page, limit);
      return NextResponse.json(rows);
    }
    if (type === "joined") {
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 50;
      const rows = await acaraModel.findJoined(userId, page, limit);
      return NextResponse.json(rows);
    }
    if (role === "admin" || role === "organizer") {
      const page = Number(searchParams.get("page")) || 1;
      const status = searchParams.get("status") || undefined;
      const search = searchParams.get("search") || undefined;
      const organizerId = role === "admin" ? undefined : userId;
      const rows = await acaraModel.findAll(page, 50, { status, search, organizerId });
      return NextResponse.json(rows);
    }
    return NextResponse.json([]);
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role === "user") return NextResponse.json({ error: { message: "Hanya organizer/admin yang bisa membuat acara" } }, { status: 403 });

  try {
    const body = await req.json();
    const data = acaraSchema.parse(body);
    const id = await acaraModel.create({ ...data, organizer_id: (session.user as any).id });
    return NextResponse.json({ message: "Acara berhasil dibuat", id }, { status: 201 });
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: { message: error.issues[0].message } }, { status: 400 });
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
