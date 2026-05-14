(() => {
  function modalSelector(suffix) {
    return '[fs-modal-element="modal' + suffix + '"]';
  }

  function setModalDisplay(modal, value) {
    if (!modal) return;
    modal.style.display = value;
    document.body.style.overflow = value === 'flex' ? 'hidden' : '';
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[fs-modal-element^="open"]');
    if (opener) {
      const suffix = opener.getAttribute('fs-modal-element').replace(/^open/, '');
      const modal = document.querySelector(modalSelector(suffix));
      if (modal) {
        event.preventDefault();
        setModalDisplay(modal, 'flex');
      }
      return;
    }

    const closer = event.target.closest('[fs-modal-element^="close"]');
    if (closer) {
      const suffix = closer.getAttribute('fs-modal-element').replace(/^close/, '');
      const modal = document.querySelector(modalSelector(suffix));
      if (modal) {
        event.preventDefault();
        setModalDisplay(modal, 'none');
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.fs_modal-1_popup-2').forEach((modal) => {
      setModalDisplay(modal, 'none');
    });
  });
})();
