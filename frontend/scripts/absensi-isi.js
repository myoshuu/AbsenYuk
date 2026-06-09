'use strict';

const STATUS_LABELS = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  izin: 'Izin',
  'tanpa keterangan': 'Tanpa Keterangan'
};

const $ = (s) => document.querySelector(s);

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getUserName() {
  try {
    const raw = localStorage.getItem('authUser');
    if (!raw) return '-';
    const user = JSON.parse(raw);
    return user.username || user.email || '-';
  } catch (_) {
    return '-';
  }
}

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (_) {
    return '-';
  }
}

function buildPagesUrl(relativePath) {
  const path = window.location.pathname.replace(/\\/g, '/');
  const marker = '/pages/';
  const idx = path.indexOf(marker);
  if (idx === -1) {
    return '/pages/' + relativePath;
  }
  return path.slice(0, idx + marker.length) + relativePath;
}

function showAlert(message, type) {
  const el = document.getElementById('isiAlert');
  el.textContent = message;
  el.className = 'isi-alert isi-alert-' + type;
  el.style.display = 'block';
}

function hideAlert() {
  document.getElementById('isiAlert').style.display = 'none';
}

function showLoading(text) {
  document.getElementById('isiTitle').textContent = 'Memuat...';
  document.getElementById('isiSubtitle').textContent = text || 'Mohon tunggu sebentar';
  document.getElementById('isiContent').style.display = 'none';
  document.getElementById('isiInfo').style.display = 'none';
  document.getElementById('isiForm').style.display = 'none';
}

function showSuccess() {
  document.getElementById('isiTitle').textContent = 'Absensi Tercatat!';
  document.getElementById('isiSubtitle').textContent = 'Terima kasih, kehadiran Anda telah dicatat.';
  document.getElementById('isiContent').style.display = 'none';
  document.getElementById('isiInfo').style.display = 'grid';
  document.getElementById('isiForm').style.display = 'none';
  showAlert('Kehadiran Anda berhasil dicatat.', 'success');
}

function showAlreadySubmitted(info) {
  document.getElementById('isiTitle').textContent = 'Sudah Absen';
  document.getElementById('isiSubtitle').textContent = 'Anda sudah mengisi absensi ini sebelumnya.';
  document.getElementById('isiContent').style.display = 'block';

  const infoEl = document.getElementById('isiInfo');
  infoEl.style.display = 'grid';
  document.getElementById('isiUsername').textContent = info.username || '-';
  document.getElementById('isiAcara').textContent = info.judul_acara || '-';
  document.getElementById('isiBerakhir').textContent = info.akhir_absen || '-';

  document.getElementById('isiForm').style.display = 'none';
  showAlert('Anda sudah mengisi absensi ini. Tidak dapat mengisi ulang.', 'warning');
}

function showExpired() {
  document.getElementById('isiTitle').textContent = 'Absensi Berakhir';
  document.getElementById('isiSubtitle').textContent = 'Sesi absensi ini sudah tidak berlaku.';
  document.getElementById('isiContent').style.display = 'none';
  showAlert('Maaf, sesi absensi ini sudah berakhir atau token tidak valid.', 'error');
}

async function initIsiAbsensi() {
  const token = getQueryParam('token');
  if (!token) {
    showLoading('Token tidak ditemukan');
    showAlert('Link absensi tidak valid. Pastikan Anda menggunakan link yang benar.', 'error');
    return;
  }

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = buildPagesUrl('login/login.html?redirect=' + returnUrl);
    return;
  }

  showLoading('Memuat data absensi...');

  try {
    const response = await fetch(API_CONFIG.getAbsensiByTokenUrl(token), {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + authToken }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 410 || response.status === 404) {
        showExpired();
        return;
      }
      throw new Error(data.message || 'Gagal memuat data absensi.');
    }

    const info = data.data || {};
    const statusQr = info.status_qr;
    const statusAbsensi = info.status_absensi;

    if (statusQr === 'expired' || statusAbsensi === 'berakhir') {
      showExpired();
      return;
    }

    if (statusQr === 'pending') {
      showAlert('Absensi ini belum dimulai oleh penyelenggara.', 'info');
      return;
    }

    if (info.sudah_absen) {
      info.username = getUserName();
      showAlreadySubmitted(info);
      return;
    }

    info.username = getUserName();

    document.getElementById('isiContent').style.display = 'block';
    document.getElementById('isiInfo').style.display = 'grid';
    document.getElementById('isiUsername').textContent = info.username || '-';
    document.getElementById('isiAcara').textContent = info.judul_acara || '-';
    document.getElementById('isiBerakhir').textContent = formatTanggal(info.akhir_absen);

    document.getElementById('isiForm').style.display = 'block';
    document.getElementById('isiTitle').textContent = info.judul_absensi || 'Isi Absensi';
    document.getElementById('isiSubtitle').textContent = 'Pilih status kehadiran Anda';

  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Terjadi kesalahan.', 'error');
  }
}

function setupForm() {
  const options = document.querySelectorAll('.isi-status-option');
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });

  document.getElementById('isiSubmit').addEventListener('click', async () => {
    const selected = document.querySelector('input[name="keterangan"]:checked');
    if (!selected) {
      showAlert('Silakan pilih status kehadiran terlebih dahulu.', 'error');
      return;
    }

    const submitBtn = document.getElementById('isiSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
    hideAlert();

    const token = getQueryParam('token');
    const authToken = localStorage.getItem('authToken');

    try {
      const response = await fetch(API_CONFIG.getSubmitAbsensiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + authToken
        },
        body: JSON.stringify({
          token: token,
          keterangan: selected.value,
          note: document.getElementById('isiNote').value.trim() || null
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Gagal mengirim absensi.');

      showSuccess();
    } catch (err) {
      showAlert(err.message || 'Terjadi kesalahan.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Absensi';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIsiAbsensi();
  setupForm();
});
