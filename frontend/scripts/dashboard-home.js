'use strict';

/* ADMIN SUMMARY */
async function fetchAdminSummary(token) {
  const data = await api.get(API_CONFIG.getDashboardSummaryUrl());
  return data?.data || {};
}

async function initAdminSummary(token) {
  try {
    const [summary, monthlyRes] = await Promise.all([
      fetchAdminSummary(token),
      api.get(API_CONFIG.getDashboardMonthlyUrl()).catch(() => ({ data: {} }))
    ]);

    renderMetricCards(summary);
    renderGauge(summary);
    renderComparisonChart(monthlyRes?.data || {});
  } catch (error) {
    console.error(error);
    ['metricUserVal', 'metricAcaraVal', 'metricAbsensiVal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = 'Error';
    });
  }
}

function renderMetricCards(summary) {
  const vals = [
    { id: 'metricUserVal', val: parseInt(summary.totalUser) || 0 },
    { id: 'metricAcaraVal', val: parseInt(summary.totalAcara) || 0 },
    { id: 'metricAbsensiVal', val: parseInt(summary.totalAbsensi) || 0 }
  ];

  const max = Math.max(1, ...vals.map(v => v.val));

  vals.forEach(({ id, val }) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatNumber(val);
  });

  const barIds = ['metricUserBar', 'metricAcaraBar', 'metricAbsensiBar'];
  vals.forEach((v, i) => {
    const el = document.getElementById(barIds[i]);
    if (el) {
      el.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.width = ((v.val / max) * 100) + '%';
        });
      });
    }
  });
}

function renderGauge(summary) {
  const el = document.getElementById('summaryGaugeChart');
  if (!el) return;

  const raw = summary.tingkatKehadiran || '0';
  const gaugeVal = Math.min(100, Math.max(0, parseInt(raw) || 0));
  const hasData = raw !== 'Data Kosong' && raw !== '0' && raw !== '';

  const r = 42;
  const circ = 2 * Math.PI * r;
  const targetOffset = circ - (gaugeVal / 100) * circ;

  el.innerHTML = `
    <div class="gauge-wrap">
      <svg viewBox="0 0 100 100" width="96" height="96" class="gauge-svg">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e0dbd5" stroke-width="12"/>
        ${hasData ? `<circle cx="50" cy="50" r="${r}" fill="none" stroke="#111" stroke-width="12"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ}" stroke-linecap="round"
          transform="rotate(-90 50 50)" id="gaugeArc"
          style="transition: stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)"/>` : ''}
        <text x="50" y="48" text-anchor="middle" font-size="22" font-weight="700" fill="#111">${hasData ? gaugeVal : '?'}</text>
        <text x="50" y="66" text-anchor="middle" font-size="9" fill="#6b6b6b" font-weight="500">${hasData ? '%' : 'N/A'}</text>
      </svg>
    </div>`;

  if (hasData) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const arc = document.getElementById('gaugeArc');
        if (arc) arc.setAttribute('stroke-dashoffset', targetOffset);
      });
    });
  }
}

