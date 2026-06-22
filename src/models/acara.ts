import { prisma } from "@/lib/prisma";
import { Acara, AcaraPeserta } from "@/types";

export async function findAll(
  page = 1,
  limit = 20,
  filters?: { status?: string; search?: string; organizerId?: string }
) {
  const where: any = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.organizerId) where.organizerId = filters.organizerId;
  if (filters?.search) {
    where.OR = [
      { judul: { contains: filters.search } },
      { lokasi: { contains: filters.search } },
    ];
  }

  const rows = await prisma.acara.findMany({
    where,
    select: {
      id: true,
      organizerId: true,
      judul: true,
      deskripsi: true,
      lokasi: true,
      tanggalMulai: true,
      tanggalAkhir: true,
      maksPeserta: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  return rows.map((r) => ({
    id: r.id,
    organizer_id: r.organizerId,
    judul: r.judul,
    deskripsi: r.deskripsi,
    lokasi: r.lokasi,
    tanggal_mulai: r.tanggalMulai,
    tanggal_akhir: r.tanggalAkhir,
    maks_peserta: r.maksPeserta,
    status: r.status,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    organizer_name: r.organizer.username,
  })) as Acara[];
}

export async function findById(id: number) {
  const row = await prisma.acara.findUnique({
    where: { id },
    select: {
      id: true,
      organizerId: true,
      judul: true,
      deskripsi: true,
      lokasi: true,
      tanggalMulai: true,
      tanggalAkhir: true,
      maksPeserta: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { username: true } },
    },
  });
  if (!row) return undefined;
  return {
    id: row.id,
    organizer_id: row.organizerId,
    judul: row.judul,
    deskripsi: row.deskripsi,
    lokasi: row.lokasi,
    tanggal_mulai: row.tanggalMulai,
    tanggal_akhir: row.tanggalAkhir,
    maks_peserta: row.maksPeserta,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    organizer_name: row.organizer.username,
  } as Acara;
}

export async function create(data: {
  organizer_id: string;
  judul: string;
  deskripsi?: string;
  lokasi?: string;
  tanggal_mulai: Date;
  tanggal_akhir: Date;
  maks_peserta?: number;
}) {
  const result = await prisma.acara.create({
    data: {
      organizerId: data.organizer_id,
      judul: data.judul,
      deskripsi: data.deskripsi || null,
      lokasi: data.lokasi || null,
      tanggalMulai: data.tanggal_mulai,
      tanggalAkhir: data.tanggal_akhir,
      maksPeserta: data.maks_peserta || 0,
    },
  });
  return result.id;
}

export async function update(
  id: number,
  data: Partial<{
    judul: string;
    deskripsi: string;
    lokasi: string;
    tanggal_mulai: Date;
    tanggal_akhir: Date;
    maks_peserta: number;
    status: string;
  }>
) {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const mapped: any = {};
  for (const key of keys) {
    if (key === "tanggal_mulai") mapped.tanggalMulai = new Date(data.tanggal_mulai as any);
    else if (key === "tanggal_akhir") mapped.tanggalAkhir = new Date(data.tanggal_akhir as any);
    else if (key === "maks_peserta") mapped.maksPeserta = data.maks_peserta;
    else mapped[key] = (data as any)[key];
  }
  await prisma.acara.update({ where: { id }, data: mapped });
}

export async function remove(id: number) {
  await prisma.acara.delete({ where: { id } });
}

export async function findPesertaByAcara(acaraId: number, page = 1, limit = 50) {
  const rows = await prisma.acaraPeserta.findMany({
    where: { acaraId },
    include: { user: { select: { id: true, username: true, email: true, avatar: true } } },
    orderBy: { joinedAt: "asc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  return rows.map((r) => ({
    id: r.id,
    acara_id: r.acaraId,
    user_id: r.userId,
    joined_at: r.joinedAt,
    username: r.user.username,
    email: r.user.email,
    avatar: r.user.avatar,
  })) as (AcaraPeserta & { username: string; email: string; avatar: string | null })[];
}

export async function findBrowsable(userId: string, page = 1, limit = 50) {
  const joined = await prisma.acaraPeserta.findMany({
    where: { userId },
    select: { acaraId: true },
  });
  const joinedIds = joined.map((j) => j.acaraId);

  const rows = await prisma.acara.findMany({
    where: {
      id: joinedIds.length > 0 ? { notIn: joinedIds } : undefined,
      status: { not: "dibatalkan" },
    },
    select: {
      id: true,
      organizerId: true,
      judul: true,
      deskripsi: true,
      lokasi: true,
      tanggalMulai: true,
      tanggalAkhir: true,
      maksPeserta: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  return rows.map((r) => ({
    id: r.id,
    organizer_id: r.organizerId,
    judul: r.judul,
    deskripsi: r.deskripsi,
    lokasi: r.lokasi,
    tanggal_mulai: r.tanggalMulai,
    tanggal_akhir: r.tanggalAkhir,
    maks_peserta: r.maksPeserta,
    status: r.status,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    organizer_name: r.organizer.username,
  })) as Acara[];
}

export async function findJoined(userId: string, page = 1, limit = 50) {
  const rows = await prisma.acaraPeserta.findMany({
    where: { userId },
    include: {
      acara: { include: { organizer: { select: { username: true } } } },
    },
    orderBy: { joinedAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  return rows.map((r) => ({
    id: r.acara.id,
    organizer_id: r.acara.organizerId,
    judul: r.acara.judul,
    deskripsi: r.acara.deskripsi,
    lokasi: r.acara.lokasi,
    tanggal_mulai: r.acara.tanggalMulai,
    tanggal_akhir: r.acara.tanggalAkhir,
    maks_peserta: r.acara.maksPeserta,
    status: r.acara.status,
    created_at: r.acara.createdAt,
    updated_at: r.acara.updatedAt,
    organizer_name: r.acara.organizer.username,
    joined_at: r.joinedAt,
  })) as (Acara & { joined_at: Date; organizer_name: string })[];
}

export async function joinAcara(acaraId: number, userId: string) {
  await prisma.acaraPeserta.create({ data: { acaraId, userId } }).catch(() => {});
}

export async function leaveAcara(acaraId: number, userId: string) {
  await prisma.acaraPeserta.deleteMany({ where: { acaraId, userId } });
}

export async function removePeserta(acaraId: number, userId: string) {
  await prisma.acaraPeserta.deleteMany({ where: { acaraId, userId } });
}

export async function isPeserta(acaraId: number, userId: string) {
  const row = await prisma.acaraPeserta.findUnique({
    where: { acaraId_userId: { acaraId, userId } },
  });
  return !!row;
}
