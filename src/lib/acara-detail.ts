import { prisma } from "@/lib/prisma";

export interface AcaraSummary {
  id: number;
  organizer_id: string;
  judul: string;
  deskripsi: string | null;
  lokasi: string | null;
  tanggal_mulai: Date;
  tanggal_akhir: Date;
  maks_peserta: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  organizer_name: string;
  peserta_count: number;
}

export interface AcaraPesertaItem {
  id: number;
  user_id: string;
  username: string;
  email: string;
  avatar: string | null;
  joined_at: Date;
}

export interface AcaraWithPeserta extends AcaraSummary {
  peserta: AcaraPesertaItem[];
}

export async function getAcaraSummary(id: string): Promise<AcaraSummary | undefined> {
  const [acara, count] = await Promise.all([
    prisma.acara.findUnique({
      where: { id: Number(id) },
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
    }),
    prisma.acaraPeserta.count({ where: { acaraId: Number(id) } }),
  ]);
  if (!acara) return undefined;
  return {
    id: acara.id,
    organizer_id: acara.organizerId,
    judul: acara.judul,
    deskripsi: acara.deskripsi,
    lokasi: acara.lokasi,
    tanggal_mulai: acara.tanggalMulai,
    tanggal_akhir: acara.tanggalAkhir,
    maks_peserta: acara.maksPeserta,
    status: acara.status,
    created_at: acara.createdAt,
    updated_at: acara.updatedAt,
    organizer_name: acara.organizer.username,
    peserta_count: count,
  };
}

export async function getAcaraWithPeserta(id: string): Promise<AcaraWithPeserta | undefined> {
  const acara = await getAcaraSummary(id);
  if (!acara) return undefined;

  const rows = await prisma.acaraPeserta.findMany({
    where: { acaraId: Number(id) },
    include: { user: { select: { id: true, username: true, email: true, avatar: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return {
    ...acara,
    peserta: rows.map((r) => ({
      id: r.id,
      user_id: r.userId,
      username: r.user.username,
      email: r.user.email,
      avatar: r.user.avatar,
      joined_at: r.joinedAt,
    })),
  };
}

export async function checkAcaraOwnership(id: string, userId: string, role: string): Promise<boolean> {
  if (role === "admin") return true;
  const acara = await prisma.acara.findUnique({
    where: { id: Number(id) },
    select: { organizerId: true },
  });
  return acara?.organizerId === userId;
}
