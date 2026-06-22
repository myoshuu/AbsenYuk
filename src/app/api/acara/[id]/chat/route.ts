import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError, ForbiddenError } from "@/lib/errors";
import { chatSchema } from "@/lib/validations";
import { getMessages, sendMessage } from "@/models/chat";
import { isPeserta } from "@/models/acara";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    if (role === "user") {
      const joined = await isPeserta(Number(id), userId);
      if (!joined) return NextResponse.json({ error: { message: "Anda belum bergabung" } }, { status: 403 });
    }
    const messages = await getMessages(Number(id));
    return NextResponse.json(messages);
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
  const role = (session.user as any).role;

  try {
    if (role === "user") {
      const joined = await isPeserta(Number(id), userId);
      if (!joined) return NextResponse.json({ error: { message: "Anda belum bergabung" } }, { status: 403 });
    }
    const body = await req.json();
    const data = chatSchema.parse(body);
    const msg = await sendMessage(Number(id), userId, data.message);
    return NextResponse.json(msg, { status: 201 });
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: { message: error.issues[0].message } }, { status: 400 });
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
