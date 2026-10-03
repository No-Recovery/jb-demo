/* ─────────────────────────────────────────────────────────────
   Dopamine — визуальная демонстрация
   Пошаговый сценарий: блокировка → джейлбрейк → пакеты → менеджер.
   ───────────────────────────────────────────────────────────── */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ── Данные ────────────────────────────────────────────── */

const BASE_APPS = [
  { icon: 'i-camera',  label: 'Камера',        grad: 'linear-gradient(160deg,#5b6474,#2b2f3a)' },
  { icon: 'i-heart',   label: 'Фото',          grad: 'linear-gradient(160deg,#f472b6,#db2777)' },
  { icon: 'i-mail',    label: 'Почта',         grad: 'linear-gradient(160deg,#38bdf8,#0284c7)' },
  { icon: 'i-timer',   label: 'Часы',          grad: 'linear-gradient(160deg,#1f2937,#000)' },
  { icon: 'i-maps',    label: 'Карты',         grad: 'linear-gradient(160deg,#4ade80,#15803d)' },
  { icon: 'i-notes',   label: 'Заметки',       grad: 'linear-gradient(160deg,#fde047,#f59e0b)' },
  { icon: 'i-weather', label: 'Погода',        grad: 'linear-gradient(160deg,#60a5fa,#1e3a8a)' },
  { icon: 'i-gear',    label: 'Настройки',     grad: 'linear-gradient(160deg,#8e8e93,#3a3a3c)' },
  { icon: 'i-drop',    label: 'Dopamine',      grad: 'linear-gradient(150deg,#ff2d78,#8b5cf6 52%,#22d3ee)', go: 'dopamine' },
  { icon: 'i-shield',  label: 'Профили',       grad: 'linear-gradient(160deg,#78716c,#292524)' },
];

const DOCK_APPS = [
  { icon: 'i-phone', label: 'Телефон',   grad: 'linear-gradient(160deg,#4ade80,#16a34a)' },
  { icon: 'i-grid',  label: 'Safari',    grad: 'linear-gradient(160deg,#e0f2fe,#7dd3fc)' },
  { icon: 'i-heart', label: 'Сообщения', grad: 'linear-gradient(160deg,#4ade80,#15803d)' },
  { icon: 'i-music', label: 'Музыка',    grad: 'linear-gradient(160deg,#fb7185,#e11d48)' },
];

const PACKAGES = [
  { id: 'sileo',    name: 'Sileo',       kind: 'Менеджер пакетов', desc: 'Менеджер с поддержкой APT',    icon: 'i-box',    grad: 'linear-gradient(150deg,#22d3ee,#0284c7)', hasIcon: true,  on: true  },
  { id: 'zebra',    name: 'Zebra',       kind: 'Менеджер пакетов', desc: 'Очень быстрый менеджер',        icon: 'i-grid',   grad: 'linear-gradient(150deg,#fbbf24,#ea580c)', hasIcon: true,  on: false },
  { id: 'filza',    name: 'Filza',       kind: 'Файловый менеджер', desc: 'Доступ к файловой системе',    icon: 'i-folder', grad: 'linear-gradient(150deg,#34d399,#0f766e)', hasIcon: true,  on: false },
  { id: 'abypass',  name: 'A-Bypass',    kind: 'Твик', desc: 'Обход проверки целостности',                icon: 'i-shield', grad: 'linear-gradient(150deg,#a78bfa,#6d28d9)', hasIcon: false, on: false },
  { id: 'icleaner', name: 'iCleaner',    kind: 'Твик', desc: 'Удаление неиспользуемых пакетов',          icon: 'i-trash',  grad: 'linear-gradient(150deg,#60a5fa,#1d4ed8)', hasIcon: false, on: false },
  { id: 'v2ray',    name: 'V2RayTunnel', kind: 'Твик', desc: 'Прокси и сетевые правила',                 icon: 'i-cloud',  grad: 'linear-gradient(150deg,#f472b6,#be123c)', hasIcon: false, on: false },
  { id: 'wipecode', name: 'WipeCode',    kind: 'Твик', desc: 'Пароль на приложения и стирание данных',   icon: 'i-power',  grad: 'linear-gradient(150deg,#ff2d78,#8b5cf6)', hasIcon: false, on: true  },
];

