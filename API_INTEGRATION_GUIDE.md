# Dokumentasi Integrasi API Login & Register

## Ringkasan Perubahan

Form login dan register telah diintegrasikan dengan API backend. Semua request sekarang dikirim ke server Node.js pada port 3000.

---

## 📋 File yang Diubah

### 1. **frontend/scripts/config.js** (BARU)
- Konfigurasi terpusat untuk endpoint API
- Memudahkan perubahan base URL jika diperlukan
- Endpoint yang dikonfigurasi:
  - `/api/user/login` - Login user
  - `/api/user/register` - Register user baru

### 2. **frontend/scripts/login.js**
**Perubahan:**
- Mengganti setTimeout simulasi dengan fetch request sebenarnya
- Mengirim POST request ke `POST /api/user/login`
- Payload: `{ email, password }`
- Handling response:
  - ✅ **200 OK**: Login sukses → redirect ke homepage
  - ❌ **404 Not Found**: Email belum terdaftar
  - ❌ **401 Unauthorized**: Email atau password salah
  - ❌ **Error koneksi**: Menampilkan pesan bahwa server tidak terjangkau

### 3. **frontend/scripts/register.js**
**Perubahan:**
- Mengganti setTimeout simulasi dengan fetch request sebenarnya
- Mengirim POST request ke `POST /api/user/register`
- Payload: `{ username, email, password }`
- Handling response:
  - ✅ **201 Created**: Register sukses → redirect ke login
  - ❌ **409 Conflict**: Email sudah terdaftar
  - ❌ **400 Bad Request**: Ada field yang kosong
  - ❌ **Error koneksi**: Menampilkan pesan bahwa server tidak terjangkau

### 4. **frontend/pages/login/login.html**
- Menambahkan `<script src="../../scripts/config.js"></script>` sebelum script login

### 5. **frontend/pages/login/register.html**
- Menambahkan `<script src="../../scripts/config.js"></script>` sebelum script register

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js terinstall
- MySQL database sudah disetup dengan tabel `tbl_user`
- Package dependencies sudah diinstall (`npm install` di folder backend)

### Langkah 1: Jalankan Backend Server
```bash
cd backend
npm start
# Server akan berjalan pada http://localhost:3000
```

### Langkah 2: Buka Frontend di Browser
```
file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/GitHub/AbsenYuk/frontend/pages/login/login.html
```

---

## 📊 Flow Diagram

### Register Flow
```
User Input Form
    ↓
Client-side Validation
    ↓
POST /api/user/register
    ├─ 201 Created → Success Toast → Redirect ke Login
    ├─ 409 Conflict → Error Toast (email sudah ada)
    ├─ 400 Bad Request → Error Toast (field kosong)
    └─ Network Error → Error Toast (server tidak terjangkau)
```

### Login Flow
```
User Input Form
    ↓
Client-side Validation
    ↓
POST /api/user/login
    ├─ 200 OK → Success Toast → Redirect ke Homepage
    ├─ 404 Not Found → Error Toast (email belum terdaftar)
    ├─ 401 Unauthorized → Error Toast (kredensial salah)
    └─ Network Error → Error Toast (server tidak terjangkau)
```

---

## 🧪 Testing

### Test Case 1: Register User Baru
1. Buka register.html
2. Input:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
3. Klik Register
4. **Expected**: Toast berhasil + redirect ke login

### Test Case 2: Register Email Duplikat
1. Buka register.html
2. Input email yang sudah ada sebelumnya
3. Klik Register
4. **Expected**: Toast error "Email sudah terdaftar"

### Test Case 3: Login Berhasil
1. Buka login.html
2. Input email dan password user yang sudah terdaftar
3. Klik Login
4. **Expected**: Toast berhasil + redirect ke homepage

### Test Case 4: Login Email Tidak Terdaftar
1. Buka login.html
2. Input email yang tidak terdaftar
3. Klik Login
4. **Expected**: Toast error "Email belum terdaftar"

### Test Case 5: Login Password Salah
1. Buka login.html
2. Input email yang benar tapi password salah
3. Klik Login
4. **Expected**: Toast error "Email atau password salah"

---

## ⚙️ Konfigurasi API

Jika ingin mengubah base URL API, edit file `frontend/scripts/config.js`:

```javascript
const API_CONFIG = {
  // Ubah URL ini jika server backend berada di host/port berbeda
  API_BASE_URL: 'http://localhost:3000/api', // ← Ubah di sini
  // ... rest of config
};
```

### Contoh Konfigurasi untuk Production
```javascript
API_BASE_URL: 'https://api.yourdomain.com/api'
```

---

## 🔍 Debugging

### Jika form tidak merespons saat submit:
1. **Buka Developer Tools** (F12)
2. **Tab Network**: Cek apakah request terkirim dan response-nya apa
3. **Tab Console**: Cek apakah ada error JavaScript

### Pesan Error Umum

| Error | Penyebab | Solusi |
|-------|---------|--------|
| "Gagal terhubung ke server" | Backend tidak running | Jalankan `npm start` di folder backend |
| "Email sudah terdaftar" | Email sudah digunakan | Gunakan email berbeda |
| "Email atau password salah" | Kredensial tidak valid | Cek kembali email dan password |
| "Semua field harus diisi" | Ada field kosong | Pastikan semua field terisi |

---

## 📝 Catatan Tambahan

- Password sudah di-hash di backend menggunakan bcrypt
- Session storage digunakan untuk menyimpan email user setelah login (dapat dikembangkan menjadi JWT token)
- CORS sudah dikonfigurasi di backend (menggunakan middleware `cors()`)
- Semua error handling sudah dilakukan di frontend dan backend

---

## 📌 TODO untuk Pengembangan Selanjutnya

- [ ] Implementasi JWT token untuk session management
- [ ] Tambahkan "Remember Me" checkbox di login form
- [ ] Implementasi "Forgot Password" feature
- [ ] Validasi email uniqueness saat register (real-time)
- [ ] Implementasi refresh token
- [ ] Tambahkan HTTPS untuk production
- [ ] Rate limiting untuk login attempts

