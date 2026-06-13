'use strict';

/* ─── Toast notification ──────────────────────────────────────────────── */
function showToast(msg, type = 'success', duration = 3200) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  document.body.appendChild(toast);

  // Small delay to trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Auto-hide after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 420);
  }, duration);

  return toast;
}

/* ─── Retry wrapper for API calls ────────────────────────────────────── */
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 5000,
    onRetry = null,
    onError = null
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        if (onError) onError(error);
        throw error;
      }

      // Don't retry if this is the last attempt
      if (attempt === maxRetries - 1) {
        if (onError) onError(error);
        throw error;
      }

      // Calculate delay with exponential backoff (capped)
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      if (onRetry) {
        onRetry({
          attempt: attempt + 1,
          maxRetries,
          delay,
          error
        });
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/* ─── Show error with retry option ────────────────────────────────────── */
function showErrorWithRetry(container, message, onRetry) {
  const errorEl = document.createElement('div');
  errorEl.className = 'error-state';
  errorEl.innerHTML = `
    <div class="error-state-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <div class="error-state-title">Gagal memuat data</div>
    <div class="error-state-message">${message}</div>
    ${onRetry ? `
      <button class="error-retry-btn" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
        Coba Lagi
      </button>
    ` : ''}
  `;

  if (onRetry) {
    const retryBtn = errorEl.querySelector('.error-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', onRetry);
    }
  }

  if (container) {
    container.innerHTML = '';
    container.appendChild(errorEl);
  }

  return errorEl;
}

/* ─── Email validation ────────────────────────────────────────────────── */
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

/* ─── Field error display ─────────────────────────────────────────────── */
function showError(input, errorEl, msg) {
  input.classList.add('is-error');
  input.classList.remove('is-success');
  errorEl.textContent = msg;
  errorEl.classList.add('visible');
}

function clearError(input, errorEl) {
  input.classList.remove('is-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

function markSuccess(input) {
  input.classList.add('is-success');
  input.classList.remove('is-error');
}

/* ─── Button loading state ────────────────────────────────────────────── */
function setLoading(btn, loader, isLoading) {
  btn.disabled = isLoading;
  loader.classList.toggle('loading', isLoading);
}

/* ─── Path resolution for multi-level pages ───────────────────────────── */
function buildPagesUrl(relativePath) {
  const path = window.location.pathname.replace(/\\/g, '/');
  const marker = '/pages/';
  const idx = path.indexOf(marker);
  if (idx === -1) {
    return '/pages/' + relativePath;
  }
  return path.slice(0, idx + marker.length) + relativePath;
}

/* ─── Date formatting ─────────────────────────────────────────────────── */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const tgl = d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const jam = d.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
  return `${tgl} ${jam}`;
}

function formatTanggalLengkap(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (_) {
    return '-';
  }
}
