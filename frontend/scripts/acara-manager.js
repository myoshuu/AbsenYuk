'use strict';

const ACARA_PAGE_SIZE = 8;

const ACARA_STATUS_LABEL = {
  'selesai': 'Selesai',
  'berlangsung': 'Berlangsung',
  'akan-datang': 'Akan Datang'
};

/**
 * Tentukan status acara berdasarkan tanggal mulai & akhir.
 * @param {string} tanggalMulai
 * @param {string} tanggalAkhir
 * @returns {'selesai'|'berlangsung'|'akan-datang'}
 */
function deriveAcaraStatus(tanggalMulai, tanggalAkhir) {
  const now = new Date();
  const start = parseSqlDate(tanggalMulai);
  const end = parseSqlDate(tanggalAkhir);
  if (end <= now) return 'selesai';
  if (start <= now && now < end) return 'berlangsung';
  return 'akan-datang';
}

function getAcaraStatus(acara) {
  const status = (acara?.status || '').trim();
  if (status) return status;
  return deriveAcaraStatus(acara?.tanggal_mulai, acara?.tanggal_akhir);
}

function parseSqlDate(value) {
  if (!value) return new Date('');
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return new Date(value);

  const normalized = value.trim().replace('T', ' ');
  const parts = normalized.split(/[- :]/).map((item) => Number(item));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return new Date(value);

  const [year, month, day, hour = 0, minute = 0, second = 0] = parts;
  return new Date(year, month - 1, day, hour, minute, second);
}

/**
 * Format tanggal + jam ke string bahasa Indonesia.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = parseSqlDate(dateStr);
  const tgl = d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const jam = d.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
  return `${tgl} ${jam}`;
}

/**
 * Konversi datetime string ke format date input (YYYY-MM-DD).
 * @param {string} dateStr
 * @returns {string}
 */
