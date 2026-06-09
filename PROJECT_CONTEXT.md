# AbsenYuk — Dokumentasi Proyek

## Ringkasan
AbsenYuk adalah platform manajemen acara dan absensi berbasis web. Dirancang untuk memudahkan penyelenggara acara (organizer) mengelola kehadiran peserta melalui sistem QR code terintegrasi. Setiap acara dapat berjalan efisien, transparan, dan paperless.

Dibangun sebagai tugas kuliah **Pemrograman Terstruktur**.

**3 Role pengguna:**
| Role | Akses |
|------|-------|
| `user` | Ikut acara, isi absensi via QR/link, forum diskusi |
| `organizer` | Buat/kelola acara, buat sesi absensi, generate QR, lihat log kehadiran |
| `admin` | Kelola semua user/acara/absensi, export data, preview role lain |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Vanilla HTML/CSS/JS — SPA-like multi-page, DM Sans font, beige warm palette |
| **Frontend server** | `npx serve` (dev, port 5000) / Express static (production) |
| **Backend** | **Express.js 5.2.1** (CommonJS) |
| **Database** | **MySQL / MariaDB** via `mysql2/promise` (Aiven cloud hosting) |
| **Auth** | **JWT** (`jsonwebtoken`) — token 7 hari, hashed **bcrypt** (10 rounds) |
| **QR Code** | `qrcode` — generate SVG untuk token absensi |
| **Export** | **ExcelJS** (XLSX) + **pdfmake** (PDF) |
| **Upload** | `multer 2.1.1` — avatar JPEG/PNG/WebP max 2MB |
| **Security** | `helmet` + `cors` |
| **Logging** | `morgan` (dev mode) |
| **Dev** | `nodemon` auto-restart |

---

## Struktur Proyek

```
AbsenYuk/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express entry: middleware, route, static serve
│   │   ├── api/                   # Route definitions
│   │   │   ├── user.js            # /api/user/*
│   │   │   ├── acara.js           # /api/acara/*
│   │   │   ├── acara_ikuti.js     # /api/acara-ikuti/*
│   │   │   ├── acara_post.js      # /api/acara-post/*
│   │   │   ├── absensi.js         # /api/absensi/*
│   │   │   ├── dashboard.js       # /api/dashboard/*
│   │   │   └── export.js          # /api/export/*
│   │   ├── database/              # Business logic + SQL queries
│   │   │   ├── db.js              # MySQL2 connection pool
│   │   │   ├── user.js            # CRUD + register/login
│   │   │   ├── acara.js           # CRUD + browse
│   │   │   ├── acara_ikuti.js     # Join/leave events
│   │   │   ├── acara_post.js      # Forum posts + comments
│   │   │   ├── absensi.js         # Attendance session + QR
│   │   │   ├── absensi_log.js     # Attendance log CRUD
│   │   │   ├── dashboard.js       # Summary queries
│   │   │   └── avatar.js          # Multer upload config
│   │   ├── middleware/
│   │   │   └── auth.js            # authenticateToken + authorizeRoles
│   │   └── utils/
│   │       ├── qrcode.js          # QR SVG generation
│   │       └── export.js          # Excel + PDF generation
│   ├── .env                       # DB_HOST, JWT_SECRET, APP_PORT, etc.
│   └── package.json
├── frontend/
│   ├── pages/
│   │   ├── homepage/              # Landing page
│   │   ├── about/                 # Tentang Kami
│   │   ├── features/              # Fitur
│   │   ├── login/                 # Login + Register forms
│   │   ├── dashboard/
│   │   │   ├── admin/             # 3 page: index, acara, user-manager
│   │   │   ├── organizer/         # 3 page: index, acara, acara-detail
│   │   │   ├── user/              # 3 page: index, acara-list, acara-saya
│   │   │   ├── absensi/           # 3 page: index, logs, isi
│   │   │   └── profile/           # 1 page: index
│   │   └── delete-account/
│   ├── scripts/                   # 16 JS modules
│   │   ├── config.js              # API endpoint URLs
│   │   ├── api.js                 # fetch wrapper + JWT injection
│   │   ├── shared.js              # Util: toast, formatDateTime, validasi
│   │   ├── dashboard.js           # Core: role routing, sidebar, init
│   │   └── ... (per-page logic)
│   └── styles/                    # 7 CSS files (DM Sans, beige palette)
│       ├── home.css               # 855 lines
│       ├── dashboard.css          # 1902 lines
│       └── ...
└── package.json                   # Monorepo root (dev:backend + serve:frontend)
```

---

## Database Schema

