'use strict';

function openEditModal(user, onSubmit) {
  if (!user?.email) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Edit akun">
      <div class="modal-header">
        <h2 class="modal-title">Edit Akun</h2>
        <p class="modal-subtitle">Perbarui username atau email akun.</p>
      </div>
      <form class="modal-form" id="editUserForm">
        <div class="modal-field">
          <label class="modal-label" for="editEmail">Email Saat Ini</label>
          <input class="modal-input" id="editEmail" name="email" type="email" value="${user.email}" readonly />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="editUsername">Username</label>
          <input class="modal-input" id="editUsername" name="username" type="text" value="${user.username || ''}" placeholder="Username baru" />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="editNewEmail">Email Baru</label>
          <input class="modal-input" id="editNewEmail" name="newEmail" type="email" value="${user.email}" placeholder="Email baru" />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="editPassword">Password Baru</label>
          <input class="modal-input" id="editPassword" name="password" type="password" placeholder="Password baru" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('#editUserForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      email: user.email,
      username: form.username.value.trim(),
      newEmail: form.newEmail.value.trim(),
      password: form.password.value.trim()
    };
    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

function openCreateModal(onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat user">
      <div class="modal-header">
        <h2 class="modal-title">Create User</h2>
        <p class="modal-subtitle">Isi data user baru untuk didaftarkan.</p>
      </div>
      <form class="modal-form" id="createUserForm">
        <div class="modal-field">
          <label class="modal-label" for="createUsername">Username</label>
          <input class="modal-input" id="createUsername" name="username" type="text" placeholder="Username" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="createEmail">Email</label>
          <input class="modal-input" id="createEmail" name="email" type="email" placeholder="Email" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="createPassword">Password</label>
          <input class="modal-input" id="createPassword" name="password" type="password" placeholder="Password" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Buat User</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('#createUserForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value.trim()
    };
    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

function openRoleModal(user, onSubmit) {
  if (!user?.email) return;
  if (document.querySelector('.modal-overlay')) return;

  const currentRole = normalizeRole(user.tipe_akun || user.role);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Ganti role">
      <div class="modal-header">
        <h2 class="modal-title">Ganti Role</h2>
        <p class="modal-subtitle">Pilih role baru untuk akun.</p>
      </div>
      <form class="modal-form" id="roleForm">
        <div class="modal-field">
          <label class="modal-label" for="roleEmail">Email</label>
          <input class="modal-input" id="roleEmail" type="email" value="${user.email}" readonly />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="roleSelect">Role</label>
          <select class="modal-select" id="roleSelect" name="role">
            <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="organizer" ${currentRole === 'organizer' ? 'selected' : ''}>Organizer</option>
            <option value="user" ${currentRole === 'user' ? 'selected' : ''}>User</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('#roleForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const role = form.role.value;
    onSubmit({ email: user.email, tipeAkun: role }, () => closeModal(overlay, onKeyDown));
  });
}

function openDeleteModal(email, onConfirm) {
  if (!email) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Hapus akun">
      <div class="modal-header">
        <h2 class="modal-title">Hapus Akun</h2>
        <p class="modal-subtitle">Apakah kamu yakin ingin menghapus akun ini?</p>
      </div>
      <div class="modal-field">
        <label class="modal-label" for="deleteEmail">Email</label>
        <input class="modal-input" id="deleteEmail" type="email" value="${email}" readonly />
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
        <button class="modal-btn primary" type="button" data-modal-confirm>Hapus</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
    const emailInput = overlay.querySelector('#deleteEmail');
    const emailValue = emailInput?.value.trim() || email;
    onConfirm(emailValue, () => closeModal(overlay, onKeyDown));
  });
}

async function fetchUsers(token) {
  try {
    const data = await api.get(API_CONFIG.getUsersUrl());
    return Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    if (err.status === 404) return [];
    throw err;
  }
}

function formatRole(value) {
  const role = normalizeRole(value);
  if (role === 'admin') return 'Admin';
  if (role === 'organizer') return 'Organizer';
  return 'User';
}

