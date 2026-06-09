'use strict';

/* ============================================================
   ACARA DETAIL — Info + Forum Diskusi
============================================================ */

async function initAcaraDetail(actualRole, token) {
  const params = new URLSearchParams(window.location.search);
  const idAcara = params.get('id');

  const titleEl = document.getElementById('acaraDetailTitle');
  const subtitleEl = document.getElementById('acaraDetailSubtitle');
  const bannerEl = document.getElementById('acaraDetailBanner');
  const backBtn = document.getElementById('acaraDetailBack');
  const joinCard = document.getElementById('acaraJoinCard');
  const joinBtn = document.getElementById('acaraJoinBtn');
  const forumSection = document.getElementById('forumSection');
  const forumPostsEl = document.getElementById('forumPosts');
  const forumEmptyEl = document.getElementById('forumEmpty');
  const forumCreateBtn = document.getElementById('forumCreateBtn');

  if (!idAcara || !bannerEl) {
    if (titleEl) titleEl.textContent = 'ID Acara tidak ditemukan.';
    return;
  }

  let acaraData = null;

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  function setEmpty(el, msg, show) {
    if (el) { el.textContent = msg; el.classList.toggle('is-visible', show); }
  }

  async function loadAcara() {
    try {
      const data = await api.get(API_CONFIG.getAcaraByIdUrl(idAcara));
      acaraData = data.data || {};
      renderBanner();
    } catch (err) {
      console.error(err);
      if (titleEl) titleEl.textContent = 'Gagal memuat acara.';
      if (subtitleEl) subtitleEl.textContent = err.message;
    }
  }

  function renderBanner() {
    if (!acaraData) return;
    const statusText = ACARA_STATUS_LABEL[getAcaraStatus(acaraData)] || getAcaraStatus(acaraData);
    document.getElementById('detailJudul').textContent = acaraData.judul || '-';
    document.getElementById('detailStatusBadge').className = `status-pill status-${getAcaraStatus(acaraData)}`;
    document.getElementById('detailStatusBadge').textContent = statusText;
    document.getElementById('detailCreator').textContent = acaraData.creator_name || acaraData.id_user || '-';
    document.getElementById('detailLokasi').textContent = acaraData.lokasi || '-';
    document.getElementById('detailMulai').textContent = formatDateTime(acaraData.tanggal_mulai);
    document.getElementById('detailAkhir').textContent = formatDateTime(acaraData.tanggal_akhir);
    document.getElementById('detailMaks').textContent = acaraData.maks_pengunjung ?? '-';
    document.getElementById('detailPeserta').textContent = acaraData.peserta_ikut ?? '-';
    bannerEl.style.display = 'block';
    if (titleEl) titleEl.textContent = `Acara: ${acaraData.judul || ''}`;

    const isOwner = acaraData.isOwner;
    const isParticipant = acaraData.isParticipant;

    // Owner: show create post button
    if (forumCreateBtn) {
      forumCreateBtn.style.display = (isOwner || isParticipant) ? '' : 'none';
    }

    // Non-owner, non-participant: show join card
    if (joinCard) {
      joinCard.style.display = isOwner ? 'none' : (isParticipant ? 'none' : 'block');
    }

    // Show forum only for owner or participant
    if (forumSection) {
      forumSection.style.display = (isOwner || isParticipant) ? 'block' : 'none';
    }

    // Join button handler
    if (joinBtn && !isOwner && !isParticipant) {
      joinBtn.addEventListener('click', async () => {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Mengikuti...';
        try {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          const fmt = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          await api.post(API_CONFIG.getAcaraIkutiCreateUrl(), {
            id_acara: Number(idAcara),
            tanggal_mulai: acaraData.tanggal_mulai,
            tanggal_diikuti: fmt
          });
          showToast('Berhasil mengikuti acara!', 'success');
          // Reload page to show forum
          setTimeout(() => window.location.reload(), 1200);
        } catch (err) {
          showToast(err.message || 'Gagal mengikuti acara.', 'error');
          joinBtn.disabled = false;
          joinBtn.textContent = 'Ikuti Acara';
        }
      });
    }
  }

  async function loadPosts() {
    try {
      const data = await api.get(API_CONFIG.getAcaraPostListUrl(idAcara));
      const posts = Array.isArray(data.data) ? data.data : [];

      forumPostsEl.innerHTML = '';
      if (posts.length === 0) {
        setEmpty(forumEmptyEl, 'Belum ada diskusi.', true);
        return;
      }
      setEmpty(forumEmptyEl, '', false);

      for (const post of posts) {
        const postEl = document.createElement('div');
        postEl.className = 'forum-post-card';
        postEl.dataset.postId = post.id_post;
        postEl.innerHTML = `
          <div class="forum-post-header">
            <div>
              <strong class="forum-post-author">${post.username || post.id_user || '-'}</strong>
              <span class="forum-post-time">${formatDateTime(post.dibuat_pada)}</span>
            </div>
            ${acaraData?.isOwner ? `<button class="forum-post-delete" data-post-delete="${post.id_post}" title="Hapus post"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M10 10v6M14 10v6"/></svg></button>` : ''}
          </div>
          ${post.judul ? `<h4 class="forum-post-judul">${post.judul}</h4>` : ''}
          <p class="forum-post-konten">${post.konten}</p>
          <div class="forum-komentar-wrap">
            <div class="forum-komentar-list" id="komentarList-${post.id_post}"></div>
            <div class="forum-komentar-form">
              <textarea class="forum-textarea forum-komentar-input" id="komentarInput-${post.id_post}" placeholder="Tulis komentar..." rows="2"></textarea>
              <button class="modal-btn primary forum-komentar-btn" data-komentar-post="${post.id_post}" type="button">Kirim</button>
            </div>
          </div>`;
        forumPostsEl.appendChild(postEl);
        loadComments(post.id_post);
      }

      // Post delete handler (owner only)
      forumPostsEl.querySelectorAll('[data-post-delete]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!await openConfirmModal('Hapus postingan ini beserta semua komentarnya?')) return;
          try {
            await api.del(API_CONFIG.getAcaraPostDeleteUrl(btn.dataset.postDelete));
            showToast('Postingan dihapus.', 'success');
            loadPosts();
          } catch (err) { showToast(err.message || 'Gagal menghapus post.', 'error'); }
        });
      });

      // Comment submit handlers (all participants)
      forumPostsEl.querySelectorAll('[data-komentar-post]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const idPost = btn.dataset.komentarPost;
          const input = document.getElementById(`komentarInput-${idPost}`);
          const konten = input?.value.trim();
          if (!konten) { showToast('Tulis komentar terlebih dahulu.', 'error'); return; }
          btn.disabled = true;
          try {
            await api.post(API_CONFIG.getKomentarCreateUrl(idPost), { konten });
            input.value = '';
            showToast('Komentar terkirim.', 'success');
            loadComments(idPost);
          } catch (err) { showToast(err.message || 'Gagal mengirim komentar.', 'error'); }
          finally { btn.disabled = false; }
        });
      });
    } catch (err) {
      console.error(err);
      setEmpty(forumEmptyEl, 'Diskusi kosong.', true);
    }
  }

  async function loadComments(idPost) {
    const listEl = document.getElementById(`komentarList-${idPost}`);
    if (!listEl) return;
    try {
      const data = await api.get(API_CONFIG.getKomentarListUrl(idPost));
      const komentars = Array.isArray(data.data) ? data.data : [];
      listEl.innerHTML = '';
      if (komentars.length === 0) return;
      komentars.forEach((k) => {
        const div = document.createElement('div');
        div.className = 'forum-komentar-item';
        div.innerHTML = `
          <strong>${k.username || k.id_user || '-'}</strong>
          <span class="forum-post-time">${formatDateTime(k.dibuat_pada)}</span>
          ${acaraData?.isOwner ? `<button class="forum-komentar-delete" data-komentar-delete="${k.id_komentar}" title="Hapus komentar"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M10 10v6M14 10v6"/></svg></button>` : ''}
          <p>${k.konten}</p>`;
        listEl.appendChild(div);
      });

      listEl.querySelectorAll('[data-komentar-delete]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!await openConfirmModal('Hapus komentar ini?')) return;
          try {
            await api.del(API_CONFIG.getKomentarDeleteUrl(btn.dataset.komentarDelete));
            showToast('Komentar dihapus.', 'success');
            loadComments(idPost);
          } catch (err) { showToast(err.message || 'Gagal menghapus komentar.', 'error'); }
        });
      });
    } catch (_) {}
  }

  // Create post modal handler (owner)
  if (forumCreateBtn) {
    forumCreateBtn.addEventListener('click', () => {
      if (document.querySelector('.modal-overlay')) return;

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat diskusi">
          <div class="modal-header">
            <h2 class="modal-title">Buat Diskusi Baru</h2>
            <p class="modal-subtitle">Mulai diskusi baru untuk acara ini.</p>
          </div>
          <form class="modal-form" id="createPostForm">
            <div class="modal-field">
              <label class="modal-label" for="modalPostJudul">Judul</label>
              <input class="modal-input" id="modalPostJudul" name="judul" type="text" placeholder="Judul diskusi" required />
            </div>
            <div class="modal-field">
              <label class="modal-label" for="modalPostKonten">Konten</label>
              <textarea class="modal-input" id="modalPostKonten" name="konten" placeholder="Tulis sesuatu..." style="resize:vertical;min-height:100px" required></textarea>
            </div>
            <div class="modal-actions">
              <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
              <button class="modal-btn primary" type="submit">Posting</button>
            </div>
          </form>
        </div>`;

      document.body.appendChild(overlay);
      const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
      document.addEventListener('keydown', onKeyDown);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
      overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

      overlay.querySelector('#createPostForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.currentTarget;
        const judul = f.judul?.value?.trim() || null;
        const konten = f.konten?.value?.trim();
        if (!konten) { showToast('Konten wajib diisi.', 'error'); return; }
        try {
          await api.post(API_CONFIG.getAcaraPostCreateUrl(idAcara), { judul, konten });
          showToast('Postingan berhasil dibuat.', 'success');
          closeModal(overlay, onKeyDown);
          loadPosts();
        } catch (err) { showToast(err.message || 'Gagal membuat postingan.', 'error'); }
      });
    });
  }

  await loadAcara();
  await loadPosts();
}