### ER Diagram (relasi)
```
tbl_user 1─┬─N tbl_acara                 (creator)
            ├─N tbl_acara_ikuti          (participant)
            ├─N tbl_absensi              (organizer)
            ├─N tbl_absensi_log          (attendee)
            ├─N tbl_acara_post           (author)
            └─N tbl_acara_post_komentar  (commenter)

tbl_acara 1─┬─N tbl_acara_ikuti
             ├─N tbl_absensi
             └─N tbl_acara_post

tbl_absensi 1─┬─N tbl_detail_absensi
               └─N tbl_absensi_log

tbl_acara_post 1─N tbl_acara_post_komentar
```

### Tabel

#### `tbl_user`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_user` | VARCHAR(12) PK | Random hex ID |
| `username` | VARCHAR | Nama pengguna |
| `email` | VARCHAR UNIQUE | Email (login identifier) |
| `password_hash` | VARCHAR | bcrypt hash |
| `tipe_akun` | ENUM | `'user'`, `'organizer'`, `'admin'` |

#### `tbl_acara`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_acara` | INT PK AUTO_INC | ID acara |
| `id_user` | VARCHAR FK | Creator (FK → tbl_user) |
| `judul` | VARCHAR | Judul acara |
| `lokasi` | VARCHAR | Lokasi |
| `tanggal_mulai` | DATETIME | Waktu mulai |
| `tanggal_akhir` | DATETIME | Waktu akhir |
| `maks_pengunjung` | INT | Kapasitas maksimum |
| `status` | ENUM | `'akan-datang'`, `'berlangsung'`, `'selesai'` |
| `dibuat_pada` | DATETIME | Timestamp dibuat |
| `diubah_pada` | DATETIME | Timestamp diubah |

#### `tbl_acara_ikuti`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_acara_ikuti` | INT PK AUTO_INC | ID registrasi |
| `id_acara` | INT FK | FK → tbl_acara |
| `id_user` | VARCHAR FK | FK → tbl_user |
| `tanggal_mulai` | DATETIME | Tanggal acara dimulai |
| `tanggal_diikuti` | DATETIME | Timestamp ikut |

#### `tbl_absensi`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_absensi` | INT PK AUTO_INC | ID sesi absensi |
| `id_acara` | INT FK | FK → tbl_acara |
| `id_user` | VARCHAR FK | Creator (organizer) |
| `judul` | VARCHAR | Judul sesi absensi |
| `status` | ENUM | `'pending'`, `'dimulai'`, `'berakhir'` |
| `dibuat_pada` | DATETIME | Timestamp |
| `diubah_pada` | DATETIME | Timestamp |

#### `tbl_detail_absensi`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_detail_absensi` | INT PK AUTO_INC | ID detail |
| `id_absensi` | INT FK | FK → tbl_absensi |
| `mulai_absen` | DATETIME | Window absensi mulai |
| `akhir_absen` | DATETIME | Window absensi akhir |
| `qr_token` | VARCHAR(64) | 64-char hex token |
| `qr_expires_at` | DATETIME | Token expiry |
| `status_qr` | ENUM | `'pending'`, `'active'`, `'expired'` |

#### `tbl_absensi_log`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_absensi_log` | INT PK AUTO_INC | ID log |
| `id_absensi` | INT FK | FK → tbl_absensi |
| `id_user` | VARCHAR FK | FK → tbl_user |
| `waktu_absen` | DATETIME | Waktu submit |
| `keterangan` | ENUM | `'hadir'`, `'sakit'`, `'izin'`, `'tanpa keterangan'` |
| `note` | TEXT | Catatan opsional |

#### `tbl_acara_post`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_post` | INT PK AUTO_INC | ID posting |
| `id_acara` | INT FK | FK → tbl_acara |
| `id_user` | VARCHAR FK | FK → tbl_user |
| `judul` | VARCHAR | Judul post |
| `konten` | TEXT | Isi post |
| `dibuat_pada` | DATETIME | Timestamp |
| `diubah_pada` | DATETIME | Timestamp |

#### `tbl_acara_post_komentar`
| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id_komentar` | INT PK AUTO_INC | ID komentar |
| `id_post` | INT FK | FK → tbl_acara_post |
| `id_user` | VARCHAR FK | FK → tbl_user |
| `konten` | TEXT | Isi komentar |
| `dibuat_pada` | DATETIME | Timestamp |
| `diubah_pada` | DATETIME | Timestamp |

---

## Semua API Endpoint

Base URL: `http://localhost:5143/api`

### User `/api/user`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| POST | `/register` | No | Public | Daftar user baru |
| POST | `/login` | No | Public | Login, dapat JWT |
| GET | `/` | Token | admin | List semua user (paginated, search) |
| GET | `/me/profile` | Token | Any | Profil user saat ini |
| GET | `/:id_user` | Token | admin | Detail user |
| PUT | `/update/:email` | Token | admin | Update lengkap user |
| PUT | `/update-tipe-akun/:email` | Token | admin | Ubah role user |
| PUT | `/change-username/:email` | Token | Any | Ubah username sendiri |
| PUT | `/change-password/:email` | Token | Any | Ubah password sendiri |
| PUT | `/change-avatar` | Token | Any | Upload foto profil |
| DELETE | `/delete/:email` | Token | Any | Hapus akun sendiri |
| GET | `/profile-picture/:id_user` | No | Public | Serve gambar avatar |

