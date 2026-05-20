/**
 * register.js — Register page logic
 *
 * Handles email, username & password validation with strength meter,
 * form submission, and user feedback with toast notifications.
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
// PASSWORD STRENGTH METER
// =============================================================================

// ─── Calculate password strength score ──────────────────────────────────────
function scorePassword(val) {
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

// ─── Initialize password strength meter ────────────────────────────────────
function initPasswordStrengthMeter() {
  const strengthWrap = $('strengthWrap');
  const strengthBar = $('strengthBar');
  const strengthLabel = $('strengthLabel');
  const pwInput = $('password');

  if (!pwInput || !strengthWrap) return;

  const STRENGTH_CONFIG = [
    { max: 0, label: '', color: 'transparent', width: '0%' },
    { max: 2, label: 'Lemah', color: '#d04f4f', width: '25%' },
    { max: 4, label: 'Cukup', color: '#e89b3a', width: '55%' },
    { max: 6, label: 'Kuat', color: '#3a9e6e', width: '80%' },
    { max: Infinity, label: 'Sangat Kuat', color: '#2a7a55', width: '100%' },
  ];

  // Update strength meter display
  function updateStrength(val) {
    if (!val) {
      strengthWrap.classList.remove('show');
      strengthLabel.classList.remove('show');
      return;
    }

    const score = scorePassword(val);
    const cfg = STRENGTH_CONFIG.find((c) => score <= c.max) || STRENGTH_CONFIG[STRENGTH_CONFIG.length - 1];

    strengthWrap.classList.add('show');
    strengthBar.style.width = cfg.width;
    strengthBar.style.backgroundColor = cfg.color;
    strengthLabel.textContent = cfg.label;
    strengthLabel.style.color = cfg.color;
    strengthLabel.classList.toggle('show', !!cfg.label);
  }

  // Listen to password input changes
  pwInput.addEventListener('input', () => updateStrength(pwInput.value));
}

// =============================================================================
// REGISTER INITIALIZATION
// =============================================================================
function initRegister() {
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

  // ── Username validator (maksimal 10 karakter, no spaces) ────────────────────
  function validateUsername(input, error) {
    const val = input.value.trim();
    if (!val) {
      showError(input, error, 'Username tidak boleh kosong.');
      return false;
    }
    if (val.length > 10) {
      showError(input, error, 'Username maksimal 10 karakter.');
      return false;
    }
    if (/\s/.test(val)) {
      showError(input, error, 'Username tidak boleh mengandung spasi.');
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

  // Initialize username field
  const usernameInput = $('username');
  const usernameError = $('usernameError');
  if (usernameInput && usernameError) {
    usernameInput.addEventListener('blur', () => validateUsername(usernameInput, usernameError));
    usernameInput.addEventListener('input', () => {
      if (usernameInput.classList.contains('is-error')) clearError(usernameInput, usernameError);
    });
  }

  initPasswordField(validatePassword);
  initPasswordToggle();
  initPasswordStrengthMeter();
  initEnterKey(['email', 'username', 'password'], submitBtn);

  // ── Form submit handler ─────────────────────────────────────────────────────
  submitBtn.addEventListener('click', () => {
    const emailInput = $('email');
    const usernameInput = $('username');
    const passwordInput = $('password');
    const emailError = $('emailError');
    const usernameError = $('usernameError');
    const passwordError = $('passwordError');

    // Validate all fields
    const isEmailValid = validateEmail(emailInput, emailError);
    const isUsernameValid = validateUsername(usernameInput, usernameError);
    const isPasswordValid = validatePassword(passwordInput, passwordError);

    if (!isEmailValid || !isUsernameValid || !isPasswordValid) return;

    // Show loading state
    setLoading(submitBtn, btnLoader, true);

    // Simulate async register API call (replace with real API endpoint)
    setTimeout(() => {
      setLoading(submitBtn, btnLoader, false);
      showToast('✓  Registrasi berhasil! Silakan login.', 'success');

      // Redirect to login page after successful registration
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2800);
    }, 1800);
  });
}

// =============================================================================
// Bootstrap
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initRegister();
});
