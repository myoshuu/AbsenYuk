'use strict';

/* ADMIN SUMMARY */
async function fetchAdminSummary(token) {
  const data = await api.get(API_CONFIG.getDashboardSummaryUrl());
  return data?.data || {};
}

async function initAdminSummary(token) {
  const fields = ['totalUser', 'totalAcara', 'totalAbsensi', 'tingkatKehadiran'];
  const hasAnyField = fields.some((key) => document.querySelector(`[data-summary="${key}"]`));
  if (!hasAnyField) return;

  fields.forEach((key) => {
    const el = document.querySelector(`[data-summary="${key}"]`);
    if (el) el.textContent = '-';
  });

  try {
    const summary = await fetchAdminSummary(token);
    fields.forEach((key) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) {
        el.textContent = summary[key] ?? 'Data Kosong';
      }
    });
  } catch (error) {
    console.error(error);
    fields.forEach((key) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) el.textContent = 'Data Kosong';
    });
  }
}

async function initOrganizerSummary(token) {
  const fields = ['totalAcara', 'totalPeserta', 'totalAbsensi'];
  try {
    const data = await api.get(API_CONFIG.getOrganizerSummaryUrl());
    const summary = data.data || {};
    fields.forEach((key) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) el.textContent = summary[key] ?? '-';
    });
  } catch (err) {
    console.error(err);
  }

  // Load agenda
  const agendaList = document.getElementById('orgAgendaList');
  const agendaEmpty = document.getElementById('orgAgendaEmpty');
  if (!agendaList) return;

  try {
    const d = await api.get(API_CONFIG.getAcaraUrl());
    const acaras = Array.isArray(d.data) ? d.data : [];
    if (agendaEmpty) {
      agendaEmpty.classList.toggle('is-visible', acaras.length === 0);
      agendaEmpty.textContent = 'Belum ada acara.';
    }
    acaras.slice(0, 4).forEach((acara) => {
      const card = document.createElement('div');
      card.className = 'card event-card';
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      card.innerHTML = `
        <div class="event-left">
          <div class="event-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M7 3v4M17 3v4M3 10h18" />
            </svg>
          </div>
          <div class="event-info">
            <p class="event-title">${acara.judul || '-'}</p>
            <p class="event-meta">${formatDateTime(acara.tanggal_mulai)}</p>
            <p class="event-location">${acara.lokasi || '-'}</p>
          </div>
        </div>
        <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>`;
      agendaList.appendChild(card);
    });
  } catch (_) {}
}

/* ============================================================
   USER ACARA — List & Saya
============================================================ */

async function initUserAcaraList(actualRole, token) {
  const listEl = document.getElementById('userAcaraList');
  const emptyEl = document.getElementById('userAcaraEmpty');
  if (!listEl) return;

  function setEmpty(msg, show) {
    if (emptyEl) { emptyEl.textContent = msg; emptyEl.classList.toggle('is-visible', show); }
  }

  try {
    setEmpty('Memuat data...', true);
    const data = await api.get(API_CONFIG.getAcaraBrowseUrl());
    const acaras = Array.isArray(data.data) ? data.data : [];

    listEl.innerHTML = '';
    if (acaras.length === 0) { setEmpty('Belum ada acara tersedia.', true); return; }
    setEmpty('', false);

    acaras.forEach((acara) => {
      const card = document.createElement('div');
      card.className = 'card org-acara-card';
      card.innerHTML = `
        <div class="org-acara-card-top">
          <h3 class="org-acara-judul">${acara.judul || 'Tanpa Judul'}</h3>
          <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>
        </div>
        <p class="org-acara-meta"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>${formatDateTime(acara.tanggal_mulai)}</p>
        <p class="org-acara-creator">Dibuat oleh ${acara.creator_name || acara.id_user || '-'}</p>
        <button class="modal-btn primary acara-ikuti-btn" type="button" data-ikuti-id="${acara.id_acara}" data-ikuti-mulai="${acara.tanggal_mulai}">Ikuti Acara</button>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.acara-ikuti-btn')) return;
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      listEl.appendChild(card);
    });

    // Ikuti Acara button handlers
    listEl.querySelectorAll('.acara-ikuti-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        btn.textContent = 'Mengikuti...';
        const idAcara = btn.dataset.ikutiId;
        const tglMulai = btn.dataset.ikutiMulai;
        try {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          const fmt = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          const d = await api.post(API_CONFIG.getAcaraIkutiCreateUrl(), { id_acara: Number(idAcara), tanggal_mulai: tglMulai, tanggal_diikuti: fmt });
          showToast('Berhasil mengikuti acara!', 'success');
          const card = btn.closest('.org-acara-card');
          if (card) card.remove();
          const remaining = listEl.querySelectorAll('.org-acara-card').length;
          if (remaining === 0) setEmpty('Belum ada acara tersedia.', true);
        } catch (err) {
          showToast(err.message || 'Gagal mengikuti acara.', 'error');
          btn.disabled = false;
          btn.textContent = 'Ikuti Acara';
        }
      });
    });
  } catch (err) {
    console.error(err);
    setEmpty('Gagal memuat data.', true);
    showToast(err.message || 'Gagal memuat acara.', 'error');
  }
}

async function initUserAcaraSaya(actualRole, token, id_user) {
  const listEl = document.getElementById('userAcaraSayaList');
  const emptyEl = document.getElementById('userAcaraSayaEmpty');
  if (!listEl) return;

  function setEmpty(msg, show) {
    if (emptyEl) { emptyEl.textContent = msg; emptyEl.classList.toggle('is-visible', show); }
  }

  try {
    setEmpty('Memuat data...', true);
    const data = await api.get(API_CONFIG.getAcaraIkutiByUserUrl(id_user));
    const acaras = Array.isArray(data.data) ? data.data : [];

    listEl.innerHTML = '';
    if (acaras.length === 0) { setEmpty('Belum mengikuti acara apapun.', true); return; }
    setEmpty('', false);

    acaras.forEach((acara) => {
      const card = document.createElement('div');
      card.className = 'card org-acara-card';
      card.innerHTML = `
        <div class="org-acara-card-top">
          <h3 class="org-acara-judul">${acara.judul || 'Tanpa Judul'}</h3>
          <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>
        </div>
        <p class="org-acara-meta"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>${formatDateTime(acara.tanggal_mulai)}</p>
        <p class="org-acara-creator">Dibuat oleh ${acara.creator_name || acara.id_user || '-'}</p>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    setEmpty('Gagal memuat data.', true);
    showToast(err.message || 'Gagal memuat acara.', 'error');
  }
}
