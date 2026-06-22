import { prisma } from "@/lib/prisma";
import { FileAcara } from "@/types";

export async function getFiles(acaraId: number) {
  const rows = await prisma.acaraFile.findMany({
    where: { acaraId },
    include: { uploader: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    acara_id: r.acaraId,
    uploader_id: r.uploaderId,
    nama_file: r.namaFile,
    nama_asli: r.namaAsli,
    tipe_file: r.tipeFile,
    ukuran: r.ukuran,
    path: r.path,
    created_at: r.createdAt,
    uploader_name: r.uploader.username,
  })) as FileAcara[];
}

export async function createFile(data: {
  acara_id: number;
  uploader_id: string;
  nama_file: string;
  nama_asli: string;
  tipe_file: string;
  ukuran: number;
  path: string;
}) {
  const result = await prisma.acaraFile.create({
    data: {
      acaraId: data.acara_id,
      uploaderId: data.uploader_id,
      namaFile: data.nama_file,
      namaAsli: data.nama_asli,
      tipeFile: data.tipe_file,
      ukuran: data.ukuran,
      path: data.path,
    },
  });
  return result.id;
}

export async function deleteFile(id: number) {
  const file = await prisma.acaraFile.findUnique({ where: { id }, select: { path: true } });
  if (file) await prisma.acaraFile.delete({ where: { id } });
  return file?.path;
}
