'use strict';

const LOGS_PAGE_SIZE = 15;

const LOGS_STATUS_LABEL = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  izin: 'Izin',
  'tanpa keterangan': 'Tanpa Keterangan'
};

function openEditLogModal(logData, onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Edit log absensi">
      <div class="modal-header">
        <h2 class="modal-title">Edit Log Absensi</h2>
        <p class="modal-subtitle">${logData.username || logData.id_user || ''}</p>
      </div>
      <form class="modal-form" id="editLogForm">
        <div class="modal-field">
          <label class="modal-label" for="elStatus">Status</label>
          <select class="modal-select" id="elStatus" name="keterangan" required>
            <option value="hadir" ${logData.keterangan === 'hadir' ? 'selected' : ''}>Hadir</option>
            <option value="sakit" ${logData.keterangan === 'sakit' ? 'selected' : ''}>Sakit</option>
            <option value="izin" ${logData.keterangan === 'izin' ? 'selected' : ''}>Izin</option>
            <option value="tanpa keterangan" ${logData.keterangan === 'tanpa keterangan' ? 'selected' : ''}>Tanpa Keterangan</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="elNote">Catatan</label>
          <textarea class="modal-input" id="elNote" name="note" placeholder="Catatan (opsional)" style="resize:vertical;min-height:60px">${logData.note || ''}</textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#editLogForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    onSubmit({
      keterangan: f.keterangan.value,
      note: f.note.value.trim() || null
    }, () => closeModal(overlay, onKeyDown));
  });
}

function openAddLogModal(acaraList, token, onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const acaraOpts = acaraList.map((a) =>
    `<option value="${a.id_acara}">${a.judul}</option>`
  ).join('') || '<option value="">Tidak ada acara</option>';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Tambah log absensi">
      <div class="modal-header">
        <h2 class="modal-title">Tambah Log Absensi</h2>
        <p class="modal-subtitle">Tambahkan kehadiran secara manual.</p>
      </div>
      <form class="modal-form" id="addLogForm">
        <div class="modal-field">
          <label class="modal-label" for="alAcara">Acara</label>
          <select class="modal-select" id="alAcara" name="id_acara" required>
            <option value="">-- Pilih Acara --</option>
            ${acaraOpts}
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alAbsensi">Absensi</label>
          <select class="modal-select" id="alAbsensi" name="id_absensi" required>
            <option value="">-- Pilih Acara Terlebih Dahulu --</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alUser">ID User</label>
          <input class="modal-input" id="alUser" name="id_user_target" type="text" placeholder="Masukkan ID user" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alStatus">Status</label>
          <select class="modal-select" id="alStatus" name="keterangan" required>
            <option value="">-- Pilih Status --</option>
            <option value="hadir">Hadir</option>
            <option value="sakit">Sakit</option>
            <option value="izin">Izin</option>
            <option value="tanpa keterangan">Tanpa Keterangan</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alNote">Catatan</label>
          <textarea class="modal-input" id="alNote" name="note" placeholder="Catatan (opsional)" style="resize:vertical;min-height:60px"></textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Tambah</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  const acaraSelect = overlay.querySelector('#alAcara');
  const absensiSelect = overlay.querySelector('#alAbsensi');

  acaraSelect.addEventListener('change', async () => {
    const idAcara = acaraSelect.value;
    if (!idAcara) {
      absensiSelect.innerHTML = '<option value="">-- Pilih Acara Terlebih Dahulu --</option>';
      return;
    }
    absensiSelect.innerHTML = '<option value="">Memuat...</option>';
    try {
      try {
        const data = await api.get(API_CONFIG.getAbsensiByAcaraUrl(idAcara));
        var list = Array.isArray(data.data) ? data.data : [];
      } catch (_) {
        var list = [];
      }
      absensiSelect.innerHTML = '<option value="">-- Pilih Absensi --</option>' +
        list.map((a) => `<option value="${a.id_absensi}">${a.judul}</option>`).join('');
    } catch (_) {
      absensiSelect.innerHTML = '<option value="">Gagal memuat</option>';
    }
  });

  overlay.querySelector('#addLogForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    onSubmit({
      id_absensi: Number(f.id_absensi.value),
      id_user_target: f.id_user_target.value.trim(),
      keterangan: f.keterangan.value,
      note: f.note.value.trim() || null
    }, () => closeModal(overlay, onKeyDown));
  });
}

