@echo off
setlocal
set "EXIT_CODE=0"

REM Cek Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js tidak ditemukan. Silakan instal Node.js terlebih dahulu.
  echo Unduh: https://nodejs.org/
  set "EXIT_CODE=1"
  goto end
)

REM Cek npm
where npm >nul 2>&1
if errorlevel 1 (
  echo npm tidak ditemukan. Silakan instal Node.js ^(npm ikut terpasang^).
  echo Unduh: https://nodejs.org/
  set "EXIT_CODE=1"
  goto end
)

echo Node.js dan npm terdeteksi.

REM Instal dependensi jika belum ada
if not exist node_modules (
  echo Menginstal paket yang diperlukan...
  npm install
  if errorlevel 1 (
    echo Instalasi paket gagal.
    set "EXIT_CODE=1"
    goto end
  )
) else (
  echo Dependensi sudah terpasang.
)

echo Menjalankan aplikasi...

npm run dev

:end
echo(
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
endlocal
exit /b %EXIT_CODE%
