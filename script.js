const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const menuButton = $('.menu-toggle');
const nav = $('#main-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const badgeLabels = {hit:'Хит', newbie:'Для новичков', fest:'Фестиваль', gastro:'Гастро-треккинг', author_route:'Авторский маршрут'};
const scenery = index => {
  const palettes = [
    ['#f3c38e','#6e9a9a','#254e45'], ['#b9d7e8','#8eaa9a','#254e45'],
    ['#f6bd79','#bd7950','#24483d'], ['#c6dbe2','#8ba9a0','#1f4c43'],
    ['#e7c5a0','#93a89a','#284e42'], ['#d9d9c2','#7f9d89','#23473d'],
    ['#f1c9a1','#9db8b0','#254b40'], ['#b7d1d8','#8b9f88','#1b443a']
  ][index % 8];
  return `<svg viewBox="0 0 480 280" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Иллюстративный пейзаж Южного Урала; фотография маршрута появится после выезда"><defs><linearGradient id="sky-${index}" x2="0" y2="1"><stop stop-color="${palettes[0]}"/><stop offset="1" stop-color="#f5e8d3"/></linearGradient><linearGradient id="hill-${index}" x2="0" y2="1"><stop stop-color="${palettes[1]}"/><stop offset="1" stop-color="${palettes[2]}"/></linearGradient></defs><rect width="480" height="280" fill="url(#sky-${index})"/><circle cx="${330-(index%3)*45}" cy="64" r="26" fill="#ffdc91" opacity=".95"/><path d="M0 155 68 100 116 135 195 48 254 125 327 66 392 128 440 86 480 119V280H0Z" fill="#a7b7aa" opacity=".8"/><path d="M0 184 77 125 137 169 222 93 290 164 366 113 430 162 480 132V280H0Z" fill="${palettes[1]}"/><path d="M0 218 84 161 147 208 233 143 310 213 386 160 445 207 480 186V280H0Z" fill="url(#hill-${index})"/><path d="M0 264Q95 218 170 250T325 243T480 237V280H0Z" fill="${palettes[2]}"/><g fill="#183e34" opacity=".82"><path d="M34 280l16-49 17 49m19 0 13-39 14 39m258 0 17-49 18 49m19 0 13-37 14 37"/></g><path d="M0 278Q130 260 190 270T350 265T480 272" fill="none" stroke="#d9bd89" stroke-width="3" opacity=".8"/></svg>`;
};
function card(t, i) {
  const title = escapeHTML(t.title);
  const format = escapeHTML(t.format);
  const duration = escapeHTML(t.duration);
  const difficulty = escapeHTML(t.difficulty);
  const distance = t.distance_status === 'unconfirmed' ? 'Дистанция уточняется' : escapeHTML(t.distance);
  const price = t.price_status === 'confirmed' && Number.isFinite(t.price_from) ? `от ${t.price_from.toLocaleString('ru-RU')} ₽` : 'Стоимость по запросу';
  return `<article class="tour-card"><div class="tour-visual">${scenery(i)}<span class="badge ${escapeHTML(t.badge)}">${badgeLabels[t.badge] || 'Маршрут'}</span></div><div class="tour-body"><h3>${title}</h3><p class="tour-meta">${format} · ${duration}</p><div class="tour-specs"><span><svg class="mini-icon" aria-hidden="true"><use href="assets/icons.svg#mountain"/></svg>${distance}</span><span><svg class="mini-icon" aria-hidden="true"><use href="assets/icons.svg#people"/></svg>Сложность: ${difficulty}</span></div><p class="tour-price">${price}</p><button class="button-outline tour-details" type="button" data-tour="${escapeHTML(t.id)}">Подробнее <span aria-hidden="true">→</span></button></div></article>`;
}

let tours = [];
const featuredGrid = $('#tour-grid');
const allGrid = $('#all-tour-grid');
const allToursPanel = $('#all-tours');
const toggleAllTours = $('#toggle-all-tours');
function bindTourButtons(root = document) {
  $$('.tour-details', root).forEach(button => button.addEventListener('click', () => showTour(button.dataset.tour)));
}
fetch('data/tours.json').then(response => {
  if (!response.ok) throw new Error('Не удалось загрузить каталог');
  return response.json();
}).then(data => {
  if (!Array.isArray(data)) throw new Error('Неверный формат каталога');
  tours = data;
  featuredGrid.innerHTML = data.slice(0, 4).map(card).join('');
  allGrid.innerHTML = data.slice(4).map((tour, index) => card(tour, index + 4)).join('');
  bindTourButtons();
}).catch(() => {
  featuredGrid.innerHTML = '<p class="catalog-error">Каталог временно не загрузился. Обновите страницу или свяжитесь с организатором позже.</p>';
});

toggleAllTours?.addEventListener('click', () => {
  const open = toggleAllTours.getAttribute('aria-expanded') !== 'true';
  toggleAllTours.setAttribute('aria-expanded', String(open));
  allToursPanel.hidden = !open;
  toggleAllTours.innerHTML = open ? 'Скрыть дополнительные туры <span aria-hidden="true">↑</span>' : 'Все туры <span aria-hidden="true">→</span>';
  if (open) allToursPanel.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
});

const dialog = $('#tour-dialog');
function showTour(id) {
  const tour = tours.find(item => item.id === id);
  if (!tour) return;
  const list = values => values.map(value => `<li>${escapeHTML(value)}</li>`).join('');
  const distance = tour.distance_status === 'unconfirmed' ? 'уточняется по треку' : escapeHTML(tour.distance);
  const price = tour.price_status === 'confirmed' && Number.isFinite(tour.price_from) ? `от ${tour.price_from.toLocaleString('ru-RU')} ₽` : 'по запросу';
  $('#dialog-content').innerHTML = `<p class="eyebrow">${badgeLabels[tour.badge] || 'Маршрут'}</p><h2>${escapeHTML(tour.title)}</h2><p>${escapeHTML(tour.format)} · ${escapeHTML(tour.duration)}</p><p><strong>Сложность:</strong> ${escapeHTML(tour.difficulty)}</p><p><strong>Дистанция:</strong> ${distance}</p><p><strong>Стоимость:</strong> ${price}</p><h3>Входит / предварительно</h3><ul>${list(tour.includes)}</ul><h3>Не входит / уточняется</h3><ul>${list(tour.excludes)}</ul><h3>Сезон и ограничения</h3><p>${escapeHTML(tour.season)}. ${tour.id === 'kapova-honey' ? 'Доступ в зал с рисунками не гарантируется и зависит от действующего режима посещения.' : ''}</p><p class="modal-note">Это предварительная информация, не подтверждение бронирования. Состав программы согласуется до оплаты.</p>`;
  $('#dialog-cta').href = '#contacts';
  dialog.showModal();
}
$('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
$('#dialog-cta')?.addEventListener('click', () => dialog.close());


// Static contact cards: no forms, no collection of personal data on GitHub Pages.
(() => {
  const config = window.SITE_CONTACTS || {};
  const root = document.querySelector('#contact-options');
  if (!root) return;
  const items = [
    ['email', 'Электронная почта', '@', value => `mailto:${value}`],
    ['phone', 'Телефон', '☎', value => `tel:${value.replace(/[^+0-9]/g, '')}`],
    ['telegram', 'Telegram', 'TG', value => value],
    ['vk', 'ВКонтакте', 'VK', value => value],
    ['max', 'MAX', 'MAX', value => value]
  ];
  root.innerHTML = items.map(([key, label, icon, hrefFor]) => {
    const value = String(config[key] || '').trim();
    const safeHref = value && (key === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : key === 'phone' ? value.replace(/\D/g, '').length >= 10 : /^https:\/\//i.test(value));
    const href = safeHref ? hrefFor(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;') : '#contacts';
    const detail = safeHref ? (key === 'email' || key === 'phone' ? value : 'Открыть официальный контакт') : 'Добавить контакт в contacts.js';
    return `<a class="contact-link${safeHref ? '' : ' is-unset'}" href="${href}" ${safeHref && key !== 'email' && key !== 'phone' ? 'target="_blank" rel="noopener noreferrer"' : ''} ${safeHref ? '' : 'aria-disabled="true"'}><span aria-hidden="true">${icon}</span><span>${label}<small>${detail}</small></span></a>`;
  }).join('');
})();
