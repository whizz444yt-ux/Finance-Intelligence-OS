(() => {
  const shell = document.querySelector('[data-os-shell]');
  if (!shell) return;
  const sidebar = document.getElementById('appSidebar');
  const toggle = document.getElementById('sidebarToggle');
  const scrim = document.getElementById('sidebarScrim');
  if (!sidebar || !toggle) return;

  const COLLAPSED_KEY = 'fios.app-sidebar.collapsed.v1';
  const THEME_KEY = 'fios.theme.preference.v1';
  const mobileQuery = window.matchMedia('(max-width: 850px)');
  let collapsed = false, drawerOpen = false, theme = 'dark';
  try {
    collapsed = localStorage.getItem(COLLAPSED_KEY) === '1';
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme;
  } catch (_) {}

  const themeButton = document.getElementById('osThemeToggle');
  const useGlobalTheme = !document.body.classList.contains('os-ict-terminal') || !!themeButton;
  function renderTheme() {
    if (useGlobalTheme) {
      document.body.classList.toggle('os-light', theme === 'light');
      document.body.classList.toggle('os-dark', theme !== 'light');
    }
    if (themeButton) {
      themeButton.textContent = theme === 'dark' ? '☼' : '◐';
      themeButton.setAttribute('aria-pressed', String(theme === 'light'));
      themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      themeButton.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }
  }
  themeButton?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    renderTheme();
  });

  function renderNav() {
    const mobile = mobileQuery.matches;
    shell.classList.toggle('sidebar-collapsed', !mobile && collapsed);
    shell.classList.toggle('drawer-open', mobile && drawerOpen);
    const expanded = mobile ? drawerOpen : !collapsed;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', mobile
      ? (drawerOpen ? 'Close navigation' : 'Open navigation')
      : (collapsed ? 'Expand navigation' : 'Collapse navigation'));
    if (scrim) {
      scrim.hidden = !(mobile && drawerOpen);
      scrim.setAttribute('aria-hidden', String(!(mobile && drawerOpen)));
    }
    if (mobile) {
      sidebar.inert = !drawerOpen;
      sidebar.setAttribute('aria-hidden', String(!drawerOpen));
    } else {
      sidebar.inert = false;
      sidebar.removeAttribute('aria-hidden');
    }
  }

  toggle.addEventListener('click', () => {
    if (mobileQuery.matches) drawerOpen = !drawerOpen;
    else {
      collapsed = !collapsed;
      try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (_) {}
    }
    renderNav();
    if (mobileQuery.matches && drawerOpen) {
      sidebar.querySelector('a[href],button:not([disabled])')?.focus();
    } else if (mobileQuery.matches) toggle.focus();
  });
  scrim?.addEventListener('click', () => { drawerOpen = false; renderNav(); toggle.focus(); });
  sidebar.addEventListener('click', event => {
    if (mobileQuery.matches && event.target.closest('a')) { drawerOpen = false; renderNav(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawerOpen) { drawerOpen = false; renderNav(); toggle.focus(); return; }
    if (event.key === 'Tab' && drawerOpen && mobileQuery.matches) {
      const items = [...sidebar.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  mobileQuery.addEventListener?.('change', () => { drawerOpen = false; renderNav(); });
  renderTheme();
  renderNav();
})();