### Acara `/api/acara`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | Token | organizer,admin | List acara sendiri (paginated, filter status) |
| GET | `/browse` | Token | Any | Jelajahi acara yang bisa diikuti |
| GET | `/:id` | Token | Any | Detail acara + flag isOwner, isParticipant |
| POST | `/create` | Token | organizer,admin | Buat acara baru |
| PUT | `/update/:id` | Token | organizer,admin | Update lengkap acara |
| PUT | `/update-judul/:id` | Token | organizer,admin | Update judul saja |
| PUT | `/update-lokasi/:id` | Token | organizer,admin | Update lokasi saja |
| PUT | `/update-tanggal/:id` | Token | organizer,admin | Update tanggal saja |
| PUT | `/update-maks-pengunjung/:id` | Token | organizer,admin | Update kapasitas |
| PUT | `/update-status/:id` | Token | organizer,admin | Update status acara |
| DELETE | `/delete/:id` | Token | organizer,admin | Hapus acara (owner only) |

### Acara Ikuti `/api/acara-ikuti`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | Token | organizer,admin | List semua registrasi |
| GET | `/user/:id_user` | Token | Owner | List acara yang diikuti user |
| GET | `/:id_acara_ikuti` | Token | organizer,admin | Detail registrasi |
| POST | `/create` | Token | Any | Ikut acara |
| PUT | `/update/:id_acara_ikuti` | Token | organizer,admin | Update registrasi |
| DELETE | `/delete/:id_acara_ikuti` | Token | Any (owner) | Keluar dari acara |

### Acara Post (Forum) `/api/acara-post`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/acara/:id_acara` | Token | Participant/Organizer | List post forum |
| POST | `/acara/:id_acara` | Token | Organizer/Admin | Buat post |
| GET | `/:id_post` | Token | Participant/Organizer | Detail post |
| PUT | `/:id_post` | Token | Owner/Org/Admin | Edit post |
| DELETE | `/:id_post` | Token | Owner/Org/Admin | Hapus post + komentarnya |
| GET | `/:id_post/komentar` | Token | Participant/Organizer | List komentar |
| POST | `/:id_post/komentar` | Token | Participant/Org/Admin | Buat komentar |
| PUT | `/komentar/:id_komentar` | Token | Owner/Org/Admin | Edit komentar |
| DELETE | `/komentar/:id_komentar` | Token | Owner/Org/Admin | Hapus komentar |

### Absensi `/api/absensi`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| POST | `/create` | Token | organizer,admin | Buat sesi absensi |
| GET | `/acara/:id_acara` | Token | organizer,admin | List sesi absensi per acara (paginated) |
| GET | `/acara/:id_acara/logs` | Token | organizer,admin | Semua log absensi per acara |
| GET | `/token/:token` | Token | Any | Info absensi dari QR token |
| GET | `/:id_absensi` | Token | organizer,admin | Detail sesi absensi |
| POST | `/:id_absensi/generate-link` | Token | organizer,admin | Generate link absensi |
| POST | `/:id_absensi/generate-qr` | Token | organizer,admin | Generate QR code + link |
| GET | `/:id_absensi/logs` | Token | organizer,admin | Log absensi per sesi |
| DELETE | `/:id_absensi` | Token | organizer,admin | Hapus sesi + detail + log |
| DELETE | `/:id_absensi/log/:id_log` | Token | organizer,admin | Hapus 1 log entry |
| POST | `/submit` | Token | user,org,admin | Isi absensi via token QR |
| PUT | `/log/:id_log` | Token | organizer,admin | Update log entry |
| POST | `/log` | Token | organizer,admin | Tambah log manual |
| DELETE | `/log/:id_log` | Token | organizer,admin | Hapus log global |

### Dashboard `/api/dashboard`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/summary` | Token | admin | Statistik sistem (user, acara, absensi, tingkat kehadiran) |
| GET | `/organizer-summary` | Token | Any | Statistik organizer (acara, peserta, absensi) |

