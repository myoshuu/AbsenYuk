README Backend — AbsenYuk

Ringkas
Backend Node.js + Express untuk manajemen user, acara, langganan acara (acara_ikuti), dan absensi. API memakai JWT untuk autentikasi dan role-based access.

Prasyarat
- Node.js 18+ (disarankan LTS)
- MySQL/MariaDB
- Database berisi tabel: tbl_user, tbl_acara, tbl_acara_ikuti, tbl_absensi, tbl_detail_absensi, tbl_absensi_log

Konfigurasi Environment
Buat file .env di folder backend dengan contoh berikut:
isikan sesuai dengan keperluan
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

Cara Menjalankan
1) Install dependency
```
npm install
```

2) Jalankan server
```
npm run dev
```

Atau gunakan mode produksi:
```
npm start
```

Server akan berjalan di:
```
http://localhost:3000
```

Autentikasi
- Login akan mengembalikan JWT.
- Kirim token pada header:
```
Authorization: Bearer <token>
```

Contoh Login
```
POST /api/user/login
Content-Type: application/json

{
	"email": "user@mail.com",
	"password": "password123"
}
```

Response sukses:
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

Catatan Keamanan
`id_user` selalu diambil dari token di backend. Client tidak perlu (dan tidak boleh) mengirim `id_user` untuk endpoint yang terproteksi.

Daftar API Utama

1) User
- POST /api/user/register
- POST /api/user/login
- GET /api/user/ (admin)
- GET /api/user/:id_user (admin)
- PUT /api/user/update/:email (admin)
- PUT /api/user/update-tipe-akun/:email (admin)
- PUT /api/user/change-username/:email
- PUT /api/user/change-password/:email
- DELETE /api/user/delete/:email

2) Acara (Organizer/Admin)
- GET /api/acara/
- GET /api/acara/:id
- POST /api/acara/create
- PUT /api/acara/update/:id
- PUT /api/acara/update-judul/:id
- PUT /api/acara/update-lokasi/:id
- PUT /api/acara/update-tanggal/:id
- PUT /api/acara/update-maks-pengunjung/:id
- DELETE /api/acara/delete/:id

3) Acara Diikuti
- GET /api/acara-ikuti/
- GET /api/acara-ikuti/user/:id_user
- GET /api/acara-ikuti/:id_acara_ikuti
- POST /api/acara-ikuti/create
- PUT /api/acara-ikuti/update/:id_acara_ikuti
- DELETE /api/acara-ikuti/delete/:id_acara_ikuti

4) Absensi
- POST /api/absensi/create (organizer/admin)
- GET /api/absensi/acara/:id_acara (organizer/admin)
- GET /api/absensi/:id_absensi (organizer/admin)
- POST /api/absensi/:id_absensi/generate-link (organizer/admin)
- POST /api/absensi/:id_absensi/generate-qr (organizer/admin)
- GET /api/absensi/:id_absensi/logs (organizer/admin)
- POST /api/absensi/submit (user/organizer/admin)

Contoh Alur Absensi

1) Organizer membuat absensi
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

2) Organizer generate link absensi
```
POST /api/absensi/123/generate-link
Authorization: Bearer <token>
```

Response:
```
{
	"data": {
		"token": "...",
		"qr_expires_at": "...",
		"link_url": "http://localhost:3000/absensi/isi?token=..."
	}
}
```

3) Organizer generate QR (opsional)
```
POST /api/absensi/123/generate-qr
Authorization: Bearer <token>
```

Response:
```
{
	"data": {
		"token": "...",
		"qr_expires_at": "...",
		"qr_link": "http://localhost:3000/absensi/isi?token=...",
		"qr_payload": "http://localhost:3000/absensi/isi?token=...",
		"qr_svg": "<svg ...>" 
	}
}
```

Catatan QR:
- `qr_svg` bisa null jika generator SVG di server tidak tersedia.
- Gunakan `qr_payload` di frontend untuk render QR dengan easyqrcodejs di browser.

4) User mengisi absensi
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

5) Organizer cek siapa yang sudah mengisi
```
GET /api/absensi/123/logs
Authorization: Bearer <token>
```

Keterangan Status
- tbl_absensi.status: pending | dimulai | berakhir
- tbl_detail_absensi.status_qr: pending | active | expired

Troubleshooting
- 401/403: token tidak valid atau role tidak sesuai.
- 404: data tidak ditemukan atau bukan milik user.
- 409: user sudah mengisi absensi.
