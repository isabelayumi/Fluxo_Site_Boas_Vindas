const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeColor = document.querySelector('[data-theme-color]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const sections = [...document.querySelectorAll('[data-section]')];
const revealItems = document.querySelectorAll('.reveal');
const teamCards = [...document.querySelectorAll('[data-team-card]')];
const contactForm = document.querySelector('[data-contact-form]');
const contactFeedback = document.querySelector('[data-contact-feedback]');

const setTheme = (theme, persist = true) => {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  const isLight = nextTheme === 'light';

  document.documentElement.dataset.theme = nextTheme;
  themeToggle?.setAttribute('aria-pressed', String(isLight));
  themeToggle?.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
  if (themeLabel) themeLabel.textContent = isLight ? 'Escuro' : 'Claro';
  themeColor?.setAttribute('content', isLight ? '#f6f6fc' : '#070714');

  if (!persist) return;
  try {
    localStorage.setItem('fluxo-theme', nextTheme);
  } catch {
    // O tema continua funcionando mesmo quando o armazenamento está indisponível.
  }
};

setTheme(document.documentElement.dataset.theme, false);

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const applyTheme = () => setTheme(nextTheme);

  if (document.startViewTransition && !reduceMotion) {
    document.startViewTransition(applyTheme);
    return;
  }

  applyTheme();
});

const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
};

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

document.querySelectorAll('.is-disabled').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const subject = String(data.get('subject') || '').trim();
  const message = String(data.get('message') || '').trim();
  const emailSubject = `Contato pelo site FLUXO — ${subject}`;
  const emailBody = [
    'Olá, equipe FLUXO!',
    '',
    message,
    '',
    `Nome: ${name}`,
    `E-mail para retorno: ${email}`,
  ].join('\n');
  const mailto = `mailto:isabelayumi3007@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  contactForm.dataset.preparedMailto = mailto;

  if (contactFeedback) {
    contactFeedback.textContent = 'Mensagem preparada. Abrindo seu aplicativo de e-mail…';
    contactFeedback.classList.add('is-ready');
  }

  window.location.href = mailto;
});

const setTeamCardState = (card, shouldOpen) => {
  card.classList.toggle('is-open', shouldOpen);
  card.setAttribute('aria-expanded', String(shouldOpen));
  card.querySelector('.team-details')?.setAttribute('aria-hidden', String(!shouldOpen));
};

teamCards.forEach((card) => {
  const toggleCard = () => {
    const shouldOpen = !card.classList.contains('is-open');
    teamCards.forEach((item) => setTeamCardState(item, item === card && shouldOpen));
  };

  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    toggleCard();
  });

  card.addEventListener('keydown', (event) => {
    if (event.target.closest('a')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleCard();
  });

  card.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty('--pointer-x', `${x * 100}%`);
    card.style.setProperty('--pointer-y', `${y * 100}%`);
    card.style.setProperty('--tilt-x', `${(0.5 - y) * 3.5}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 3.5}deg`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--pointer-x', '50%');
    card.style.setProperty('--pointer-y', '50%');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeMenu();
  teamCards.forEach((card) => setTeamCardState(card, false));
});
