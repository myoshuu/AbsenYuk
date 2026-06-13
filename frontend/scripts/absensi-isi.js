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
    const data = await api.get(API_CONFIG.getAbsensiByTokenUrl(token));
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
    document.getElementById('isiBerakhir').textContent = formatTanggalLengkap(info.akhir_absen);

    document.getElementById('isiForm').style.display = 'block';
    document.getElementById('isiTitle').textContent = info.judul_absensi || 'Isi Absensi';
    document.getElementById('isiSubtitle').textContent = 'Pilih status kehadiran Anda';

  } catch (err) {
    console.error(err);

    // Handle error codes
    if (err.errorCode === API_ERROR_CODES.RESOURCE_EXPIRED || err.status === 410) {
      showExpired();
      return;
    }
    if (err.errorCode === API_ERROR_CODES.RESOURCE_NOT_FOUND || err.status === 404) {
      showExpired();
      return;
    }
    if (err.errorCode === API_ERROR_CODES.AUTH_TOKEN_INVALID || err.status === 401) {
      showAlert('Sesi berakhir. Silakan login ulang.', 'error');
      setTimeout(() => {
        window.location.href = buildPagesUrl('login/login.html');
      }, 2000);
      return;
    }

    showAlert(err.message || 'Terjadi kesalahan.', 'error');
  }
}

function setupForm() {
  const options = document.querySelectorAll('.isi-status-option');
  const optionIds = ['optHadir', 'optSakit', 'optIzin', 'optTanpa'];

  function selectOption(selectedOpt) {
    options.forEach((o) => {
      o.classList.remove('is-selected');
      o.setAttribute('aria-checked', 'false');
      o.setAttribute('tabindex', '-1');
    });
    selectedOpt.classList.add('is-selected');
    selectedOpt.setAttribute('aria-checked', 'true');
    selectedOpt.setAttribute('tabindex', '0');
    selectedOpt.querySelector('input[type="radio"]').checked = true;
  }

  function handleKeyDown(e, currentIndex) {
    let newIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % options.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + options.length) % options.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = options.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const currentOpt = options[currentIndex];
        selectOption(currentOpt);
        return;
      default:
        return;
    }

    const newOpt = options[newIndex];
    selectOption(newOpt);
    newOpt.focus();
  }

  options.forEach((opt, index) => {
    // Click handler
    opt.addEventListener('click', () => {
      selectOption(opt);
    });

    // Keyboard handler
    opt.addEventListener('keydown', (e) => {
      const currentIndex = Array.from(options).indexOf(document.activeElement);
      if (currentIndex === -1) return;
      handleKeyDown(e, currentIndex);
    });

    // Focus/blur for visual feedback
    opt.addEventListener('focus', () => {
      if (!opt.classList.contains('is-selected')) {
        opt.style.outline = '2px solid var(--ink)';
        opt.style.outlineOffset = '2px';
      }
    });
    opt.addEventListener('blur', () => {
      opt.style.outline = 'none';
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

    try {
      await api.post(API_CONFIG.getSubmitAbsensiUrl(), {
        token: token,
        keterangan: selected.value,
        note: document.getElementById('isiNote').value.trim() || null
      });

      showSuccess();
    } catch (err) {
      // Handle specific error codes
      if (err.errorCode === API_ERROR_CODES.RESOURCE_EXPIRED || err.status === 410) {
        showExpired();
        return;
      }
      if (err.errorCode === API_ERROR_CODES.BUSINESS_ATTENDANCE_ALREADY_SUBMITTED || err.status === 409) {
        showAlert('Anda sudah mengisi absensi ini. Tidak dapat mengisi ulang.', 'warning');
      } else if (err.errorCode === API_ERROR_CODES.BUSINESS_ATTENDANCE_CLOSED) {
        showAlert('Maaf, sesi absensi ini sudah ditutup.', 'error');
      } else if (err.errorCode === API_ERROR_CODES.AUTH_TOKEN_INVALID || err.status === 401) {
        showAlert('Sesi berakhir. Silakan login ulang.', 'error');
        setTimeout(() => {
          window.location.href = buildPagesUrl('login/login.html');
        }, 2000);
      } else {
        showAlert(err.message || 'Terjadi kesalahan.', 'error');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Absensi';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIsiAbsensi();
  setupForm();
});
