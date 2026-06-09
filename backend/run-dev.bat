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

REM Instal dependensi terbaru
echo Menginstal paket yang diperlukan...
call npm install
if errorlevel 1 (
  echo Instalasi paket gagal.
  set "EXIT_CODE=1"
  goto end
)

echo Menjalankan aplikasi...

call npm run dev

:end
echo(
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
endlocal
exit /b %EXIT_CODE%
