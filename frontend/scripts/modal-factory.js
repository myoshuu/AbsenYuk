'use strict';

function openModal(opts) {
  if (document.querySelector('.modal-overlay')) return null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title">${opts.title || ''}</h2>
        ${opts.subtitle ? `<p class="modal-subtitle">${opts.subtitle}</p>` : ''}
      </div>
      ${opts.bodyHtml || ''}
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>${opts.cancelText || 'Batalkan'}</button>
        ${opts.confirmText ? `<button class="modal-btn primary" type="button" data-modal-confirm>${opts.confirmText}</button>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Store previously focused element for restoration
  const previouslyFocused = document.activeElement;

  // Get focusable elements within modal
  const modalCard = overlay.querySelector('.modal-card');
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '.modal-btn:not([disabled])'
  ].join(', ');

  // Focus the modal card first for better semantics
  modalCard.focus();

  // Focus trap handler
  const focusTrap = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = Array.from(modalCard.querySelectorAll(focusableSelectors));
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: if on first element, wrap to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay, onKeyDown);
    } else if (e.key === 'Tab') {
      focusTrap(e);
    }
  };

  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay, onKeyDown);
  });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown, previouslyFocused);
    if (opts.onCancel) opts.onCancel();
  });
  const confirmBtn = overlay.querySelector('[data-modal-confirm]');
  if (confirmBtn && opts.onConfirm) {
    confirmBtn.addEventListener('click', () => opts.onConfirm(overlay));
  }

  // Store the cleanup function reference
  overlay._cleanup = () => {
    document.removeEventListener('keydown', onKeyDown);
    // Restore focus to previously focused element
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  };

  return overlay;
}

function openConfirmModal(message, title = 'Konfirmasi') {
  return new Promise((resolve) => {
    const previouslyFocused = document.activeElement;

    const overlay = openModal({
      title: title,
      bodyHtml: `<div style="padding:8px 0 18px;font-size:0.95rem;line-height:1.5">${message}</div>`,
      confirmText: 'Ya, Hapus',
      onConfirm: (o) => {
        closeModal(o, null, previouslyFocused);
        resolve(true);
      },
      onCancel: () => {
        closeModal(overlay, null, previouslyFocused);
        resolve(false);
      }
    });
    if (!overlay) {
      resolve(false);
      return;
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal(overlay, onKeyDown, previouslyFocused);
        resolve(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay, onKeyDown, previouslyFocused);
        resolve(false);
      }
    });
    overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
      closeModal(overlay, onKeyDown, previouslyFocused);
      resolve(false);
    });

    // Update overlay cleanup to handle promise resolution
    const originalCleanup = overlay._cleanup;
    overlay._cleanup = () => {
      if (originalCleanup) originalCleanup();
    };
  });
}

// Standalone closeModal function for external use
function closeModalBySelector(selector) {
  const overlay = document.querySelector(selector);
  if (overlay && overlay._cleanup) {
    overlay._cleanup();
    overlay.remove();
  }
}