function renderComparisonChart(data) {
  const el = document.getElementById('comparisonChart');
  if (!el) return;

  const current = data.current || {};
  const previous = data.previous || {};

  if (!current.acara && current.acara !== 0) {
    el.innerHTML = '<p class="chart-placeholder">Data bulanan belum tersedia</p>';
    return;
  }

  // Acara + Absensi bar chart (counts)
  const metrics = [
    { label: 'Acara', current: current.acara ?? 0, previous: previous.acara ?? 0 },
    { label: 'Absensi', current: current.absensi ?? 0, previous: previous.absensi ?? 0 }
  ];
  const maxVal = Math.max(1, ...metrics.map(m => Math.max(m.current, m.previous)));
  const barMaxH = 120;
  const svgW = 440;
  const svgH = 170;
  const groupW = svgW / metrics.length;
  const barW = 56;
  const gap = 14;
  const yBase = 140;

  let bars = '';
  let groupLabels = '';
  metrics.forEach((m, i) => {
    const cx = i * groupW + (groupW - (barW * 2 + gap)) / 2;
    const h1 = (m.current / maxVal) * barMaxH;
    const h2 = (m.previous / maxVal) * barMaxH;
    const origin = `${cx + barW / 2} ${yBase}`;
    const origin2 = `${cx + barW + gap + barW / 2} ${yBase}`;

    bars += `
      <rect x="${cx}" y="${yBase - h1}" width="${barW}" height="${Math.max(h1, 1)}" rx="4" fill="#111"
        style="transform-origin:${origin};transform:scaleY(0);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1)" class="comp-bar"/>
      <rect x="${cx + barW + gap}" y="${yBase - h2}" width="${barW}" height="${Math.max(h2, 1)}" rx="4" fill="#c4bfb8"
        style="transform-origin:${origin2};transform:scaleY(0);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s" class="comp-bar"/>
      <text x="${cx + barW / 2}" y="${yBase - h1 - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="#111" opacity="0" class="comp-label">${m.current}</text>
      <text x="${cx + barW + gap + barW / 2}" y="${yBase - h2 - 6}" text-anchor="middle" font-size="11" font-weight="600" fill="#6b6b6b" opacity="0" class="comp-label">${m.previous}</text>
      <text x="${cx + barW + gap / 2}" y="${yBase + 18}" text-anchor="middle" font-size="12" font-weight="600" fill="#111">${m.label}</text>
    `;
  });

  el.innerHTML = `
    <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" style="display:block">
      <line x1="20" y1="${yBase}" x2="${svgW - 20}" y2="${yBase}" stroke="#ddd" stroke-width="1"/>
      ${bars}
      <rect x="10" y="8" width="12" height="12" rx="3" fill="#111"/>
      <text x="26" y="18" font-size="11" fill="#111" font-weight="600">Bulan Ini</text>
      <rect x="110" y="8" width="12" height="12" rx="3" fill="#c4bfb8"/>
      <text x="126" y="18" font-size="11" fill="#6b6b6b" font-weight="600">Bulan Lalu</text>
    </svg>`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.querySelectorAll('.comp-bar').forEach(b => b.style.transform = 'scaleY(1)');
      el.querySelectorAll('.comp-label').forEach(t => {
        t.style.transition = 'opacity 0.3s ease 0.3s';
        t.style.opacity = '1';
      });
    });
  });
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

/* USER HOME PAGE — events + absensi status */
const STATUS_LABEL_MAP = {
  hadir: { label: 'Hadir', cls: 'done', icon: '&#10003;' },
  izin: { label: 'Izin', cls: 'pending', icon: '&#9990;' },
  sakit: { label: 'Sakit', cls: 'pending', icon: '&#9745;' },
  'tanpa keterangan': { label: 'Tanpa Keterangan', cls: 'pending', icon: '-' }
};

function getStatusConfig(acara) {
  if (!acara.has_absensi) return { label: 'Belum Ada Absensi', cls: 'pending', icon: '∘' };
  if (!acara.absensi_keterangan) return { label: 'Belum Absen', cls: 'pending', icon: '∘' };
  return STATUS_LABEL_MAP[acara.absensi_keterangan] || { label: acara.absensi_keterangan, cls: 'pending', icon: '?' };
}

async function initUserHomepageEvents(actualRole, token, id_user) {
  if (actualRole !== 'user') return;
  const grid = document.getElementById('userEventGrid');
  if (!grid) return;

  try {
    const data = await api.get(API_CONFIG.getAcaraIkutiByUserUrl(id_user));
    const acaras = Array.isArray(data.data) ? data.data : [];

    grid.innerHTML = '';
    if (acaras.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0">Belum mengikuti acara apapun.</p>';
      return;
    }

    acaras.forEach((acara) => {
      const cfg = getStatusConfig(acara);
      const card = document.createElement('div');
      card.className = 'card event-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="event-left">
          <div class="event-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M7 3v4M17 3v4M3 10h18" />
              <path d="M8 14h8" />
            </svg>
          </div>
          <div class="event-info">
            <p class="event-title">${acara.judul || 'Tanpa Judul'}</p>
            <p class="event-meta">${formatDateTime(acara.tanggal_mulai) || '-'}</p>
            <p class="event-location">${acara.lokasi || '-'}</p>
          </div>
        </div>
        <span class="status-pill status-${cfg.cls}">${cfg.icon} ${cfg.label}</span>`;
      card.addEventListener('click', () => {
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0">Gagal memuat data.</p>';
    showToast(err.message || 'Gagal memuat acara.', 'error');
  }
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'jt';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'rb';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
