export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "organizer" | "admin";
  avatar: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Acara {
  id: number;
  organizer_id: string;
  judul: string;
  deskripsi: string | null;
  lokasi: string | null;
  tanggal_mulai: Date;
  tanggal_akhir: Date;
  maks_peserta: number;
  status: "akan_datang" | "berlangsung" | "selesai" | "dibatalkan";
  created_at: Date;
  updated_at: Date;
}

export interface AcaraPeserta {
  id: number;
  acara_id: number;
  user_id: string;
  joined_at: Date;
}

export interface ChatMessage {
  id: number;
  acara_id: number;
  user_id: string;
  message: string;
  created_at: Date;
  username?: string;
  avatar?: string | null;
}

export interface FileAcara {
  id: number;
  acara_id: number;
  uploader_id: string;
  nama_file: string;
  nama_asli: string;
  tipe_file: string;
  ukuran: number;
  path: string;
  created_at: Date;
}

export interface Absensi {
  id: number;
  acara_id: number;
  organizer_id: string;
  judul: string;
  status: "pending" | "dibuka" | "ditutup";
  created_at: Date;
  updated_at: Date;
}

export interface AbsensiDetail {
  id: number;
  absensi_id: number;
  lokasi: string | null;
  waktu_mulai: Date;
  waktu_akhir: Date | null;
  qr_token: string;
  qr_image: string | null;
  qr_expires_at: Date | null;
  status: "pending" | "active" | "expired";
  created_at: Date;
}

export interface AbsensiLog {
  id: number;
  absensi_id: number;
  user_id: string;
  waktu_absen: Date;
  keterangan: "hadir" | "sakit" | "izin" | "terlambat" | "tanpa_keterangan";
  catatan: string | null;
}
