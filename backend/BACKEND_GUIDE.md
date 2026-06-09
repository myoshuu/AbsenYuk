# Backend Guide — AbsenYuk

Dokumentasi ini ditujukan untuk developer dan AI coding assistant agar memahami struktur backend dengan cepat dan melakukan perubahan secara konsisten.

## Ringkas Arsitektur
- Node.js + Express sebagai HTTP API server.
- MySQL/MariaDB sebagai database.
- JWT untuk autentikasi.
- Role-based access di middleware.
- Pola pemisahan: route handler (api) -> data access (database) -> db pool.

## Struktur Folder
```
backend/
  src/
    api/            # Express router per domain
    database/       # Query dan business logic per domain
    middleware/     # Auth middleware (JWT + role)
    utils/          # Utilitas (mis. QR)
    server.js       # Entrypoint express app
  README.md         # Dokumentasi ringkas API
  run-dev.bat       # Helper untuk running lokal
```

### Tanggung Jawab Utama
- `src/server.js`:
  - Inisialisasi express, middleware global (cors, helmet, morgan, cookie-parser).
  - Register semua route `/api/*`.
- `src/api/*.js`:
  - Definisi endpoint dan middleware auth per route.
- `src/database/*.js`:
  - Validasi input sederhana.
  - Akses DB melalui `mysql2/promise`.
  - Transaksi untuk operasi write (`beginTransaction`, `commit`, `rollback`).
- `src/middleware/auth.js`:
  - `authenticateToken`: verifikasi JWT.
  - `authorizeRoles`: validasi role.

## Menjalankan Project
### Development
```
npm install
npm run dev
```

### Production
```
npm start
```

Server default:
```
http://localhost:3000
```

## Environment Variables
Buat file `.env` di folder `backend/`:
```
APP_PORT=3000
APP_BASE_URL=http://localhost:3000
JWT_SECRET=your-secret-key

DB_HOST=localhost
DB_USER=root
DB_PASS=your-db-pass
DB_NAME=absenyuk
DB_PORT=3306
```

## Database Schema dan Relasi
### Tabel Utama
- `tbl_user`
  - PK: `id_user`
  - Menyimpan akun user (role: user/organizer/admin).

- `tbl_acara`
  - PK: `id_acara`
  - FK: `id_user` -> `tbl_user.id_user`
  - Acara yang dibuat oleh organizer.

- `tbl_acara_ikuti`
  - PK: `id_acara_ikuti`
  - FK: `id_acara` -> `tbl_acara.id_acara`
  - FK: `id_user` -> `tbl_user.id_user`
  - Relasi user yang mengikuti acara.

- `tbl_absensi`
  - PK: `id_absensi`
  - FK: `id_acara` -> `tbl_acara.id_acara`
  - FK: `id_user` -> `tbl_user.id_user`
  - Sesi absensi untuk sebuah acara.

- `tbl_detail_absensi`
  - PK: `id_detail_absensi`
  - FK: `id_absensi` -> `tbl_absensi.id_absensi`
  - Menyimpan jadwal absensi dan token QR.

- `tbl_absensi_log`
  - PK: `id_absensi_log`
  - FK: `id_absensi` -> `tbl_absensi.id_absensi`
  - FK: `id_user` -> `tbl_user.id_user`
  - Log kehadiran per user per sesi.

- `tbl_acara_post`
  - PK: `id_post`
  - FK: `id_acara` -> `tbl_acara.id_acara`
  - FK: `id_user` -> `tbl_user.id_user`
  - Post di ruang acara.

- `tbl_acara_post_komentar`
  - PK: `id_komentar`
  - FK: `id_post` -> `tbl_acara_post.id_post`
  - FK: `id_user` -> `tbl_user.id_user`
  - Komentar per post.

### Ringkasan Relasi
- `tbl_user` -> banyak `tbl_acara`, `tbl_acara_ikuti`, `tbl_absensi`, `tbl_absensi_log`, `tbl_acara_post`, `tbl_acara_post_komentar`.
- `tbl_acara` -> banyak `tbl_acara_ikuti`, `tbl_absensi`, `tbl_acara_post`.
- `tbl_absensi` -> banyak `tbl_detail_absensi`, `tbl_absensi_log`.
- `tbl_acara_post` -> banyak `tbl_acara_post_komentar`.

## Autentikasi dan Otorisasi
- Login menghasilkan JWT dengan payload: `id_user`, `email`, `role`.
- Semua endpoint protected menerima token via header:
  - `Authorization: Bearer <token>`
- `authenticateToken` memverifikasi token dan inject `req.user`.
- `authorizeRoles` memeriksa role pengguna sesuai izin endpoint.

Catatan:
- `id_user` selalu diambil dari token di backend.
- Client tidak perlu (dan tidak boleh) mengirim `id_user` untuk endpoint protected.

## Daftar Endpoint dan Contoh
### 1) User
- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/` (admin)
- `GET /api/user/:id_user` (admin)
- `PUT /api/user/update/:email` (admin)
- `PUT /api/user/update-tipe-akun/:email` (admin)
- `PUT /api/user/change-username/:email`
- `PUT /api/user/change-password/:email`
- `DELETE /api/user/delete/:email`

Contoh login:
```
POST /api/user/login
Content-Type: application/json

