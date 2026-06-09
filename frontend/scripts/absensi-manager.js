'use strict';

const ABSENSI_STATUS_LABEL = {
  pending: 'Menunggu',
  dimulai: 'Dimulai',
  berakhir: 'Berakhir'
};

const ABSENSI_QR_STATUS_LABEL = {
  pending: 'Belum Aktif',
  active: 'Aktif',
  expired: 'Kadaluarsa'
};

function buildAbsensiCard(absensi, index) {
  const status = absensi.status || 'pending';
  const statusText = ABSENSI_STATUS_LABEL[status] || status;
  const qrStatus = absensi.status_qr || 'pending';
  const qrText = ABSENSI_QR_STATUS_LABEL[qrStatus] || qrStatus;

  const card = document.createElement('div');
  card.className = 'card absensi-card';
  card.dataset.id = absensi.id_absensi || '';

  card.innerHTML = `
    <div class="absensi-num">${index}</div>
    <div class="absensi-main">
      <div class="absensi-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M9 12l2 2 4-4" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
      </div>
      <div class="absensi-meta">
        <p class="absensi-title">${absensi.judul || 'Tanpa Judul'}</p>
        <p class="absensi-date">${formatDateTime(absensi.mulai_absen)} &ndash; ${formatDateTime(absensi.akhir_absen)}</p>
      </div>
    </div>
    <div class="absensi-detail">
      <div class="absensi-badges">
        <span class="absensi-status-badge absensi-status-${status}">${statusText}</span>
        <span class="absensi-qr-badge absensi-qr-${qrStatus}">QR: ${qrText}</span>
      </div>
    </div>
    <div class="absensi-actions user-actions">
      <button class="icon-btn" type="button"
              data-absensi-action="qr"
              data-id="${absensi.id_absensi || ''}"
              aria-label="Generate QR">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <path d="M10 3v18M3 10h18" stroke-dasharray="2 2" />
        </svg>
      </button>
      <button class="icon-btn" type="button"
              data-absensi-action="logs"
              data-id="${absensi.id_absensi || ''}"
              aria-label="Lihat log absensi">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h12" />
        </svg>
      </button>
      <button class="icon-btn danger" type="button"
              data-absensi-action="delete"
              data-id="${absensi.id_absensi || ''}"
              aria-label="Hapus absensi">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M10 10v6M14 10v6" />
        </svg>
      </button>
    </div>
  `;

  return card;
}