function toDateInput(dateStr) {
  if (!dateStr) return '';
  const d = parseSqlDate(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Konversi datetime string ke format time input (HH:MM).
 * @param {string} dateStr
 * @returns {string}
 */
function toTimeInput(dateStr) {
  if (!dateStr) return '';
  const d = parseSqlDate(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Ambil semua acara dari backend.
 * @param {string} token
 * @returns {Promise<Array>}
 */
async function fetchAcara(page, limit, status) {
  const params = { page, limit };
  if (status) params.status = status;
  const qs = new URLSearchParams(params);
  return await api.get(API_CONFIG.getAcaraUrl() + '?' + qs.toString());
}

/**
 * Buat elemen card untuk satu acara.
 * @param {Object} acara
 * @param {number} index - nomor urut (1-based)
 * @returns {HTMLElement}
 */
function buildAcaraCard(acara, index) {
  const status = getAcaraStatus(acara);
  const statusText = ACARA_STATUS_LABEL[status] || status;

  const card = document.createElement('div');
  card.className = 'card acara-card';
  card.dataset.id = acara.id_acara || '';
  card.dataset.acara = JSON.stringify(acara);

  card.innerHTML = `
    <div class="acara-num">${index}</div>
 
    <div class="acara-main">
      <div class="acara-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
             stroke="currentColor" stroke-width="1.6">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4M17 3v4M3 10h18" />
        </svg>
      </div>
      <div class="acara-meta">
        <a class="acara-title" href="${buildPagesUrl('dashboard/organizer/acara-detail.html?id=' + acara.id_acara)}">${acara.judul || 'Tanpa Judul'}</a>
        <p class="acara-date">
          ${formatDateTime(acara.tanggal_mulai)} &ndash; ${formatDateTime(acara.tanggal_akhir)}
        </p>
        <p class="acara-location">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
               stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          ${acara.lokasi || '-'}
        </p>
      </div>
    </div>
 
    <div class="acara-detail">
      <div class="status-dropdown" data-status-dropdown>
        <button class="status-pill status-${status} status-trigger" type="button"
                data-status-trigger
                data-id="${acara.id_acara || ''}"
                aria-haspopup="listbox"
                aria-expanded="false">
          ${statusText}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div class="status-menu" role="listbox" aria-label="Ubah status">
          <button class="status-option" type="button" data-status-value="akan-datang" data-id="${acara.id_acara || ''}">Akan Datang</button>
          <button class="status-option" type="button" data-status-value="berlangsung" data-id="${acara.id_acara || ''}">Berlangsung</button>
          <button class="status-option" type="button" data-status-value="selesai" data-id="${acara.id_acara || ''}">Selesai</button>
        </div>
      </div>
      <p class="acara-peserta">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
        ${acara.maks_pengunjung ?? '-'} Maks. Peserta
      </p>
    </div>
 
    <div class="acara-actions user-actions">
      <button class="icon-btn" type="button"
              data-acara-action="edit"
              data-id="${acara.id_acara || ''}"
              aria-label="Edit acara">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M14 6l4 4" />
        </svg>
      </button>
      <button class="icon-btn danger" type="button"
              data-acara-action="delete"
              data-id="${acara.id_acara || ''}"
              aria-label="Hapus acara">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M8 10v8M12 10v8M16 10v8" />
        </svg>
      </button>
    </div>
  `;

  return card;
}

/**
 * Modal: Buat Acara Baru
 */
function openCreateAcaraModal(onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat acara baru">
      <div class="modal-header">
        <h2 class="modal-title">Buat Acara Baru</h2>
        <p class="modal-subtitle">Isi detail acara yang akan dibuat.</p>
      </div>
      <form class="modal-form" id="createAcaraForm">
        <div class="modal-field">
          <label class="modal-label" for="ca_judul">Judul Acara</label>
          <input class="modal-input" id="ca_judul" name="judul"
                 type="text" placeholder="Contoh: Seminar Kepemimpinan" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_lokasi">Lokasi</label>
          <input class="modal-input" id="ca_lokasi" name="lokasi"
                 type="text" placeholder="Contoh: Aula Gedung B" required />
        </div>
        <div class="modal-field">
          <label class="modal-label">Tanggal Mulai</label>
          <div style="display:flex;gap:8px">
            <input class="modal-input" id="ca_mulai_date" name="tanggal_mulai" type="date" required style="flex:3;min-width:0" />
            <input class="modal-input" id="ca_mulai_time" name="tanggal_mulai_time" type="time" required style="flex:2;min-width:0" />
          </div>
        </div>
        <div class="modal-field">
          <label class="modal-label">Tanggal Akhir</label>
          <div style="display:flex;gap:8px">
            <input class="modal-input" id="ca_akhir_date" name="tanggal_akhir" type="date" required style="flex:3;min-width:0" />
            <input class="modal-input" id="ca_akhir_time" name="tanggal_akhir_time" type="time" required style="flex:2;min-width:0" />
          </div>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_maks">Maks. Pengunjung</label>
          <input class="modal-input" id="ca_maks" name="maks_pengunjung"
                 type="number" min="1" placeholder="Contoh: 100" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Buat Acara</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#createAcaraForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;

    // Validasi: tanggal akhir harus setelah tanggal mulai
    if (new Date(f.tanggal_akhir.value + 'T' + f.tanggal_akhir_time.value) <= new Date(f.tanggal_mulai.value + 'T' + f.tanggal_mulai_time.value)) {
      showToast('Tanggal akhir harus setelah tanggal mulai.', 'error');
      return;
    }

    const payload = {
      judul: f.judul.value.trim(),
      lokasi: f.lokasi.value.trim(),
      tanggal_mulai: f.tanggal_mulai.value + ' ' + f.tanggal_mulai_time.value + ':00',
      tanggal_akhir: f.tanggal_akhir.value + ' ' + f.tanggal_akhir_time.value + ':00',
      maks_pengunjung: Number(f.maks_pengunjung.value)
    };

    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

/**
 * Modal: Edit Acara
 */
function openEditAcaraModal(acara, onSubmit) {
  if (!acara?.id_acara) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Edit acara">
      <div class="modal-header">
        <h2 class="modal-title">Edit Acara</h2>
        <p class="modal-subtitle">Perbarui detail acara.</p>
      </div>
      <form class="modal-form" id="editAcaraForm">
        <div class="modal-field">
          <label class="modal-label" for="ea_judul">Judul Acara</label>
          <input class="modal-input" id="ea_judul" name="judul"
                 type="text" value="${acara.judul || ''}" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ea_lokasi">Lokasi</label>
          <input class="modal-input" id="ea_lokasi" name="lokasi"
                 type="text" value="${acara.lokasi || ''}" required />
        </div>
        <div class="modal-field">
          <label class="modal-label">Tanggal Mulai</label>
          <div style="display:flex;gap:8px">
            <input class="modal-input" id="ea_mulai_date" name="tanggal_mulai" type="date" value="${toDateInput(acara.tanggal_mulai)}" required style="flex:3;min-width:0" />
            <input class="modal-input" id="ea_mulai_time" name="tanggal_mulai_time" type="time" value="${toTimeInput(acara.tanggal_mulai)}" required style="flex:2;min-width:0" />
          </div>
        </div>
        <div class="modal-field">
          <label class="modal-label">Tanggal Akhir</label>
          <div style="display:flex;gap:8px">
            <input class="modal-input" id="ea_akhir_date" name="tanggal_akhir" type="date" value="${toDateInput(acara.tanggal_akhir)}" required style="flex:3;min-width:0" />
            <input class="modal-input" id="ea_akhir_time" name="tanggal_akhir_time" type="time" value="${toTimeInput(acara.tanggal_akhir)}" required style="flex:2;min-width:0" />
          </div>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ea_maks">Maks. Pengunjung</label>
          <input class="modal-input" id="ea_maks" name="maks_pengunjung"
                 type="number" min="1"
                 value="${acara.maks_pengunjung ?? ''}" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#editAcaraForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;

    if (new Date(f.tanggal_akhir.value + 'T' + f.tanggal_akhir_time.value) <= new Date(f.tanggal_mulai.value + 'T' + f.tanggal_mulai_time.value)) {
      showToast('Tanggal akhir harus setelah tanggal mulai.', 'error');
      return;
    }

    const payload = {
      judul: f.judul.value.trim(),
      lokasi: f.lokasi.value.trim(),
      tanggal_mulai: f.tanggal_mulai.value + ' ' + f.tanggal_mulai_time.value + ':00',
      tanggal_akhir: f.tanggal_akhir.value + ' ' + f.tanggal_akhir_time.value + ':00',
      maks_pengunjung: Number(f.maks_pengunjung.value)
    };

    onSubmit(acara.id_acara, payload, () => closeModal(overlay, onKeyDown));
  });
}

/**
 * Modal: Konfirmasi Hapus Acara
 */
function openDeleteAcaraModal(acara, onConfirm) {
  if (!acara?.id_acara) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Hapus acara">
      <div class="modal-header">
        <h2 class="modal-title">Hapus Acara</h2>
        <p class="modal-subtitle">
          Tindakan ini tidak dapat dibatalkan. Acara berikut akan dihapus permanen.
        </p>
      </div>
      <div class="modal-field">
        <label class="modal-label">Judul Acara</label>
        <input class="modal-input" type="text" value="${acara.judul || ''}" readonly />
      </div>
      <div class="modal-field">
        <label class="modal-label">Lokasi</label>
        <input class="modal-input" type="text" value="${acara.lokasi || ''}" readonly />
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
        <button class="modal-btn primary" type="button" data-modal-confirm>Hapus</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));
  overlay.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
    onConfirm(acara.id_acara, () => closeModal(overlay, onKeyDown));
  });
}