### Export `/api/export`
| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/users` | Token | admin | Export user → XLSX |
| GET | `/users/pdf` | Token | admin | Export user → PDF |
| GET | `/acara` | Token | admin | Export acara → XLSX |
| GET | `/acara/pdf` | Token | admin | Export acara → PDF |
| GET | `/absensi/:id_acara` | Token | admin | Export absensi → XLSX |
| GET | `/absensi/:id_acara/pdf` | Token | admin | Export absensi → PDF |
| GET | `/logs/:id_acara` | Token | admin | Export log → XLSX |
| GET | `/logs/:id_acara/pdf` | Token | admin | Export log → PDF |

---

## Halaman Frontend

### Publik (tanpa login)
| Path | File | Deskripsi |
|------|------|-----------|
| `/` | `homepage/index.html` | Landing page — hero, fitur, CTA |
| `/about` | `about/index.html` | Tentang AbsenYuk + tim pengembang |
| `/features` | `features/index.html` | Fitur-fitur platform |
| `/login` | `login/login.html` | Form login |
| `/register` | `login/register.html` | Form register + strength meter |
| `/absensi/isi` | `absensi/isi.html` | Form isi absensi (via QR/link) |

### Dashboard Admin
| Path | File | Deskripsi |
|------|------|-----------|
| `/dashboard/admin/index` | `admin/index.html` | Ringkasan sistem |
| `/dashboard/admin/acara` | `admin/acara.html` | Kelola acara semua user |
| `/dashboard/admin/user-manager` | `admin/user-manager.html` | CRUD user, role, export |

### Dashboard Organizer
| Path | File | Deskripsi |
|------|------|-----------|
| `/dashboard/organizer/index` | `organizer/index.html` | Ringkasan + agenda |
| `/dashboard/organizer/acara` | `organizer/acara.html` | List & buat acara |
| `/dashboard/organizer/acara-detail` | `organizer/acara-detail.html` | Detail acara + forum diskusi |

### Dashboard User
| Path | File | Deskripsi |
|------|------|-----------|
| `/dashboard/user/index` | `user/index.html` | Acara diikuti + status absensi |
| `/dashboard/user/acara-list` | `user/acara-list.html` | Jelajahi acara tersedia |
| `/dashboard/user/acara-saya` | `user/acara-saya.html` | Acara yang diikuti |

### Dashboard Absensi (shared: organizer & admin)
| Path | File | Deskripsi |
|------|------|-----------|
| `/dashboard/absensi/index` | `absensi/index.html` | Kelola sesi absensi, QR |
| `/dashboard/absensi/logs` | `absensi/logs.html` | Log kehadiran global |

### Profile (shared: semua role)
| Path | File | Deskripsi |
|------|------|-----------|
| `/dashboard/profile/index` | `profile/index.html` | Avatar, username, password, hapus akun |

---

## Script Frontend (16 file JS)

| File | Fungsi |
|------|--------|
| `config.js` | API_CONFIG — semua URL endpoint |
| `api.js` | fetch wrapper + JWT injection, auto-redirect 401 |
| `shared.js` | showToast, formatDateTime, formatTanggalLengkap, validasi |
| `navbar.js` | buildSidebar DOM builder |
| `dashboard.js` | **Core**: role routing, sidebar init, profile load, mobile sidebar |
| `dashboard-home.js` | Admin/Organizer/User summary rendering |
| `user-manager.js` | Admin: CRUD user, paginated, search, export |
| `acara-manager.js` | CRUD acara, status dropdown, paginated list |
| `absensi-manager.js` | CRUD absensi, QR modal, log viewer |
| `logs-manager.js` | Global log: filter, edit, add, paginated, export |
| `absensi-isi.js` | Form isi absensi via token QR |
| `forum.js` | Forum + komentar: post CRUD, comment CRUD |
| `profile.js` | Profil: avatar, username, password |
| `modal-factory.js` | Reusable modal: openModal, openConfirmModal |
| `home.js` | Homepage: hamburger, about section reveal animation |
| `login.js` / `register.js` | Form login/register logic |

---

## Alur Autentikasi

1. **Register** — `POST /api/user/register` → validasi email unik → bcrypt hash → insert `tbl_user`
2. **Login** — `POST /api/user/login` → cari email → bcrypt compare → generate JWT (`{ id_user, email, role }`, 7 hari, HS256)
3. **Token storage** — frontend simpan di `localStorage('authToken')`
4. **Setiap request** — `api.js` inject `Authorization: Bearer <token>` via fetch header
5. **Middleware backend** — `authenticateToken` verify JWT → inject `req.user` → `authorizeRoles()` cek role
6. **Expired/Invalid** — 401 response → `api.js` clear storage → redirect login

---

## Cara Menjalankan

```bash
# Development
cd backend
npm install
npm run dev        # nodemon, port dari .env (default 5143)

cd frontend
npm run serve      # npx serve, port 5000

# Production
cd backend
npm start          # Express serve static frontend + API di port yang sama
```

---

> Dokumen ini dibuat untuk NotebookLM agar dapat menjawab pertanyaan tentang arsitektur, tech stack, database, API, dan struktur proyek AbsenYuk secara menyeluruh.