function openCreateAbsensiModal(acaraList, onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const acaraOptions = acaraList.map((a) =>
    `<option value="${a.id_acara}">${a.judul}</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat absensi baru">
      <div class="modal-header">
        <h2 class="modal-title">Buat Absensi Baru</h2>
        <p class="modal-subtitle">Isi detail sesi absensi untuk acara yang dipilih.</p>
      </div>
      <form class="modal-form" id="createAbsensiForm">
        <div class="modal-field">
          <label class="modal-label" for="ca_acara">Acara</label>
          <select class="modal-select" id="ca_acara" name="id_acara" required>
            <option value="">-- Pilih Acara --</option>
            ${acaraOptions}
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_judul">Judul Absensi</label>
          <input class="modal-input" id="ca_judul" name="judul" type="text" placeholder="Contoh: Sesi 1" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_mulai">Mulai Absen</label>
          <input class="modal-input" id="ca_mulai" name="mulai_absen" type="datetime-local" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_akhir">Akhir Absen</label>
          <input class="modal-input" id="ca_akhir" name="akhir_absen" type="datetime-local" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Buat Absensi</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#createAbsensiForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;

    if (new Date(f.akhir_absen.value) <= new Date(f.mulai_absen.value)) {
      showToast('Akhir absen harus setelah mulai absen.', 'error');
      return;
    }

    const payload = {
      id_acara: Number(f.id_acara.value),
      judul: f.judul.value.trim(),
      mulai_absen: f.mulai_absen.value.replace('T', ' ') + ':00',
      akhir_absen: f.akhir_absen.value.replace('T', ' ') + ':00'
    };

    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

function openAbsensiQrModal(qrData) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="QR Code Absensi">
      <div class="modal-header">
        <h2 class="modal-title">QR Code Absensi</h2>
        <p class="modal-subtitle">Scan QR atau bagikan link ke peserta.</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:18px 0">
        <div class="qr-wrapper" style="width:200px;height:200px;border:2px solid var(--border);border-radius:16px;display:flex;align-items:center;justify-content:center;background:#ffffff;padding:12px">
          ${qrData.qr_svg || '<p style="color:var(--muted);font-size:0.85rem">QR tidak tersedia</p>'}
        </div>
        <div style="width:100%;display:grid;gap:8px">
          <label class="modal-label" style="text-align:center;color:var(--muted)">Link Absensi</label>
          <div style="display:flex;gap:8px">
            <input class="modal-input" id="qrLinkInput" type="text" value="${qrData.qr_link || ''}" readonly
                   style="flex:1;font-size:0.82rem" />
            <button class="modal-btn primary" type="button" id="qrCopyBtn">Salin</button>
          </div>
          <p style="text-align:center;font-size:0.8rem;color:var(--muted)">
            ${qrData.qr_expires_at ? 'Berlaku hingga: ' + formatDateTime(qrData.qr_expires_at) : ''}
          </p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Tutup</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  const copyBtn = overlay.querySelector('#qrCopyBtn');
  const linkInput = overlay.querySelector('#qrLinkInput');
  if (copyBtn && linkInput) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(linkInput.value);
        copyBtn.textContent = 'Tersalin!';
        setTimeout(() => { copyBtn.textContent = 'Salin'; }, 2000);
      } catch (_) {
        linkInput.select();
        linkInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        copyBtn.textContent = 'Tersalin!';
        setTimeout(() => { copyBtn.textContent = 'Salin'; }, 2000);
      }
    });
  }
}

function openAbsensiLogModal(logs, judul, id_absensi, token) {
  if (document.querySelector('.modal-overlay')) return;

  const logRows = (logs || []).map((log, i) => {
    const ket = log.keterangan || '-';
    const logId = log.id_absensi_log || '';
    return `
      <tr data-log-id="${logId}">
        <td>${i + 1}</td>
        <td>${log.username || log.id_user || '-'}</td>
        <td><span class="absensi-log-status absensi-log-${ket}">${ket.charAt(0).toUpperCase() + ket.slice(1)}</span></td>
        <td>${log.note || '-'}</td>
        <td>${formatDateTime(log.waktu_absen)}</td>
        <td>
          <button class="absensi-log-delete" type="button"
                  data-log-delete="${logId}"
                  title="Hapus log absensi"
                  aria-label="Hapus log absensi">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M10 10v6M14 10v6" />
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">Belum ada data absensi.</td></tr>';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card modal-card-wide" role="dialog" aria-modal="true" aria-label="Log absensi">
      <div class="modal-header">
        <h2 class="modal-title">Log Absensi</h2>
        <p class="modal-subtitle">${judul || ''}</p>
      </div>
      <div style="overflow-x:auto;padding:4px 0">
        <table class="absensi-log-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Peserta</th>
              <th>Status</th>
              <th>Catatan</th>
              <th>Waktu</th>
              <th style="width:48px">Aksi</th>
            </tr>
          </thead>
          <tbody>${logRows}</tbody>
        </table>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Tutup</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelectorAll('[data-log-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const logId = btn.dataset.logDelete;
      if (!logId || !id_absensi || !token) return;

      if (!await openConfirmModal('Hapus log absensi ini?')) return;

      try {
        await api.del(API_CONFIG.getDeleteAbsensiLogUrl(id_absensi, logId));
        showToast('Log absensi berhasil dihapus.', 'success');

        const row = overlay.querySelector(`tr[data-log-id="${logId}"]`);
        if (row) row.remove();
        const remaining = overlay.querySelectorAll('tbody tr').length;
        if (remaining === 0) {
          overlay.querySelector('tbody').innerHTML =
            '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">Belum ada data absensi.</td></tr>';
        }
      } catch (err) {
        showToast(err.message || 'Gagal menghapus log.', 'error');
      }
    });
  });
}