const JB_LOG = [
  ['[boot] ', 'подготовка окружения…'],
  ['[boot] ', 'поиск эксплойта ядра (KFD)… ', 'ok'],
  ['[boot] ', 'обход PPL… ', 'ok'],
  ['[boot] ', 'патч amfid… ', 'ok'],
  ['*', 'монтирование /var/jb'],
  ['[pre] ', 'запуск libhooker/pretender'],
  ['[pre] ', 'установка launchd_sim'],
  ['[post] ', 'сброс кэшей демонов'],
  ['[ok] ', 'джейлбрейк завершён'],
];

/* ── Шаги ──────────────────────────────────────────────── */

const STEPS = [
  { id: 'lock',       screen: 'lock',      label: 'Блокировка',   note: 'Стартовый экран. Нажмите «Далее», чтобы разблокировать.' },
  { id: 'home',       screen: 'home',      label: 'Рабочий стол', note: 'Обычный домашний экран iOS. Значок Dopamine уже установлен.' },
  { id: 'dopamine',   screen: 'dopamine',  label: 'Dopamine',      note: 'Информация об устройстве и кнопка «Джейлбрейк».' },
  { id: 'jbreaking',  screen: 'jbreaking', label: 'Джейлбрейк',    note: 'Идёт эксплойт и подсистема rootless. Ждите завершения.' },
  { id: 'jbdone',     screen: 'jbdone',    label: 'Готово',        note: 'Подсистема /var/jb поднята. Дальше — выбор пакетов.' },
  { id: 'packages',   screen: 'packages',  label: 'Пакеты',        note: 'Отметьте менеджер пакетов и нужные твики, затем «Далее».' },
  { id: 'installing', screen: 'installing',label: 'Установка',     note: 'Пакеты разрешаются, скачиваются и устанавливаются.' },
  { id: 'newicons',   screen: 'home',      label: 'Новые иконки',  note: 'Выбранное ПО появилось на рабочем столе.' },
  { id: 'manager',    screen: 'manager',   label: 'Менеджер',      note: 'Открыт менеджер пакетов со списком установленного.' },
];

/* ── Состояние ─────────────────────────────────────────── */

let current   = 0;
let timers    = [];

const screenEl = $('#screen');
const logEl     = $('#jbLog');
const barEl     = $('#jbBar');
const pctEl     = $('#jbPercent');
const prevBtn   = $('#prev');
const nextBtn   = $('#next');
const noteEl    = $('#panelNote');
const stepsEl   = $('#steps');

const wait = ms => new Promise(r => timers.push(setTimeout(r, ms)));
function clearTimers() { timers.forEach(clearTimeout); timers = []; }

/* ── Отрисовка иконок ──────────────────────────────────── */

function iconHTML({ icon, grad, label, go }) {
  const el = document.createElement('div');
  el.className = 'icon' + (go ? ' icon--tap' : '');
  if (go) el.dataset.goto = go;
  el.innerHTML =
    `<div class="icon__box" style="background:${grad}">
       <svg class="ic"><use href="#${icon}"/></svg>
     </div>
     <div class="icon__label">${label}</div>`;
  return el;
}

function renderHome() {
  const grid = $('#homeGrid');
  grid.innerHTML = '';
  BASE_APPS.forEach(a => grid.appendChild(iconHTML(a)));
}

function renderDock() {
  const dock = $('#homeDock');
  dock.innerHTML = '';
  DOCK_APPS.forEach(a => dock.appendChild(iconHTML(a)));
}

function selected() {
  return PACKAGES.filter(p => p.on);
}

function managerPkg() {
  return selected().find(p => p.kind === 'Менеджер пакетов') || null;
}

/* Иконки появившихся приложений добавляются в конец сетки */
function ensureInstalledIcons() {
  const grid = $('#homeGrid');
  if (grid.querySelector('.icon--new')) return;
  selected()
    .filter(p => p.hasIcon)
    .forEach((p, i) => {
      const el = iconHTML({ icon: p.icon, grad: p.grad, label: p.name });
      el.classList.add('icon--new');
      el.dataset.pkg = p.id;
      grid.appendChild(el);
      setTimeout(() => el.classList.add('is-in'), 120 * (i + 1));
    });
}

function removeInstalledIcons() {
  $$('#homeGrid .icon--new').forEach(el => el.remove());
}

/* ── Список пакетов ────────────────────────────────────── */