async function initAbsensiLogs(actualRole, token) {
  const tableBody = document.getElementById('logsBody');
  const emptyEl = document.getElementById('logsEmpty');
  const acaraFilter = document.getElementById('logsAcaraFilter');
  const statusFilter = document.getElementById('logsStatusFilter');
  const addBtn = document.getElementById('logsAddBtn');

  if (!tableBody) return;

  let acaraList = [];
  let selectedAcaraId = '';
  let allLogs = [];
  let statusFilterValue = '';

  function setEmpty(msg, show) {
    if (emptyEl) {
      emptyEl.textContent = msg;
      emptyEl.classList.toggle('is-visible', show);
    }
  }

  async function loadLogs() {
    if (!selectedAcaraId) {
      tableBody.innerHTML = '';
      setEmpty('Pilih acara terlebih dahulu.', true);
      return;
    }

    try {
      setEmpty('Memuat data...', true);
      const data = await api.get(API_CONFIG.getLogsByAcaraUrl(selectedAcaraId));
      const logs = Array.isArray(data.data) ? data.data : [];
      allLogs = logs;
      renderLogs();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memuat log.', 'error');
    }
  }

  function renderLogs() {
    tableBody.innerHTML = '';
    const filtered = statusFilterValue
      ? allLogs.filter((l) => l.keterangan === statusFilterValue)
      : allLogs;

    if (filtered.length === 0) {
      setEmpty('Tidak ada data absensi yang sesuai.', true);
      return;
    }
    setEmpty('', false);

    filtered.forEach((log) => {
      const ket = log.keterangan || '-';
      const ketLabel = LOGS_STATUS_LABEL[ket] || ket.charAt(0).toUpperCase() + ket.slice(1);
      const tr = document.createElement('tr');
      tr.dataset.logId = log.id_absensi_log;
      tr.innerHTML = `
        <td>${log.username || log.id_user || '-'}</td>
        <td>${log.judul_absensi || '-'}</td>
        <td><span class="absensi-log-status absensi-log-${ket}">${ketLabel}</span></td>
        <td>${log.note || '-'}</td>
        <td>${formatDateTime(log.waktu_absen)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="absensi-log-delete" type="button" data-log-edit="${log.id_absensi_log}" title="Edit">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/>
              </svg>
            </button>
            <button class="absensi-log-delete" type="button" data-log-delete="${log.id_absensi_log}" title="Hapus" style="color:#999">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M10 10v6M14 10v6"/>
              </svg>
            </button>
          </div>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  async function loadAcaraFilter() {
    try {
      const data = await api.get(API_CONFIG.getAcaraUrl());
      acaraList = Array.isArray(data.data) ? data.data : [];

      if (acaraFilter) {
        acaraFilter.innerHTML = '<option value="">-- Pilih Acara --</option>' +
          acaraList.map((a) => `<option value="${a.id_acara}">${a.judul}</option>`).join('');
      }
    } catch (_) {}
  }

  // Acara filter event
  if (acaraFilter) {
    acaraFilter.addEventListener('change', () => {
      selectedAcaraId = acaraFilter.value;
      allLogs = [];
      statusFilterValue = '';
      if (statusFilter) statusFilter.value = '';
      loadLogs();
    });
  }

  // Status filter event
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      statusFilterValue = statusFilter.value;
      renderLogs();
    });
  }

  // Table actions: Edit / Delete
  tableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-log-edit]');
    const delBtn = e.target.closest('[data-log-delete]');

    if (editBtn) {
      const logId = editBtn.dataset.logEdit;
      const tr = editBtn.closest('tr');
      const cells = tr.querySelectorAll('td');
      const logData = {
        id_absensi_log: logId,
        username: cells[0]?.textContent || '',
        keterangan: tr.querySelector('.absensi-log-status')?.className.match(/absensi-log-(\S+)/)?.[1] || '',
        note: cells[3]?.textContent || ''
      };
      if (logData.note === '-') logData.note = '';

      openEditLogModal(logData, async (payload, close) => {
        try {
          await api.put(API_CONFIG.getUpdateAbsensiLogUrl(logId), payload);
          showToast('Log berhasil diperbarui.', 'success');
          close();
          loadLogs();
        } catch (err) {
          showToast(err.message || 'Gagal mengupdate log.', 'error');
        }
      });
      return;
    }

    if (delBtn) {
      if (!await openConfirmModal('Hapus log absensi ini?')) return;
      try {
        await api.del(API_CONFIG.getDeleteGlobalLogUrl(delBtn.dataset.logDelete));
        showToast('Log berhasil dihapus.', 'success');
        loadLogs();
      } catch (err) {
        showToast(err.message || 'Gagal menghapus log.', 'error');
      }
    }
  });

  // Add button
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (acaraList.length === 0) {
        showToast('Tidak ada acara tersedia.', 'info');
        return;
      }
      openAddLogModal(acaraList, token, async (payload, close) => {
        try {
          await api.post(API_CONFIG.getAddAbsensiLogUrl(), payload);
          showToast('Log berhasil ditambahkan.', 'success');
          close();
          loadLogs();
        } catch (err) {
          showToast(err.message || 'Gagal menambah log.', 'error');
        }
      });
    });
  }

  const logsExportBtn = document.getElementById('logsExportBtn');
  if (logsExportBtn) {
    const updateLogsExportState = () => { logsExportBtn.disabled = !selectedAcaraId; };
    updateLogsExportState();
    logsExportBtn.addEventListener('click', (e) => {
      if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
      e.stopPropagation();
      const menu = logsExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    logsExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
        const format = opt.dataset.format;
        const status = statusFilter?.value || '';
        const filename = format === 'pdf' ? 'logs_absensi.pdf' : 'logs_absensi.xlsx';
        downloadExport(API_CONFIG.getExportLogsUrl(selectedAcaraId, { status }, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
    if (acaraFilter) acaraFilter.addEventListener('change', updateLogsExportState);
  }

  setEmpty('Memuat data...', true);
  await loadAcaraFilter();
  await loadLogs();

}
