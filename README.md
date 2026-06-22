# AbsenYuk V2

<p align="center">
  <img src="public/favicon.svg" alt="AbsenYuk Logo" width="64" height="64" />
</p>

<p align="center">
  Sistem manajemen kehadiran acara modern dengan pelacakan berbasis QR, chat real-time, dan analitik komprehensif.
</p>

<p align="center">
  <a href="#fitur">Fitur</a> •
  <a href="#teknologi">Teknologi</a> •
  <a href="#memulai">Memulai</a> •
  <a href="#setup-environment">Setup Environment</a> •
  <a href="#struktur-proyek">Struktur</a>
</p>

---

## ✨ Fitur

### Untuk Penyelenggara Acara
- 📅 **Manajemen Acara** — Buat, edit, dan kelola acara dengan batas peserta
- 📊 **Absensi QR Code** — Hasilkan QR code unik untuk setiap sesi absensi
- 📁 **Berbagi File** — Unggah dan bagikan dokumen ke peserta acara
- 💬 **Chat Real-time** — Grup chat untuk diskusi acara
- 📥 **Export Laporan** — Unduh data absensi sebagai PDF atau Excel

### Untuk Peserta
- 🔍 **Jelajahi Acara** — Temukan dan bergabung dengan acara
- 📱 **Check-in Mudah** — Pindai QR code untuk mengisi absensi
- 💬 **Tetap Terhubung** — Berpartisipasi di grup chat acara
- 📄 **Akses Materi** — Unduh file acara

### Untuk Administrator
- 👥 **Manajemen User** — Kelola semua user dan peran
- 📈 **Dashboard Analytics** — Ringkasan aktivitas platform
- 🎛️ **Kontrol Sistem** — Kelola acara, absensi, dan export

---

## Teknologi

| Kategori | Teknologi |
|----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Bahasa** | TypeScript |
| **Database** | PostgreSQL dengan Prisma ORM |
| **Authentication** | NextAuth.js v5 (JWT) |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui + Radix UI |
| **Animasi** | Framer Motion |
| **Chart** | Recharts |
| **Password Hashing** | bcryptjs |
| **Validasi** | Zod |
| **Export** | PDFMake, ExcelJS |
| **Generator QR** | qrcode |

---

## Memulai

### Persyaratan

- **Node.js** 18+ (disarankan versi LTS)
- **PostgreSQL** 14+ database
- **npm** atau **pnpm**

### 1. Clone Repository

```bash
git clone <repository-url>
cd AbsenYuk-V2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Buat file `.env.local` di root project:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Cloud database (Aiven, Supabase, dll)
# DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"
```

**Generate AUTH_SECRET:**
```bash
# Windows (PowerShell)
openssl rand -base64 32

# Linux/Mac
openssl rand -base64 32
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed dengan data contoh (opsional)
npm run db:seed
```

### 5. Jalankan Aplikasi

```bash
# Mode development
npm run dev

# Mode production
npm run build
npm run start
```

Aplikasi akan tersedia di [http://localhost:3000](http://localhost:3000)

---

## Struktur Proyek

```
AbsenYuk-V2/
├── prisma/
│   └── schema.prisma       # Schema & model database
├── database/
│   └── seed-pg.js         # Seeder database
├── src/
│   ├── app/                # Halaman Next.js App Router
│   │   ├── (auth)/        # Halaman Login, Register
│   │   ├── api/           # Route API
│   │   ├── dashboard/     # Halaman dashboard terproteksi
│   │   └── fitur/         # Halaman publik
│   ├── auth.ts            # Konfigurasi NextAuth
│   ├── components/        # Komponen React
│   │   ├── admin/         # Komponen admin
│   │   ├── dashboard/     # Komponen dashboard
│   │   ├── layout/       # Komponen layout
│   │   ├── public/        # Section halaman publik
│   │   ├── shared/       # Komponen bersama
│   │   └── ui/           # Komponen UI (shadcn)
│   ├── lib/               # Utilities & helpers
│   │   ├── prisma.ts      # Instance Prisma client
│   │   ├── utils.ts       # Utilities umum
│   │   └── cache.ts       # In-memory caching
│   ├── models/            # Fungsi query database
│   └── hooks/             # Custom React hooks
├── public/                # Asset statis
├── storage/               # File upload (gitignored)
├── AGENTS.md              # Dokumentasi developer
└── package.json
```

---

## Environment Variables

| Variabel | Wajib | Deskripsi |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `AUTH_SECRET` | ✅ | Secret key untuk NextAuth |
| `NEXTAUTH_URL` | ❌ | URL aplikasi (default: localhost) |

---

## Schema Database

### Model Utama

- **User** — Akun user dengan peran (admin, organizer, user)
- **Acara** — Acara yang dibuat oleh organizer
- **AcaraPeserta** — Record partisipasi acara
- **ChatMessage** — Pesan chat real-time
- **AcaraFile** — File acara yang diupload
- **Absensi** — Sesi absensi
- **AbsensiDetail** — Detail QR code per sesi
- **AbsensiLog** — Record absensi
- **ExportLog** — Riwayat export

### Sistem Peran

| Peran | Izin |
|------|------|
| `admin` | Akses penuh ke semua fitur dan manajemen user |
| `organizer` | Buat/kelola acara, generate QR code, lihat absensi |
| `user` | Jelajahi/bergabung acara, submit absensi, chat |

---

## Script yang Tersedia

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push perubahan schema
npm run db:seed          # Seed database
npm run db:reset         # Reset database
npm run db:studio        # Buka Prisma Studio
npm run db:status        # Cek status migration
npm run db:setup         # Setup lengkap (generate + push + seed)

# Production
npm run build            # Build untuk production
npm run start            # Start production server
npm run lint             # Jalankan ESLint

# Tunneling (untuk testing QR code)
npm run tunnel           # Start ngrok tunnel
npm run dev:tunnel       # Dev server dengan tunnel
```

---

## Pengembang

| Nama | Peran |
|------|------|
| Rahmat Ramadhan | Frontend Developer |
| Azahari Faisal | Frontend Developer |
| Muhammad Putra Ramadhan | Backend Developer |
| Fahrizal Pratama | Backend Developer |

---


## Acknowledgments

Dibangun menggunakan:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)


