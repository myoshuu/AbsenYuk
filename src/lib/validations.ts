import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  role: z.enum(["user", "organizer"]).default("user"),
});

export const registerSimpleSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(30, "Username maksimal 30 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const acaraSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter").max(150),
  deskripsi: z.string().optional(),
  lokasi: z.string().min(3, "Lokasi minimal 3 karakter").optional(),
  tanggal_mulai: z.string().transform((v) => new Date(v)),
  tanggal_akhir: z.string().transform((v) => new Date(v)),
  maks_peserta: z.number().int().min(0).default(0),
});

export const createAcaraSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi").max(150, "Judul maksimal 150 karakter"),
  deskripsi: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  lokasi: z.string().max(255).optional(),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggal_akhir: z.string().min(1, "Tanggal akhir wajib diisi"),
  status: z.enum(["akan_datang", "berlangsung", "selesai", "dibatalkan"]).optional(),
  maks_peserta: z.number().min(0).default(0),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, underscore")
    .optional(),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export const absensiSchema = z.object({
  judul: z.string().min(2, "Judul minimal 2 karakter").max(100),
  lokasi: z.string().optional(),
});

export const createAbsensiSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi").max(100),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong").max(1000, "Pesan maksimal 1000 karakter"),
});

export const exportSchema = z.object({
  type: z.enum(["acara", "absensi", "users"]),
  format: z.enum(["xlsx", "pdf"]),
  acara_id: z.number().optional(),
});