function buildUserCard(user) {
  const card = document.createElement('div');
  card.className = 'card user-card';

  const userMain = document.createElement('div');
  userMain.className = 'user-main';

  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  avatar.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c2.2-3.2 5-4.8 8-4.8s5.8 1.6 8 4.8" />
    </svg>
  `;

  const meta = document.createElement('div');
  meta.className = 'user-meta';

  const name = document.createElement('p');
  name.className = 'user-name';
  name.textContent = user.username || 'Tanpa Nama';

  const email = document.createElement('p');
  email.className = 'user-email';
  email.textContent = user.email || '-';

  meta.appendChild(name);
  meta.appendChild(email);

  userMain.appendChild(avatar);
  userMain.appendChild(meta);

  const roleWrap = document.createElement('div');
  roleWrap.className = 'user-role';
  const rolePill = document.createElement('span');
  rolePill.className = 'role-pill';
  rolePill.textContent = formatRole(user.tipe_akun || user.role);
  roleWrap.appendChild(rolePill);

  const actions = document.createElement('div');
  actions.className = 'user-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.type = 'button';
  editBtn.dataset.userAction = 'edit';
  editBtn.dataset.email = user.email || '';
  editBtn.setAttribute('aria-label', 'Edit akun');
  editBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </svg>
  `;

  const roleBtn = document.createElement('button');
  roleBtn.className = 'icon-btn';
  roleBtn.type = 'button';
  roleBtn.dataset.userAction = 'role';
  roleBtn.dataset.email = user.email || '';
  roleBtn.setAttribute('aria-label', 'Ganti role');
  roleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M7 7h10" />
      <path d="M13 3l4 4-4 4" />
      <path d="M17 17H7" />
      <path d="M11 21l-4-4 4-4" />
    </svg>
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn danger';
  deleteBtn.type = 'button';
  deleteBtn.dataset.userAction = 'delete';
  deleteBtn.dataset.email = user.email || '';
  deleteBtn.setAttribute('aria-label', 'Hapus akun');
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M8 10v8" />
      <path d="M12 10v8" />
      <path d="M16 10v8" />
    </svg>
  `;

  actions.appendChild(editBtn);
  actions.appendChild(roleBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(userMain);
  card.appendChild(roleWrap);
  card.appendChild(actions);

  return card;
}

async function initUserManager(actualRole, token) {
  if (actualRole !== 'admin') return;

  const listEl = document.getElementById('userList');
  const emptyEl = document.getElementById('userEmpty');
  const paginationEl = document.getElementById('userPagination');
  const searchInput = document.getElementById('userSearchInput');
  const searchClear = document.getElementById('userSearchClear');

  if (!listEl || !emptyEl || !paginationEl) return;

  const state = {
    all: [],
    search: '',
    page: 1
  };

  function setEmpty(message, show) {
    emptyEl.textContent = message;
    emptyEl.classList.toggle('is-visible', show);
  }

  function applySearch() {
    const term = state.search.toLowerCase();
    return state.all.filter((user) => {
      const email = (user.email || '').toLowerCase();
      return email.includes(term);
    });
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

    for (let i = 1; i <= totalPages; i += 1) {
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
    const filtered = applySearch();
    const totalPages = Math.max(1, Math.ceil(filtered.length / USER_PAGE_SIZE));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const start = (state.page - 1) * USER_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + USER_PAGE_SIZE);

    listEl.innerHTML = '';
    if (filtered.length === 0) {
      setEmpty('Tidak ada data user.', true);
      paginationEl.innerHTML = '';
      return;
    }

    setEmpty('', false);
    pageItems.forEach((user) => listEl.appendChild(buildUserCard(user)));
    renderPagination(totalPages);
  }

  async function reloadUsers() {
    try {
      state.all = await fetchUsers(token);
      renderList();
    } catch (error) {
      console.error(error);
      setEmpty('Gagal memuat data user.', true);
      showToast(error.message || 'Gagal memuat data user.', 'error');
    }
  }

  async function handleDelete(email) {
    if (!email) return;

    await api.del(API_CONFIG.getDeleteUserUrl(email));
    showToast('Akun berhasil dihapus.', 'success');
  }

  async function handleEdit(payload) {
    const body = {
      email: payload.email
    };

    if (payload.username) body.username = payload.username;
    if (payload.newEmail && payload.newEmail !== payload.email) body.newEmail = payload.newEmail;
    if (payload.password) body.password = payload.password;

    if (!body.username && !body.newEmail && !body.password) {
      showToast('Tidak ada perubahan yang disimpan.', 'info');
      return;
    }

    await api.put(API_CONFIG.getUpdateUserUrl(payload.email), body);
    showToast('Akun berhasil diperbarui.', 'success');
  }

  async function handleRoleChange(payload) {
    await api.put(API_CONFIG.getUpdateRoleUrl(payload.email), { email: payload.email, tipeAkun: payload.tipeAkun });
    showToast('Role akun diperbarui.', 'success');
  }

  listEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-user-action]');
    if (!btn) return;

    const action = btn.dataset.userAction;
    const email = btn.dataset.email;
    const user = state.all.find((item) => item.email === email);

    try {
      if (action === 'delete') {
        openDeleteModal(email, async (confirmedEmail, close) => {
          try {
            await handleDelete(confirmedEmail);
            close();
            await reloadUsers();
          } catch (modalError) {
            console.error(modalError);
            showToast(modalError.message || 'Gagal menghapus akun.', 'error');
          }
        });
        return;
      }
      if (action === 'edit') {
        openEditModal(user, async (payload, close) => {
          try {
            await handleEdit(payload);
            close();
            await reloadUsers();
          } catch (modalError) {
            console.error(modalError);
            showToast(modalError.message || 'Gagal memperbarui akun.', 'error');
          }
        });
        return;
      }
      if (action === 'role') {
        openRoleModal(user, async (payload, close) => {
          try {
            await handleRoleChange(payload);
            close();
            await reloadUsers();
          } catch (modalError) {
            console.error(modalError);
            showToast(modalError.message || 'Gagal mengubah role akun.', 'error');
          }
        });
        return;
      }
      await reloadUsers();
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Aksi gagal dijalankan.', 'error');
    }
  });

  paginationEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    const nextPage = Number(btn.dataset.page);
    if (Number.isNaN(nextPage)) return;
    state.page = nextPage;
    renderList();
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value.trim();
      state.page = 1;
      renderList();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.search = '';
      if (searchInput) searchInput.value = '';
      state.page = 1;
      renderList();
    });
  }

  const createBtn = document.getElementById('userCreateBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateModal(async (payload, close) => {
        try {
          await api.post(API_CONFIG.getRegisterUrl(), payload);
          showToast('User berhasil dibuat.', 'success');
          close();
          await reloadUsers();
        } catch (modalError) {
          console.error(modalError);
          showToast(modalError.message || 'Gagal membuat akun.', 'error');
        }
      });
    });
  }

  const userExportBtn = document.getElementById('userExportBtn');
  if (userExportBtn) {
    userExportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = userExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    userExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const format = opt.dataset.format;
        const q = document.getElementById('userSearchInput')?.value?.trim() || '';
        const filename = format === 'pdf' ? 'users.pdf' : 'users.xlsx';
        downloadExport(API_CONFIG.getExportUsersUrl({ q }, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
  }

  setEmpty('Memuat data user...', true);
  await reloadUsers();
}

function initActions(actualRole) {
  const actionButtons = document.querySelectorAll('[data-action]');
  actionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'home') {
        clearPreviewRole();
        window.location.href = getDashboardUrl(actualRole);
        return;
      }
      if (action === 'logout') {
        clearAuth();
        redirectToLogin();
        return;
      }
      if (action === 'exit') {
        clearPreviewRole();
        window.location.href = buildPagesUrl('homepage/index.html');
        return;
      }
    });
  });

  const sideNav = $('#sideNav');
  if (sideNav) {
    sideNav.addEventListener('click', (event) => {
      const linkTarget = event.target.closest('a.side-link');
      if (linkTarget) return;
      const target = event.target.closest('button[data-nav]');
      if (!target) return;
      showToast('Menu belum tersedia.', 'info');
    });
  }
}
