const html     = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const themeIco = document.getElementById('themeIco');

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  themeIco.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
  localStorage.setItem('sv-theme', t);
}

themeBtn.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

const saved = localStorage.getItem('sv-theme');
if (saved) applyTheme(saved);

const installBtn = document.getElementById('installBtn');
installBtn.addEventListener('click', () => {
  const installed = installBtn.dataset.installed === 'true';
  installBtn.dataset.installed = installed ? 'false' : 'true';
  installBtn.textContent = installed ? 'СКАЧАТЬ' : '✓ СКАЧАНО';
  installBtn.classList.toggle('installed', !installed);
});

const tabs = {
  player:    { title:'На игроке',  icon:'person',     items:[{n:'Боксы',on:true},{n:'Джампики',on:true},{n:'Китайская шляпа',on:true},{n:'Таргет рендер',on:true},{n:'Хит бабл',on:false}] },
  world:     { title:'В мире',     icon:'public',     items:[{n:'Чамсы',on:true},{n:'Трейсеры',on:false},{n:'Снаряды',on:true},{n:'Частицы',on:true},{n:'Блок оверлей',on:false},{n:'Дроп рендер',on:true},{n:'Скелетон',on:false}] },
  utils:     { title:'Утилиты',    icon:'build',      items:[{n:'Авто спринт',on:true},{n:'Авто тул',on:false},{n:'Фуллбрайт',on:true},{n:'Ноу оверлей',on:true},{n:'Координаты',on:true},{n:'Таймер',on:false}] },
  other:     { title:'Остальное',  icon:'more_horiz', items:[{n:'Антибот',on:false},{n:'Прокси',on:false},{n:'Дебаг мод',on:true},{n:'Ник хайдер',on:true}] },
  interface: { title:'Интерфейс', icon:'dashboard',  items:[{n:'Массив лист',on:true},{n:'Ватермарка',on:true},{n:'Кейбинды',on:false},{n:'Нотификации',on:true},{n:'Хотбар',on:true},{n:'Скорборд',on:false},{n:'Табулист',on:true},{n:'Кроссхейр',on:true}] },
  themes:    { title:'Темы',       icon:'palette',    items:[{n:'Стандарт',on:true},{n:'Минимализм',on:false},{n:'Неон',on:false},{n:'Ретро',on:false}] },
};

function buildGui(key) {
  const d    = tabs[key];
  const body = document.getElementById('gwBody');
  const sec  = document.getElementById('gwSec');
  const list = document.getElementById('gwItems');
  const scrl = body.querySelector('.gw-scroll');

  body.style.transition = 'opacity .18s ease, transform .18s ease';
  body.classList.replace('fin','fout');

  setTimeout(() => {
    sec.textContent = d.title;
    list.innerHTML  = '';
    d.items.forEach(it => {
      const el = document.createElement('div');
      el.className = 'gw-item';
      el.onclick   = () => toggleGw(el);
      el.innerHTML = `
        <div class="gw-av"><span class="material-icons">${d.icon}</span></div>
        <div class="gw-info">
          <div class="gw-name">${it.n}</div>
          <div class="gw-status ${it.on?'on':'off'}">${it.on?'ВКЛЮЧЕНО':'ВЫКЛЮЧЕНО'}</div>
        </div>
        <div class="gw-dots"><span class="material-icons">more_vert</span></div>
      `;
      list.appendChild(el);
    });
    scrl.scrollTop = 0;
    body.style.transition = 'opacity .22s ease, transform .22s ease';
    body.classList.replace('fout','fin');
  }, 170);
}

function toggleGw(el) {
  const s = el.querySelector('.gw-status');
  el.style.transform = 'scale(.97)';
  setTimeout(() => { el.style.transform = ''; }, 110);
  if (s.classList.contains('on')) {
    s.classList.replace('on','off'); s.textContent = 'ВЫКЛЮЧЕНО';
  } else {
    s.classList.replace('off','on'); s.textContent = 'ВКЛЮЧЕНО';
  }
}

document.getElementById('gwTabs').querySelectorAll('span').forEach(tab => {
  tab.addEventListener('click', function() {
    document.getElementById('gwTabs').querySelectorAll('span').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    buildGui(this.dataset.tab);
  });
});

buildGui('player');

const compareSlider = document.getElementById('compareSlider');
const compareAfterWrap = document.getElementById('compareAfterWrap');
const compareDivider = document.getElementById('compareDivider');
const compareHandle = document.getElementById('compareHandle');

function updateCompare(value) {
  const v = Math.max(0, Math.min(100, Number(value)));
  compareAfterWrap.style.width = v + '%';
  compareDivider.style.left = v + '%';
  compareHandle.style.left = v + '%';
}

if (compareSlider) {
  compareSlider.addEventListener('input', (e) => updateCompare(e.target.value));
  updateCompare(compareSlider.value);
}

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('on'), parseInt(e.target.dataset.d)||0);
      obs.unobserve(e.target);
    }
  });
}, { threshold:.08, rootMargin:'0px 0px -28px 0px' });

document.querySelectorAll('.reveal').forEach((el,i) => {
  el.dataset.d = (i % 4) * 90;
  obs.observe(el);
});
