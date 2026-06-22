import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { exportData } from "@/lib/export";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "admin") return NextResponse.json({ error: { message: "Hanya admin yang bisa export" } }, { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "acara";
  const format = url.searchParams.get("format") || "xlsx";

  try {
    if (type === "users") {
      const rows = await prisma.user.findMany({
        select: { username: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      await prisma.exportLog.create({
        data: {
          userId: session.user.id,
          tipeData: "users",
          format,
          jumlahRecord: rows.length,
          status: "success",
        },
      });
      return exportData(rows, "users", format);
    }

    if (type === "acara") {
      const rows = await prisma.acara.findMany({
        select: { judul: true, lokasi: true, status: true, organizer: { select: { username: true } }, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      const mapped = rows.map((r) => ({
        judul: r.judul,
        lokasi: r.lokasi,
        status: r.status,
        organizer: r.organizer.username,
        created_at: r.createdAt,
      }));
      await prisma.exportLog.create({
        data: {
          userId: session.user.id,
          tipeData: "acara",
          format,
          jumlahRecord: mapped.length,
          status: "success",
        },
      });
      return exportData(mapped, "acara", format);
    }

    if (type === "absensi") {
      const acaraId = url.searchParams.get("acara_id");
      if (!acaraId) return NextResponse.json({ error: { message: "acara_id required" } }, { status: 400 });
      const rows = await prisma.absensiLog.findMany({
        where: { absensi: { acaraId: parseInt(acaraId) } },
        select: {
          user: { select: { username: true } },
          absensi: { select: { judul: true } },
          keterangan: true,
          waktuAbsen: true,
        },
        orderBy: { waktuAbsen: "desc" },
      });
      const mapped = rows.map((r) => ({
        username: r.user.username,
        absensi: r.absensi.judul,
        keterangan: r.keterangan,
        waktu_absen: r.waktuAbsen,
      }));
      await prisma.exportLog.create({
        data: {
          userId: session.user.id,
          tipeData: "absensi",
          format,
          parameter: JSON.stringify({ acara_id: parseInt(acaraId) }),
          jumlahRecord: mapped.length,
          status: "success",
        },
      });
      return exportData(mapped, "absensi", format);
    }

    return NextResponse.json({ error: { message: "Invalid type" } }, { status: 400 });
  } catch (error) {
    try {
      const params: any = {
        userId: session.user.id,
        tipeData: type,
        format,
        status: "error",
      };
      if (type === "absensi") {
        const acaraId = url.searchParams.get("acara_id");
        params.parameter = JSON.stringify({ acara_id: parseInt(acaraId || "0") });
      }
      await prisma.exportLog.create({ data: params });
    } catch {}
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

