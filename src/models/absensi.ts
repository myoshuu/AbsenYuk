import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import crypto from "crypto";

export async function createAbsensi(acaraId: number, organizerId: string, judul: string) {
  const result = await prisma.absensi.create({
    data: { acaraId, organizerId, judul },
  });
  return result.id;
}

export async function findByAcara(acaraId: number) {
  const rows = await prisma.absensi.findMany({
    where: { acaraId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    acara_id: r.acaraId,
    organizer_id: r.organizerId,
    judul: r.judul,
    status: r.status,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }));
}

export async function findById(id: number) {
  const row = await prisma.absensi.findUnique({ where: { id } });
  if (!row) return undefined;
  return {
    id: row.id,
    acara_id: row.acaraId,
    organizer_id: row.organizerId,
    judul: row.judul,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function updateStatus(id: number, status: string) {
  await prisma.absensi.update({ where: { id }, data: { status } });
}

export async function removeAbsensi(id: number) {
  await prisma.absensi.delete({ where: { id } });
}

export async function generateQr(absensiId: number, lokasi?: string, durasiMenit = 60, baseUrl?: string) {
  const now = new Date();
  const qrToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + durasiMenit * 60000);

  const detail = await prisma.absensiDetail.create({
    data: {
      absensiId,
      lokasi: lokasi || null,
      waktuMulai: now,
      waktuAkhir: expiresAt,
      qrToken,
      qrExpiresAt: expiresAt,
      status: "active",
    },
  });

  const origin = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || `http://localhost:3000`;
  const qrSvg = await QRCode.toString(
    `${origin}/absensi/submit?token=${qrToken}`,
    { type: "svg" }
  );

  await prisma.absensiDetail.update({
    where: { id: detail.id },
    data: { qrImage: qrSvg },
  });

  return { id: detail.id, qrToken, qrSvg, expiresAt };
}

export async function findDetailByToken(token: string) {
  const row = await prisma.absensiDetail.findUnique({
    where: { qrToken: token },
    include: { absensi: { include: { acara: true } } },
  });
  if (!row) return undefined;
  return {
    id: row.id,
    absensi_id: row.absensiId,
    lokasi: row.lokasi,
    waktu_mulai: row.waktuMulai,
    waktu_akhir: row.waktuAkhir,
    qr_token: row.qrToken,
    qr_image: row.qrImage,
    qr_expires_at: row.qrExpiresAt,
    status: row.status,
    created_at: row.createdAt,
    absensi_judul: row.absensi.judul,
    acara_judul: row.absensi.acara.judul,
    acara_id: row.absensi.acara.id,
  };
}

export async function submitAbsensi(absensiId: number, userId: string, keterangan = "hadir", catatan?: string) {
  try {
    await prisma.absensiLog.create({
      data: { absensiId, userId, keterangan, catatan: catatan || null },
    });
  } catch (error) {
    console.error("Failed to create absensi log:", error);
    throw error;
  }
}

export async function getLogsByAbsensi(absensiId: number) {
  const rows = await prisma.absensiLog.findMany({
    where: { absensiId },
    include: { user: { select: { username: true, avatar: true } } },
    orderBy: { waktuAbsen: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    absensi_id: r.absensiId,
    user_id: r.userId,
    waktu_absen: r.waktuAbsen,
    keterangan: r.keterangan,
    catatan: r.catatan,
    username: r.user.username,
    avatar: r.user.avatar,
  }));
}

export async function deleteLog(id: number) {
  await prisma.absensiLog.delete({ where: { id } });
}

export async function updateLog(id: number, data: { keterangan?: string; catatan?: string }) {
  await prisma.absensiLog.update({ where: { id }, data });
}
export async function getLogsByUser(userId: string) {
  const rows = await prisma.absensiLog.findMany({
    where: { userId },
    select: {
      id: true,
      absensiId: true,
      userId: true,
      waktuAbsen: true,
      keterangan: true,
      catatan: true,
      absensi: {
        select: {
          judul: true,
          acara: { select: { judul: true } },
        },
      },
    },
    orderBy: { waktuAbsen: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    absensi_id: r.absensiId,
    user_id: r.userId,
    waktu_absen: r.waktuAbsen,
    keterangan: r.keterangan,
    catatan: r.catatan,
    acara_judul: r.absensi.acara.judul,
    absensi_judul: r.absensi.judul,
  }));
}
