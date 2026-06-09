'use strict';

function openModal(opts) {
  if (document.querySelector('.modal-overlay')) return null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="${opts.title || ''}">
      <div class="modal-header">
        <h2 class="modal-title">${opts.title || ''}</h2>
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

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeModal(overlay, onKeyDown);
  };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay, onKeyDown);
  });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
    if (opts.onCancel) opts.onCancel();
  });
  const confirmBtn = overlay.querySelector('[data-modal-confirm]');
  if (confirmBtn && opts.onConfirm) {
    confirmBtn.addEventListener('click', () => opts.onConfirm(overlay));
  }

  return overlay;
}

function openConfirmModal(message, title = 'Konfirmasi') {
  return new Promise((resolve) => {
    const overlay = openModal({
      title: title,
      bodyHtml: `<div style="padding:8px 0 18px;font-size:0.95rem;line-height:1.5">${message}</div>`,
      confirmText: 'Ya, Hapus',
      onConfirm: (o) => { closeModal(o); resolve(true); },
      onCancel: () => resolve(false)
    });
    if (!overlay) { resolve(false); return; }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { closeModal(overlay, onKeyDown); resolve(false); }
    };
    document.addEventListener('keydown', onKeyDown);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { closeModal(overlay, onKeyDown); resolve(false); }
    });
    overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
      closeModal(overlay, onKeyDown); resolve(false);
    });
  });
}
