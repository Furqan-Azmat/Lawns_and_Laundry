document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('testBtn');

  btn.addEventListener('click', () => {
    const isRed = btn.classList.toggle('red');
    // Keep accessibility in sync
    btn.setAttribute('aria-pressed', String(isRed));
  });
});
