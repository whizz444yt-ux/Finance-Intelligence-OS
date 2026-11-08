(() => {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mobileNav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
})();
