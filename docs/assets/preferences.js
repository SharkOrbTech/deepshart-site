(() => {
  const root = document.documentElement;
  const media = matchMedia('(prefers-color-scheme: dark)');
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; } catch { return false; }
    },
  };

  const savedTheme = storage.get('deepshart-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  const initialLanguage = (requestedLanguage === 'en' || requestedLanguage === 'zh' ? requestedLanguage : null) ||
    storage.get('deepshart-language') ||
    ((navigator.languages?.[0] || navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
  if (root.hasAttribute('data-auto-language') && initialLanguage === 'zh') {
    const alternate = new URL(root.dataset.alternate, location.href);
    alternate.search = location.search;
    alternate.hash = location.hash;
    location.replace(alternate);
  }

  addEventListener('DOMContentLoaded', () => {
    const language = document.querySelector('[data-set-language]');
    language?.addEventListener('click', (event) => {
      const selected = language.dataset.setLanguage;
      if (storage.set('deepshart-language', selected)) return;
      event.preventDefault();
      const destination = new URL(language.href);
      destination.searchParams.set('lang', selected);
      location.assign(destination);
    });

    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;
    const currentTheme = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
    const updateLabel = () => {
      toggle.setAttribute('aria-label', currentTheme() === 'dark' ? toggle.dataset.light : toggle.dataset.dark);
    };
    toggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      storage.set('deepshart-theme', next);
      updateLabel();
    });
    media.addEventListener('change', updateLabel);
    updateLabel();
    toggle.hidden = false;
  });
})();

(() => {
  addEventListener('DOMContentLoaded', () => {
    const dialog = document.querySelector('.preview-dialog');
    if (dialog?.showModal) {
      const image = dialog.querySelector('img');
      const title = dialog.querySelector('h2');
      let opener;
      for (const button of document.querySelectorAll('[data-preview]')) {
        button.disabled = false;
        button.addEventListener('click', () => {
          const screen = [...button.querySelectorAll('img')].find(img => img.offsetWidth > 0);
          if (!screen) return;
          opener = button;
          title.textContent = button.dataset.preview;
          image.src = screen.currentSrc;
          image.alt = screen.alt;
          dialog.showModal();
        });
      }
      let closing = false;
      const close = () => {
        if (closing || !dialog.open) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          dialog.close();
          return;
        }
        closing = true;
        dialog.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(5px)' }], {
          duration: 150,
          easing: 'ease-in',
        }).finished.then(() => {
          closing = false;
          dialog.close();
        });
      };
      dialog.querySelector('.preview-close').addEventListener('click', close);
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        close();
      });
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) close();
      });
      dialog.addEventListener('close', () => opener?.focus());
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        const items = target.querySelectorAll('li');
        items.forEach((item, index) => {
          item.animate([{ opacity: .35, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], {
            duration: 470,
            delay: 45 * index,
            easing: 'cubic-bezier(.2,.65,.3,1)',
            fill: 'backwards',
          });
        });
      }
    }, { threshold: .22 });
    for (const section of document.querySelectorAll('[data-reveal]')) observer.observe(section);
  });
})();
