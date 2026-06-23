import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 })
  }

  const { data, error } = await supabase.storage
    .from("chum-bucket")
    .createSignedUrl(key, 3600)

  if (error || !data) {
    return NextResponse.json({ error: "Avatar tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.redirect(data.signedUrl)
}