async function initAbsensi(actualRole, token) {
  const listEl = document.getElementById('absensiList');
  const emptyEl = document.getElementById('absensiEmpty');
  const acaraSelect = document.getElementById('absensiAcaraSelect');
  const createBtn = document.getElementById('absensiCreateBtn');

  if (!listEl || !emptyEl || !acaraSelect) return;

  let acaraList = [];
  let absensiList = [];
  let selectedAcaraId = '';

  function setEmpty(message, show) {
    emptyEl.textContent = message;
    emptyEl.classList.toggle('is-visible', show);
  }

  function renderList() {
    listEl.innerHTML = '';

    if (!selectedAcaraId) {
      setEmpty('Pilih acara terlebih dahulu.', true);
      return;
    }

    if (absensiList.length === 0) {
      setEmpty('Belum ada sesi absensi untuk acara ini.', true);
      return;
    }

    setEmpty('', false);
    absensiList.forEach((absensi, i) => {
      listEl.appendChild(buildAbsensiCard(absensi, i + 1));
    });
  }

  async function loadAbsensi(acaraId) {
    try {
      setEmpty('Memuat data absensi...', true);
      try {
        const data = await api.get(API_CONFIG.getAbsensiByAcaraUrl(acaraId));
        absensiList = Array.isArray(data.data) ? data.data : [];
      } catch (err) {
        if (err.status === 404) {
          absensiList = [];
        } else {
          throw err;
        }
      }
      renderList();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memuat data absensi.', 'error');
      absensiList = [];
      renderList();
    }
  }

  async function loadAcara() {
    try {
      const data = await api.get(API_CONFIG.getAcaraUrl());
      acaraList = Array.isArray(data.data) ? data.data : [];

      acaraSelect.innerHTML = '<option value="">-- Pilih Acara --</option>';
      acaraList.forEach((a) => {
        const opt = document.createElement('option');
        opt.value = a.id_acara;
        opt.textContent = a.judul;
        acaraSelect.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat daftar acara.', 'error');
    }
  }

  acaraSelect.addEventListener('change', () => {
    selectedAcaraId = acaraSelect.value;
    if (selectedAcaraId) {
      loadAbsensi(selectedAcaraId);
    } else {
      absensiList = [];
      renderList();
    }
  });

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      if (acaraList.length === 0) {
        showToast('Tidak ada acara tersedia.', 'info');
        return;
      }
      openCreateAbsensiModal(acaraList, async (payload, close) => {
        try {
          await api.post(API_CONFIG.getCreateAbsensiUrl(), payload);
          showToast('Absensi berhasil dibuat.', 'success');
          close();
          loadAbsensi(selectedAcaraId);
        } catch (err) {
          showToast(err.message || 'Gagal membuat absensi.', 'error');
        }
      });
    });
  }

  const absensiExportBtn = document.getElementById('absensiExportBtn');
  if (absensiExportBtn) {
    const updateAbsensiExportState = () => {
      absensiExportBtn.disabled = !selectedAcaraId;
    };
    updateAbsensiExportState();
    absensiExportBtn.addEventListener('click', (e) => {
      if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
      e.stopPropagation();
      const menu = absensiExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    absensiExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
        const format = opt.dataset.format;
        const filename = format === 'pdf' ? 'absensi.pdf' : 'absensi.xlsx';
        downloadExport(API_CONFIG.getExportAbsensiUrl(selectedAcaraId, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
    acaraSelect.addEventListener('change', updateAbsensiExportState);
  }

  /* ── Event: aksi pada card ── */
  listEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-absensi-action]');
    if (!btn) return;

    const action = btn.dataset.absensiAction;
    const id = btn.dataset.id;
    const absensi = absensiList.find((a) => String(a.id_absensi) === String(id));

    try {
      if (action === 'qr') {
        if (!absensi || absensi.status_qr === 'expired') {
          showToast('QR sudah kadaluarsa. Generate ulang.', 'info');
        }
        const data = await api.post(API_CONFIG.getGenerateQrUrl(id));
        openAbsensiQrModal(data.data || {});
        loadAbsensi(selectedAcaraId);
        return;
      }

      if (action === 'logs') {
        var logs = [];
        try {
          const data = await api.get(API_CONFIG.getAbsensiLogsUrl(id));
          logs = Array.isArray(data.data) ? data.data : [];
        } catch (err) {
          if (err.status !== 404) throw err;
        }
        openAbsensiLogModal(logs, absensi?.judul || '', id, token);
        return;
      }

      if (action === 'delete') {
        if (!await openConfirmModal(`Hapus absensi "${absensi?.judul || ''}" beserta seluruh log-nya?`)) return;
        await api.del(API_CONFIG.getDeleteAbsensiUrl(id));
        showToast('Absensi berhasil dihapus.', 'success');
        loadAbsensi(selectedAcaraId);
        return;
      }
    } catch (err) {
      showToast(err.message || 'Aksi gagal.', 'error');
    }
  });

  setEmpty('Memuat daftar acara...', true);
  await loadAcara();
  renderList();
}
