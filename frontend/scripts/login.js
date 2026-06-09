/**
 * login.js — Login page logic
 *
 * Handles email & password validation, form submission,
 * and user feedback with toast notifications.
 */

'use strict';

// ─── Utility: DOM shortcut ────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ─── Utility: Validate email format ──────────────────────────────────────────
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

// ─── Utility: Show field error ────────────────────────────────────────────────
function showError(input, errorEl, msg) {
  input.classList.add('is-error');
  input.classList.remove('is-success');
  errorEl.textContent = msg;
  errorEl.classList.add('visible');
}

// ─── Utility: Clear field error ───────────────────────────────────────────────
function clearError(input, errorEl) {
  input.classList.remove('is-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

// ─── Utility: Mark field as valid ─────────────────────────────────────────────
function markSuccess(input) {
  input.classList.add('is-success');
  input.classList.remove('is-error');
}

// ─── Utility: Toast notification ─────────────────────────────────────────────
function showToast(msg, type = 'success', duration = 3200) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 420);
  }, duration);
}

// ─── Utility: Set button loading state ───────────────────────────────────────
function setLoading(btn, loader, isLoading) {
  btn.disabled = isLoading;
  loader.classList.toggle('loading', isLoading);
}

// ─── Toggle password visibility ──────────────────────────────────────────────
function initPasswordToggle() {
  const toggleBtn = $('togglePassword');
  const pwInput = $('password');
  const icon = $('eyeIcon');
  if (!toggleBtn || !pwInput || !icon) return;

  const EYE_OPEN = `
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
         9.542 7-1.274 4.057-5.064 7-9.542 7-4.477
         0-8.268-2.943-9.542-7z"/>`;

  const EYE_CLOSED = `
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
         a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878
         9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3
         3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543
         7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>`;

  toggleBtn.addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type = isHidden ? 'text' : 'password';
    icon.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    toggleBtn.setAttribute('aria-label', isHidden ? 'Sembunyikan password' : 'Tampilkan password');
  });
}

// ─── Attach real-time blur validation for email ──────────────────────────────
function initEmailField(cb) {
  const input = $('email');
  const error = $('emailError');
  if (!input || !error) return;

  input.addEventListener('blur', () => cb(input, error));
  input.addEventListener('input', () => {
    if (input.classList.contains('is-error')) clearError(input, error);
  });
}

// ─── Attach real-time blur validation for password ─────────────────────────────
function initPasswordField(cb) {
  const input = $('password');
  const error = $('passwordError');
  if (!input || !error) return;

  input.addEventListener('blur', () => cb(input, error));
  input.addEventListener('input', () => {
    if (input.classList.contains('is-error')) clearError(input, error);
  });
}

// ─── Enter key submits ────────────────────────────────────────────────────────
function initEnterKey(fields, btn) {
  fields.forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
  });
}

// =============================================================================
// LOGIN INITIALIZATION
// =============================================================================
function initLogin() {
  const submitBtn = $('submitBtn');
  const btnLoader = $('btnLoader');
  if (!submitBtn) return;

  // ── Email validator ─────────────────────────────────────────────────────────
  function validateEmail(input, error) {
    const val = input.value.trim();
    if (!val) {
      showError(input, error, 'Email tidak boleh kosong.');
      return false;
    }
    if (!isValidEmail(val)) {
      showError(input, error, 'Format email tidak valid.');
      return false;
    }
    clearError(input, error);
    markSuccess(input);
    return true;
  }

  // ── Password validator (minimal 8 karakter) ────────────────────────────────
  function validatePassword(input, error) {
    const val = input.value;
    if (!val) {
      showError(input, error, 'Password tidak boleh kosong.');
      return false;
    }
    if (val.length < 8) {
      showError(input, error, 'Password minimal 8 karakter.');
      return false;
    }
    clearError(input, error);
    markSuccess(input);
    return true;
  }

  // ── Initialize form fields ──────────────────────────────────────────────────
  initEmailField(validateEmail);
  initPasswordField(validatePassword);
  initPasswordToggle();
  initEnterKey(['email', 'password'], submitBtn);

  // ── Form submit handler ─────────────────────────────────────────────────────
  submitBtn.addEventListener('click', async () => {
    const emailInput = $('email');
    const passwordInput = $('password');
    const emailError = $('emailError');
    const passwordError = $('passwordError');

    // Validate all fields
    const isEmailValid = validateEmail(emailInput, emailError);
    const isPasswordValid = validatePassword(passwordInput, passwordError);

    if (!isEmailValid || !isPasswordValid) return;

    // Show loading state
    setLoading(submitBtn, btnLoader, true);

    try {
      const response = await fetch(API_CONFIG.getLoginUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error responses
        if (response.status === 404) {
          showToast('❌ Email belum terdaftar. Silakan register terlebih dahulu.', 'error');
        } else if (response.status === 401) {
          showToast('❌ Email atau password salah.', 'error');
        } else {
          showToast(`❌ ${data.message || 'Terjadi kesalahan pada server.'}`, 'error');
        }
        setLoading(submitBtn, btnLoader, false);
        return;
      }

      // Successful login
      showToast('✓ Login berhasil! Selamat datang kembali.', 'success');

      if (data?.data?.token) {
        localStorage.setItem('authToken', data.data.token);
      }

      if (data?.data?.user) {
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
      }

      // Store email in session/local storage for next page
      sessionStorage.setItem('userEmail', emailInput.value.trim());

      // Check for redirect param
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        setTimeout(() => {
          window.location.href = redirect;
        }, 1500);
        return;
      }

      const roleValue = data?.data?.user?.tipe_akun || '';
      const role = roleValue.toString().toLowerCase();
      const dashboardUrl = role === 'admin'
        ? '../dashboard/admin/index.html'
        : role === 'organizer'
          ? '../dashboard/organizer/index.html'
          : role === 'user'
            ? '../dashboard/user/index.html'
            : '../dashboard/index.html';

      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      showToast('❌ Gagal terhubung ke server. Pastikan server berjalan.', 'error');
      setLoading(submitBtn, btnLoader, false);
    }
  });
}

// =============================================================================
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
});