/**
 * Inisialisasi halaman manajemen acara.
 * Hanya berjalan jika elemen #acaraList ada di DOM (halaman acara.html).
 *
 * @param {string} actualRole
 * @param {string} token
 */
async function initAcara(actualRole, token) {
  const listEl = document.getElementById('acaraList');
  const emptyEl = document.getElementById('acaraEmpty');
  const paginationEl = document.getElementById('acaraPagination');
  const searchInput = document.getElementById('acaraSearchInput');
  const searchClear = document.getElementById('acaraSearchClear');
  const statusFilter = document.getElementById('acaraStatusFilter');

  if (!listEl || !emptyEl || !paginationEl) return;

  const state = {
    data: [],
    total: 0,
    search: '',
    status: '',
    page: 1
  };

  function setEmpty(message, show) {
    emptyEl.textContent = message;
    emptyEl.classList.toggle('is-visible', show);
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn${state.page === 1 ? ' is-disabled' : ''}`;
    prevBtn.textContent = '<';
    prevBtn.dataset.page = String(state.page - 1);
    prevBtn.disabled = state.page === 1;
    paginationEl.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === state.page ? ' is-active' : ''}`;
      btn.textContent = String(i);
      btn.dataset.page = String(i);
      paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn${state.page === totalPages ? ' is-disabled' : ''}`;
    nextBtn.textContent = '>';
    nextBtn.dataset.page = String(state.page + 1);
    nextBtn.disabled = state.page === totalPages;
    paginationEl.appendChild(nextBtn);
  }

  function renderList() {
    const totalPages = Math.max(1, Math.ceil(state.total / ACARA_PAGE_SIZE));

    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * ACARA_PAGE_SIZE;

    listEl.innerHTML = '';

    if (state.data.length === 0) {
      setEmpty('Belum ada acara yang sesuai.', true);
      paginationEl.innerHTML = '';
      return;
    }

    setEmpty('', false);
    state.data.forEach((acara, i) => {
      listEl.appendChild(buildAcaraCard(acara, start + i + 1));
    });
    renderPagination(totalPages);
  }

  async function reloadAcara() {
    try {
      const res = await fetchAcara(state.page, ACARA_PAGE_SIZE, state.status);
      state.data = Array.isArray(res.data) ? res.data : [];
      state.total = res.total || 0;
      renderList();
    } catch (error) {
      console.error(error);
      state.data = [];
      state.total = 0;
      setEmpty('Gagal memuat data acara.', true);
      showToast(error.message || 'Gagal memuat data acara.', 'error');
    }
  }

  async function handleCreate(payload) {
    await api.post(API_CONFIG.getCreateAcaraUrl(), payload);
    showToast('Acara berhasil dibuat.', 'success');
  }

  async function handleUpdate(id, payload) {
    await api.put(API_CONFIG.getUpdateAcaraUrl(id), payload);
    showToast('Acara berhasil diperbarui.', 'success');
  }

  async function handleStatusUpdate(acaraId, nextStatus) {
    await api.put(API_CONFIG.getUpdateAcaraStatusUrl(acaraId), { status: nextStatus });
    showToast('Status acara diperbarui.', 'success');
  }

  async function handleDelete(id) {
    await api.del(API_CONFIG.getDeleteAcaraUrl(id));
    showToast('Acara berhasil dihapus.', 'success');
  }

  listEl.addEventListener('click', async (event) => {
    const statusToggle = event.target.closest('button[data-status-trigger]');
    if (statusToggle) {
      const dropdown = statusToggle.closest('[data-status-dropdown]');
      const expanded = statusToggle.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('[data-status-dropdown].is-open').forEach((node) => {
        if (node !== dropdown) {
          node.classList.remove('is-open');
          node.querySelector('[data-status-trigger]')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (dropdown) {
        dropdown.classList.toggle('is-open', !expanded);
        statusToggle.setAttribute('aria-expanded', String(!expanded));
      }
      return;
    }

    const statusOption = event.target.closest('button[data-status-value]');
    if (statusOption) {
      const nextStatus = statusOption.dataset.statusValue;
      const acaraId = statusOption.dataset.id;
      const dropdown = statusOption.closest('[data-status-dropdown]');
      if (dropdown) {
        dropdown.classList.remove('is-open');
        dropdown.querySelector('[data-status-trigger]')?.setAttribute('aria-expanded', 'false');
      }

      try {
        await handleStatusUpdate(acaraId, nextStatus);
        await reloadAcara();
      } catch (err) {
        showToast(err.message || 'Gagal memperbarui status acara.', 'error');
      }
      return;
    }

    const btn = event.target.closest('button[data-acara-action]');
    if (!btn) return;

    const action = btn.dataset.acaraAction;
    const card = btn.closest('.acara-card');
    const acara = card ? JSON.parse(card.dataset.acara || '{}') : {};

    try {
      if (action === 'edit') {
        openEditAcaraModal(acara, async (acaraId, payload, close) => {
          try {
            await handleUpdate(acaraId, payload);
            close();
            await reloadAcara();
          } catch (err) {
            showToast(err.message || 'Gagal memperbarui acara.', 'error');
          }
        });
        return;
      }

      if (action === 'delete') {
        openDeleteAcaraModal(acara, async (acaraId, close) => {
          try {
            await handleDelete(acaraId);
            close();
            await reloadAcara();
          } catch (err) {
            showToast(err.message || 'Gagal menghapus acara.', 'error');
          }
        });
        return;
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Aksi gagal dijalankan.', 'error');
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-status-dropdown]')) return;
    document.querySelectorAll('[data-status-dropdown].is-open').forEach((node) => {
      node.classList.remove('is-open');
      node.querySelector('[data-status-trigger]')?.setAttribute('aria-expanded', 'false');
    });
  });

  paginationEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    const next = Number(btn.dataset.page);
    if (Number.isNaN(next)) return;
    state.page = next;
    reloadAcara();
  });

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = searchInput.value.trim();
        state.page = 1;
        reloadAcara();
      }, 300);
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      state.status = statusFilter.value;
      state.page = 1;
      reloadAcara();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.search = '';
      state.status = '';
      state.page = 1;
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = '';
      reloadAcara();
    });
  }

  const createBtn = document.getElementById('acaraCreateBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateAcaraModal(async (payload, close) => {
        try {
          await handleCreate(payload);
          close();
          await reloadAcara();
        } catch (err) {
          showToast(err.message || 'Gagal membuat acara.', 'error');
        }
      });
    });
  }

  const acaraExportBtn = document.getElementById('acaraExportBtn');
  if (acaraExportBtn) {
    acaraExportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = acaraExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    acaraExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const format = opt.dataset.format;
        const status = document.getElementById('acaraStatusFilter')?.value || '';
        const filename = format === 'pdf' ? 'acara.pdf' : 'acara.xlsx';
        downloadExport(API_CONFIG.getExportAcaraUrl({ status }, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
  }

  setEmpty('Memuat data acara...', true);
  await reloadAcara();
}

/**
 * Inisialisasi halaman acara untuk organizer.
 * Hanya berjalan jika elemen #orgAcaraList ada di DOM.
 *
 * @param {string} actualRole
 * @param {string} token
 */
async function initOrganizerAcara(actualRole, token) {
  const listEl = document.getElementById('orgAcaraList');
  const emptyEl = document.getElementById('orgAcaraEmpty');
  const createBtn = document.getElementById('orgAcaraCreateBtn');

  if (!listEl) return;

  function setEmpty(msg, show) {
    if (emptyEl) {
      emptyEl.textContent = msg;
      emptyEl.classList.toggle('is-visible', show);
    }
  }

  async function loadAcara() {
    try {
      setEmpty('Memuat data...', true);
      const data = await api.get(API_CONFIG.getAcaraUrl());
      const acaras = Array.isArray(data.data) ? data.data : [];

      listEl.innerHTML = '';
      if (acaras.length === 0) {
        setEmpty('Belum ada acara yang dibuat.', true);
        return;
      }
      setEmpty('', false);

      acaras.forEach((acara) => {
        const card = document.createElement('div');
        card.className = 'card org-acara-card';
        card.dataset.id = acara.id_acara;
        card.innerHTML = `
          <div class="org-acara-card-top">
            <h3 class="org-acara-judul">${acara.judul || 'Tanpa Judul'}</h3>
            <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>
          </div>
          <p class="org-acara-meta">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>
            ${formatDateTime(acara.tanggal_mulai)}
          </p>
          <p class="org-acara-creator">Dibuat oleh ${acara.creator_name || acara.id_user || '-'}</p>`;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
        });
        listEl.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memuat acara.', 'error');
      setEmpty('Gagal memuat data.', true);
    }
  }

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateAcaraModal(async (payload, close) => {
        try {
          await api.post(API_CONFIG.getCreateAcaraUrl(), payload);
          showToast('Acara berhasil dibuat.', 'success');
          close();
          loadAcara();
        } catch (err) {
          showToast(err.message || 'Gagal membuat acara.', 'error');
        }
      });
    });
  }

  await loadAcara();
}