function renderPackages() {
  const ul = $('#plist');
  ul.innerHTML = '';
  PACKAGES.forEach(p => {
    const li = document.createElement('li');
    li.className = 'pkgrow' + (p.on ? ' is-on' : '');
    li.dataset.pkg = p.id;
    li.innerHTML =
      `<div class="pkgrow__icon" style="background:${p.grad}">
         <svg class="ic"><use href="#${p.icon}"/></svg>
       </div>
       <div class="pkgrow__body">
         <div class="pkgrow__name">${p.name}</div>
         <div class="pkgrow__desc">${p.desc}</div>
       </div>
       <div class="pkgrow__kind${p.kind === 'Менеджер пакетов' ? ' pkgrow__kind--mgr' : ''}">${p.kind}</div>
       <div class="pkgrow__check"><svg class="ic"><use href="#i-check"/></svg></div>`;
    li.addEventListener('click', () => {
      p.on = !p.on;
      li.classList.toggle('is-on', p.on);
      updatePickerCount();
    });
    ul.appendChild(li);
  });
  updatePickerCount();
}

function updatePickerCount() {
  const n = selected().length;
  const hasMgr = !!managerPkg();
  $('#pickerCount').textContent = n ? `${n} выбрано` : 'Ничего не выбрано';
  $('#pickerNote').textContent = hasMgr
    ? 'Отметьте нужные пакеты'
    : 'Выберите хотя бы один менеджер пакетов';
}

/* ── Экран менеджера ────────────────────────────────────── */

function renderManager() {
  const mgr = managerPkg();
  const list = $('#pkglist');
  $('#managerName').textContent = mgr ? mgr.name : 'Пакеты';
  list.innerHTML = '';
  selected().forEach(p => {
    const li = document.createElement('li');
    li.className = 'pkgrow pkgrow--flat' + (p.on ? ' is-on' : '');
    li.innerHTML =
      `<div class="pkgrow__icon" style="background:${p.grad}">
         <svg class="ic"><use href="#${p.icon}"/></svg>
       </div>
       <div class="pkgrow__body">
         <div class="pkgrow__name">${p.name}</div>
         <div class="pkgrow__desc">${p.desc}</div>
       </div>
       <div class="pkgrow__check"><svg class="ic"><use href="#i-check"/></svg></div>`;
    list.appendChild(li);
  });
}

/* ── Анимация джейлбрейка ──────────────────────────────── */

async function playJailbreak() {
  lockNav(true);
  logEl.innerHTML = '';
  barEl.style.width = '0%';
  pctEl.textContent = '0%';

  for (let i = 0; i < JB_LOG.length; i++) {
    const [cls, text, mark] = JB_LOG[i];
    await wait(i === 0 ? 500 : 620);

    const line = document.createElement('span');
    line.className = 'log-line';
    line.innerHTML = cls === '*'
      ? `<i>${text}</i>`
      : `<b>${cls}</b>${text}${mark ? `<b>${mark}</b>` : ''}`;
    logEl.appendChild(line);

    const pct = Math.round(((i + 1) / JB_LOG.length) * 100);
    barEl.style.width = pct + '%';
    pctEl.textContent = pct + '%';
  }

  await wait(700);
  lockNav(false);
}

/* ── Анимация установки ────────────────────────────────── */

async function playInstall() {
  const pkgs = selected();
  const list = $('#instList');
  const bar  = $('#instBar');
  const head = $('#instTitle');
  const sub  = $('#instSub');

  lockNav(true);
  list.innerHTML = '';
  bar.style.width = '0%';

  pkgs.forEach(p => {
    const li = document.createElement('li');
    li.className = 'instrow';
    li.dataset.pkg = p.id;
    li.innerHTML =
      `<div class="instrow__icon" style="background:${p.grad}">
         <svg class="ic"><use href="#${p.icon}"/></svg>
       </div>
       <div class="instrow__name">${p.name}</div>
       <div class="instrow__state">ожидание</div>`;
    list.appendChild(li);
  });

  if (!pkgs.length) {
    head.textContent = 'Нечего устанавливать';
    sub.textContent = '0 из 0';
    await wait(900);
    lockNav(false);
    return;
  }

  const phases = [
    ['поиск версии', 420],
    ['загрузка',     620],
    ['установка',    700],
  ];
  const stepsTotal = pkgs.length * phases.length;

  for (let i = 0; i < pkgs.length; i++) {
    const row   = list.querySelector(`[data-pkg="${pkgs[i].id}"]`);
    const state = row.querySelector('.instrow__state');
    head.textContent = pkgs[i].name;
    sub.textContent  = `${i + 1} из ${pkgs.length}`;

    row.classList.add('is-active');
    for (let p = 0; p < phases.length; p++) {
      state.textContent = phases[p][0];
      bar.style.width = (((i * phases.length + p) / stepsTotal) * 100).toFixed(1) + '%';
      await wait(phases[p][1]);
    }

    row.classList.remove('is-active');
    row.classList.add('is-done');
    state.textContent = 'установлено';
    bar.style.width = ((i + 1) / pkgs.length * 100).toFixed(1) + '%';
  }

  head.textContent = 'Готово';
  sub.textContent  = `${pkgs.length} из ${pkgs.length}`;
  await wait(600);
  lockNav(false);
}

