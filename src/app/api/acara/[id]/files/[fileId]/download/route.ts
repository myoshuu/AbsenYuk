import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const file = await prisma.acaraFile.findUnique({
      where: { id: parseInt(fileId) },
    });
    if (!file || file.acaraId !== parseInt(id)) {
      return NextResponse.json({ error: { message: "File tidak ditemukan" } }, { status: 404 });
    }

    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(process.cwd(), file.path);
    if (!fs.existsSync(filePath)) return NextResponse.json({ error: { message: "File tidak ditemukan" } }, { status: 404 });

    const buffer = fs.readFileSync(filePath);
    const contentType = file.tipeFile === "pdf" ? "application/pdf"
      : ["xlsx", "xls"].includes(file.tipeFile) ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${file.namaAsli}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