{
  "email": "user@mail.com",
  "password": "password123"
}
```

Response:
```
{
  "message": "Berhasil login. Redirecting...",
  "data": {
    "token": "<JWT>",
    "user": {
      "id_user": "...",
      "username": "...",
      "email": "...",
      "tipe_akun": "user"
    }
  },
  "statusCode": 200
}
```

### 2) Acara (Organizer/Admin)
- `GET /api/acara/`
- `GET /api/acara/:id`
- `POST /api/acara/create`
- `PUT /api/acara/update/:id`
- `PUT /api/acara/update-judul/:id`
- `PUT /api/acara/update-lokasi/:id`
- `PUT /api/acara/update-tanggal/:id`
- `PUT /api/acara/update-maks-pengunjung/:id`
- `DELETE /api/acara/delete/:id`

Contoh create acara:
```
POST /api/acara/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "judul": "Acara Test",
  "lokasi": "Jalan Pisang",
  "tanggal_mulai": "2026-05-23 14:30:00",
  "tanggal_akhir": "2026-05-24 14:30:00",
  "maks_pengunjung": 10
}
```

Response:
```
{
  "message": "Acara berhasil dibuat",
  "data": {
    "id_acara": 1
  },
  "statusCode": 201
}
```

### 3) Acara Diikuti
- `GET /api/acara-ikuti/` (organizer/admin)
- `GET /api/acara-ikuti/user/:id_user`
- `GET /api/acara-ikuti/:id_acara_ikuti` (organizer/admin)
- `POST /api/acara-ikuti/create`
- `PUT /api/acara-ikuti/update/:id_acara_ikuti` (organizer/admin)
- `DELETE /api/acara-ikuti/delete/:id_acara_ikuti`

Contoh ikut acara:
```
POST /api/acara-ikuti/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_acara": 1,
  "tanggal_mulai": "2026-05-23 14:30:00",
  "tanggal_diikuti": "2026-05-23 15:00:00"
}
```

Response:
```
{
  "message": "Acara berhasil diikuti",
  "data": {
    "id_acara_ikuti": 1
  },
  "statusCode": 201
}
```

### 4) Acara Post
- `GET /api/acara-post/acara/:id_acara`
- `POST /api/acara-post/acara/:id_acara` (organizer/admin)
- `GET /api/acara-post/:id_post`
- `PUT /api/acara-post/:id_post` (owner/organizer/admin)
- `DELETE /api/acara-post/:id_post` (owner/organizer/admin)
- `GET /api/acara-post/:id_post/komentar`
- `POST /api/acara-post/:id_post/komentar`
- `PUT /api/acara-post/komentar/:id_komentar` (owner/organizer/admin)
- `DELETE /api/acara-post/komentar/:id_komentar` (owner/organizer/admin)

Contoh create post:
```
POST /api/acara-post/acara/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "judul": "Update teknis",
  "konten": "Venue pindah ke Aula Timur."
}
```

Response:
```
{
  "message": "Postingan berhasil dibuat",
  "data": {
    "id_post": 10
  },
  "statusCode": 201
}
```

Contoh create komentar:
```
POST /api/acara-post/10/komentar
Authorization: Bearer <token>
Content-Type: application/json

{
  "konten": "Siap, terima kasih infonya."
}
```

Response:
```
{
  "message": "Komentar berhasil dibuat",
  "data": {
    "id_komentar": 5
  },
  "statusCode": 201
}
```

### 5) Absensi
- `POST /api/absensi/create` (organizer/admin)
- `GET /api/absensi/acara/:id_acara` (organizer/admin)
- `GET /api/absensi/:id_absensi` (organizer/admin)
- `POST /api/absensi/:id_absensi/generate-link` (organizer/admin)
- `POST /api/absensi/:id_absensi/generate-qr` (organizer/admin)
- `GET /api/absensi/:id_absensi/logs` (organizer/admin)
- `POST /api/absensi/submit` (user/organizer/admin)

Contoh create absensi:
```
POST /api/absensi/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_acara": 1,
  "judul": "Sesi 1",
  "mulai_absen": "2026-05-23 09:00:00",
  "akhir_absen": "2026-05-23 10:00:00"
}
```

Response:
```
{
  "message": "Absensi berhasil dibuat",
  "data": {
    "id_absensi": 12,
    "id_detail_absensi": 24
  },
  "statusCode": 201
}
```

Contoh submit absensi:
```
POST /api/absensi/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "<token dari link/QR>",
  "keterangan": "hadir",
  "note": "datang tepat waktu"
}
```

Response:
```
{
  "message": "Absensi berhasil diisi",
  "data": {
    "id_absensi_log": 99
  },
  "statusCode": 201
}
```

## Alur Utama Sistem (User Flow)
1. User register dan login.
2. Organizer membuat acara.
3. User mengikuti acara via `acara_ikuti`.
4. Organizer membuat sesi absensi dan generate link/QR.
5. User submit absensi dengan token.
6. Organizer melihat log kehadiran.
7. Organizer membuat post di event; peserta memberi komentar.

## Panduan Menambah Fitur Baru
- Buat module database baru di `src/database/`.
- Buat router baru di `src/api/` dan map ke fungsi database.
- Daftarkan router di `src/server.js`.
- Gunakan transaksi untuk operasi write.
- Konsisten dengan format response: `message`, `data`, `statusCode`.
- Jangan ambil `id_user` dari request body jika sudah ada di JWT.

## Konvensi Coding
- Gunakan `async/await` dengan `try/catch`.
- Untuk insert/update/delete gunakan transaksi (begin/commit/rollback).
- Validasi input sederhana di awal handler.
- Gunakan status HTTP yang jelas (`400`, `401`, `403`, `404`, `409`, `500`).
- Logging error melalui `console.error`.

## Hal Penting untuk AI
- Ikuti pola `api/*` -> `database/*`.
- Jangan ubah struktur response tanpa kebutuhan kuat.
- Pastikan role guard sesuai dengan domain endpoint.
- Gunakan `req.user` untuk data user dari JWT.
- Hindari perubahan lintas file yang tidak relevan dengan fitur.