/* ── Навигация ─────────────────────────────────────────── */

function lockNav(busy) {
  prevBtn.disabled = busy;
  nextBtn.disabled = busy;
  prevBtn.style.opacity = busy ? .4 : '';
  nextBtn.style.opacity = busy ? .4 : '';
}

function indexOfStep(id) {
  return STEPS.findIndex(s => s.id === id);
}

/* Разбор адреса: #3 или #jbdone — открыть нужный шаг напрямую */
function stepFromHash() {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')).trim().toLowerCase();
  if (!h) return null;
  if (/^\d+$/.test(h)) {
    const n = parseInt(h, 10) - 1;
    return (n >= 0 && n < STEPS.length) ? n : null;
  }
  return indexOfStep(h);
}

function showScreen(name) {
  $$('.screen').forEach(el => el.classList.toggle('is-active', el.dataset.screen === name));
  screenEl.classList.toggle('is-home', name === 'home');
}

function renderSteps() {
  stepsEl.innerHTML = '';
  STEPS.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'stepchip' + (i === current ? ' is-on' : (i < current ? ' is-done' : ''));
    b.innerHTML = `<span class="stepchip__n">${i + 1}</span>${s.label}`;
    b.addEventListener('click', () => goTo(i));
    stepsEl.appendChild(b);
  });
}

function goTo(i, skipHash) {
  clearTimers();
  current = Math.max(0, Math.min(STEPS.length - 1, i));
  const step = STEPS[current];

  if (!skipHash) history.replaceState(null, '', '#' + step.id);

  showScreen(step.screen);
  noteEl.textContent = step.note;
  prevBtn.disabled = false;
  nextBtn.textContent = current === STEPS.length - 1 ? 'Заново' : 'Далее';
  renderSteps();

  if (step.id === 'jbreaking')  playJailbreak();
  if (step.id === 'installing') playInstall();
  if (step.id === 'newicons')  ensureInstalledIcons();
  if (step.id === 'manager')   { ensureInstalledIcons(); renderManager(); }
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => {
  if (current === STEPS.length - 1) { resetAll(); return; }
  goTo(current + 1);
});

function resetAll() {
  clearTimers();
  removeInstalledIcons();
  logEl.innerHTML = '';
  barEl.style.width = '0%';
  pctEl.textContent = '0%';
  PACKAGES.forEach(p => { p.on = (p.id === 'sileo' || p.id === 'wipecode'); });
  renderPackages();
  goTo(0);
}

/* Клики внутри экрана: [data-goto] ведёт на шаг с таким id */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-goto]');
  if (!el) return;
  const i = indexOfStep(el.dataset.goto);
  if (i >= 0) goTo(i);
});

/* ── Масштаб под окно ──────────────────────────────────── */

function fit() {
  const avail = window.innerHeight - 240;
  const need  = 844 + 24 + 30;
  const s = Math.max(0.5, Math.min(1, avail / need));
  document.documentElement.style.setProperty('--scale', s.toFixed(3));
}
window.addEventListener('resize', fit);

/* ── Старт ─────────────────────────────────────────────── */

function showFatal(msg) {
  document.documentElement.dataset.jsError = msg;
  let box = $('#fatal');
  if (!box) {
    box = document.createElement('pre');
    box.id = 'fatal';
    box.className = 'fatal';
    document.body.appendChild(box);
  }
  box.textContent = 'Ошибка скрипта: ' + msg;
}

window.addEventListener('error', e => showFatal(e.message));

renderHome();
renderDock();
renderPackages();
fit();

const start = stepFromHash();
goTo(start === null ? 0 : start, true);

window.addEventListener('hashchange', () => {
  const i = stepFromHash();
  if (i !== null && i !== current) goTo(i, true);
});