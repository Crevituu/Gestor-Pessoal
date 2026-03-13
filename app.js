// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
const state = {
  eventos: JSON.parse(localStorage.getItem('mv_eventos') || '[]'),
  transacoes: JSON.parse(localStorage.getItem('mv_transacoes') || '[]'),
  metas: JSON.parse(localStorage.getItem('mv_metas') || '[]'),
  compras: JSON.parse(localStorage.getItem('mv_compras') || '[]'),
  tarefas: JSON.parse(localStorage.getItem('mv_tarefas') || '[]'),
  hairDone: JSON.parse(localStorage.getItem('mv_hair') || '{}'),
  currentPage: 'dashboard',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  selectedDate: new Date().toISOString().split('T')[0],
  hairTab: 'semanal',
};

function save() {
  localStorage.setItem('mv_eventos', JSON.stringify(state.eventos));
  localStorage.setItem('mv_transacoes', JSON.stringify(state.transacoes));
  localStorage.setItem('mv_metas', JSON.stringify(state.metas));
  localStorage.setItem('mv_compras', JSON.stringify(state.compras));
  localStorage.setItem('mv_tarefas', JSON.stringify(state.tarefas));
  localStorage.setItem('mv_hair', JSON.stringify(state.hairDone));
}

// ══════════════════════════════════════════
//  SIDEBAR (mobile drawer)
// ══════════════════════════════════════════
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════
//  NAV
// ══════════════════════════════════════════
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  calendario: 'Calendário',
  cabelo: 'Cabelo',
  financeiro: 'Financeiro',
  compras: 'Compras',
  tarefas: 'Tarefas',
};

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${page}'`))
      n.classList.add('active');
  });

  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle) topbarTitle.textContent = PAGE_TITLES[page] || page;

  state.currentPage = page;
  closeSidebar();
  renderAll();
}

// ══════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) {
      m.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

// ══════════════════════════════════════════
//  DATE
// ══════════════════════════════════════════
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const today = new Date();

function initDate() {
  const hour = today.getHours();
  const greet = hour < 12 ? 'Bom dia! 🌸' : hour < 18 ? 'Boa tarde! ☀️' : 'Boa noite! 🌙';
  const el = document.getElementById('greeting');
  if (el) el.textContent = greet;

  const dateEl = document.getElementById('sidebar-date');
  if (dateEl) dateEl.textContent = today.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const dayEl = document.getElementById('sidebar-day');
  if (dayEl) dayEl.textContent = DAYS_SHORT[today.getDay()];

  // Default dates
  const todayVal = today.toISOString().split('T')[0];
  document.querySelectorAll('input[type=date]').forEach(i => { if (!i.value) i.value = todayVal; });
}

// ══════════════════════════════════════════
//  CALENDÁRIO
// ══════════════════════════════════════════
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  const year = state.calYear, month = state.calMonth;
  document.getElementById('cal-month-year').textContent = `${MONTHS[month]} ${year}`;
  grid.innerHTML = '';

  DAYS_SHORT.forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];
  const eventDates = state.eventos.map(e => e.data);

  for (let i = 0; i < firstDay; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = prevDays - firstDay + i + 1;
    grid.appendChild(d);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day';
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    if (dateStr === todayStr) d.classList.add('today');
    if (dateStr === state.selectedDate) d.classList.add('selected');
    if (eventDates.includes(dateStr)) d.classList.add('has-event');
    d.textContent = i;
    d.onclick = () => { state.selectedDate = dateStr; renderCalendar(); renderDayEvents(); };
    grid.appendChild(d);
  }
  const remaining = 42 - firstDay - daysInMonth;
  for (let i = 1; i <= remaining; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = i;
    grid.appendChild(d);
  }
  renderDayEvents();
}

function changeMonth(dir) {
  state.calMonth += dir;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  if (state.calMonth < 0)  { state.calMonth = 11; state.calYear--; }
  renderCalendar();
}

function renderDayEvents() {
  const label = document.getElementById('selected-date-label');
  if (!label) return;
  const d = new Date(state.selectedDate + 'T12:00:00');
  label.textContent = d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });

  const events = state.eventos.filter(e => e.data === state.selectedDate);
  const el = document.getElementById('day-events');
  el.innerHTML = events.length
    ? events.map(e => eventHTML(e)).join('')
    : '<p style="color:var(--text-muted);font-size:0.84rem;padding:6px 0">Nenhum evento neste dia</p>';

  const allEl = document.getElementById('all-events-list');
  if (!state.eventos.length) {
    allEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.84rem;padding:6px 0">Nenhum evento cadastrado</p>';
    return;
  }
  const catColors = { pessoal:'#c084fc', saude:'#f472b6', trabalho:'#60a5fa', cabelo:'#fb923c', financeiro:'#34d399' };
  allEl.innerHTML = [...state.eventos]
    .sort((a,b) => a.data.localeCompare(b.data))
    .map(e => `<div class="event-item" style="border-left-color:${catColors[e.cat]||'var(--accent)'}">
      <div class="event-info">
        <div class="event-title">${e.titulo}</div>
        <div class="event-time">${new Date(e.data+'T12:00:00').toLocaleDateString('pt-BR')} ${e.hora?'· '+e.hora:''}</div>
      </div>
      <button class="event-delete" onclick="deleteEvento('${e.id}')">🗑</button>
    </div>`).join('');
}

function eventHTML(e) {
  return `<div class="event-item">
    <div class="event-info">
      <div class="event-title">${e.titulo}</div>
      <div class="event-time">${e.hora || 'Dia todo'} · ${e.cat}</div>
    </div>
    <button class="event-delete" onclick="deleteEvento('${e.id}')">🗑</button>
  </div>`;
}

function addEvento() {
  const titulo = document.getElementById('ev-titulo').value.trim();
  const data = document.getElementById('ev-data').value;
  if (!titulo || !data) { alert('Preencha o título e a data!'); return; }
  state.eventos.push({
    id: Date.now().toString(), titulo, data,
    hora: document.getElementById('ev-hora').value,
    cat: document.getElementById('ev-cat').value,
    desc: document.getElementById('ev-desc').value
  });
  save();
  closeModal('modal-evento');
  ['ev-titulo','ev-hora','ev-desc'].forEach(id => document.getElementById(id).value = '');
  renderCalendar(); renderDashboard();
}

function deleteEvento(id) {
  state.eventos = state.eventos.filter(e => e.id !== id);
  save(); renderCalendar(); renderDashboard();
}

// ══════════════════════════════════════════
//  CABELO
// ══════════════════════════════════════════
const hairSchedules = {
  semanal: [
    { title: 'Lavagem com shampoo', desc: 'Use shampoo hidratante ou sem sulfato', tag: 'lavagem', icon: '🧴' },
    { title: 'Condicionador', desc: 'Deixe agir por 3-5 minutos, use pente largo', tag: 'hidratacao', icon: '💧' },
    { title: 'Máscara Hidratante', desc: 'Hidratação profunda, 15-20 min com touca', tag: 'hidratacao', icon: '🌊' },
    { title: 'Óleo finalizador', desc: 'Poucas gotas nas pontas para brilho', tag: 'finalizacao', icon: '✨' },
    { title: 'Proteção térmica', desc: 'Antes de usar secador ou chapinha', tag: 'finalizacao', icon: '🔥' },
  ],
  quinzenal: [
    { title: 'Máscara Nutritiva', desc: 'Nutritivos com óleos vegetais, 30 min', tag: 'nutricao', icon: '🥥' },
    { title: 'Esfoliação do couro cabeludo', desc: 'Remove resíduos e estimula circulação', tag: 'lavagem', icon: '💆' },
    { title: 'Banho de creme', desc: 'Hidratação intensiva overnight ou 1h', tag: 'hidratacao', icon: '💜' },
    { title: 'Cronograma Capilar (4 em 1)', desc: 'Hidratação + Nutrição + Reconstrução + Acidificação', tag: 'reconstrucao', icon: '⚗️' },
  ],
  mensal: [
    { title: 'Máscara de Reconstrução', desc: 'Proteínas para cabelos danificados, 20-30 min', tag: 'reconstrucao', icon: '🧬' },
    { title: 'Tratamento com Queratina caseira', desc: 'Reduz frizz e fortalece os fios', tag: 'reconstrucao', icon: '💎' },
    { title: 'Corte de pontas', desc: 'Retire 1-2cm para eliminar pontas duplas', tag: 'finalizacao', icon: '✂️' },
    { title: 'Ampola de tratamento intensivo', desc: 'Concentrado para cabelos muito danificados', tag: 'nutricao', icon: '💉' },
  ]
};

function showCronTab(tab, el) {
  state.hairTab = tab;
  document.querySelectorAll('.cron-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderHair();
}

function renderHair() {
  const steps = hairSchedules[state.hairTab];
  const done = state.hairDone[state.hairTab] || [];
  const el = document.getElementById('hair-steps');
  if (!el) return;

  const total = steps.length, completed = done.length;
  const pct = total ? Math.round(completed / total * 100) : 0;
  document.getElementById('hair-progress-bar').style.width = pct + '%';
  document.getElementById('hair-progress-text').textContent = `${completed} de ${total} passos`;

  el.innerHTML = steps.map((s, i) => {
    const isDone = done.includes(i);
    return `<div class="hair-step ${isDone?'done':''}" onclick="toggleHairStep(${i})">
      <div class="step-num ${isDone?'done-step':''}">${isDone ? '✓' : i+1}</div>
      <div class="step-info">
        <div class="step-title">${s.icon} ${s.title}</div>
        <div class="step-desc">${s.desc}</div>
        <span class="step-tag tag-${s.tag}">${s.tag}</span>
      </div>
    </div>`;
  }).join('');

  updateHairDashboard();
}

function toggleHairStep(i) {
  if (!state.hairDone[state.hairTab]) state.hairDone[state.hairTab] = [];
  const arr = state.hairDone[state.hairTab];
  const idx = arr.indexOf(i);
  if (idx > -1) arr.splice(idx, 1); else arr.push(i);
  save(); renderHair();
}

function resetHair() {
  state.hairDone[state.hairTab] = [];
  save(); renderHair();
}

function updateHairDashboard() {
  let totalAll = 0, doneAll = 0;
  Object.keys(hairSchedules).forEach(k => {
    totalAll += hairSchedules[k].length;
    doneAll += (state.hairDone[k] || []).length;
  });
  const pct = totalAll ? Math.round(doneAll / totalAll * 100) : 0;
  const el = document.getElementById('dash-hair');
  if (el) el.textContent = pct + '%';
}

// ══════════════════════════════════════════
//  FINANCEIRO
// ══════════════════════════════════════════
const catIcons = {
  'Salário':'💼','Freelance':'💻','Alimentação':'🍕','Moradia':'🏠',
  'Transporte':'🚗','Saúde':'💊','Beleza':'💅','Lazer':'🎉',
  'Educação':'📚','Roupas':'👗','Outros':'📦'
};
const catColors2 = {
  'Salário':'#34d399','Freelance':'#60a5fa','Alimentação':'#fb923c','Moradia':'#c084fc',
  'Transporte':'#fbbf24','Saúde':'#f472b6','Beleza':'#e879f9','Lazer':'#818cf8',
  'Educação':'#38bdf8','Roupas':'#a78bfa','Outros':'#94a3b8'
};

function formatBRL(val) {
  return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addTransacao() {
  const desc = document.getElementById('tx-desc').value.trim();
  const valor = parseFloat(document.getElementById('tx-valor').value);
  if (!desc || isNaN(valor) || valor <= 0) { alert('Preencha descrição e valor!'); return; }
  state.transacoes.push({
    id: Date.now().toString(),
    tipo: document.getElementById('tx-tipo').value,
    desc, valor,
    cat: document.getElementById('tx-cat').value,
    data: document.getElementById('tx-data').value || today.toISOString().split('T')[0]
  });
  save(); closeModal('modal-transacao');
  document.getElementById('tx-desc').value = '';
  document.getElementById('tx-valor').value = '';
  renderFinanceiro(); renderDashboard();
}

function deleteTransacao(id) {
  state.transacoes = state.transacoes.filter(t => t.id !== id);
  save(); renderFinanceiro(); renderDashboard();
}

function renderFinanceiro() {
  const receitas = state.transacoes.filter(t=>t.tipo==='receita').reduce((s,t)=>s+t.valor, 0);
  const despesas = state.transacoes.filter(t=>t.tipo==='despesa').reduce((s,t)=>s+t.valor, 0);
  const saldo = receitas - despesas;
  const economia = receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0;

  document.getElementById('fin-receitas').textContent = formatBRL(receitas);
  document.getElementById('fin-despesas').textContent = formatBRL(despesas);
  const saldoEl = document.getElementById('fin-saldo');
  saldoEl.textContent = formatBRL(Math.abs(saldo));
  saldoEl.style.color = saldo >= 0 ? 'var(--accent3)' : 'var(--danger)';
  document.getElementById('fin-economia').textContent = economia + '%';

  // Extrato
  const txEl = document.getElementById('transactions-list');
  if (!txEl) return;
  if (!state.transacoes.length) {
    txEl.innerHTML = '<div class="empty-state"><div class="empty-icon">💳</div>Nenhuma transação ainda</div>';
  } else {
    txEl.innerHTML = [...state.transacoes]
      .sort((a,b) => b.data.localeCompare(a.data))
      .map(t => `
        <div class="transaction-item">
          <div class="transaction-icon" style="background:${t.tipo==='receita'?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)'}">
            ${catIcons[t.cat]||'💰'}
          </div>
          <div class="transaction-info">
            <div class="transaction-title">${t.desc}</div>
            <div class="transaction-cat">${t.cat}</div>
          </div>
          <div class="transaction-right">
            <div class="transaction-amount ${t.tipo==='receita'?'amount-in':'amount-out'}">
              ${t.tipo==='receita'?'+':'-'} ${formatBRL(t.valor)}
            </div>
            <div class="transaction-date">${new Date(t.data+'T12:00:00').toLocaleDateString('pt-BR')}</div>
          </div>
          <button class="btn btn-danger btn-sm" style="padding:6px 8px;font-size:0.75rem" onclick="deleteTransacao('${t.id}')">🗑</button>
        </div>`).join('');
  }

  // Orçamento
  const cats = [...new Set(state.transacoes.filter(t=>t.tipo==='despesa').map(t=>t.cat))];
  const budgetEl = document.getElementById('budget-bars');
  if (!cats.length) {
    budgetEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">Nenhuma despesa registrada</p>';
  } else {
    const maxVal = Math.max(...cats.map(c => state.transacoes.filter(t=>t.tipo==='despesa'&&t.cat===c).reduce((s,t)=>s+t.valor,0)));
    budgetEl.innerHTML = cats.map(c => {
      const val = state.transacoes.filter(t=>t.tipo==='despesa'&&t.cat===c).reduce((s,t)=>s+t.valor,0);
      const pct = maxVal > 0 ? (val/maxVal*100) : 0;
      return `<div class="budget-bar-wrap">
        <div class="budget-bar-label">
          <span>${catIcons[c]||'📦'} ${c}</span>
          <span>${formatBRL(val)}</span>
        </div>
        <div class="budget-bar-bg">
          <div class="budget-bar-fill" style="width:${pct}%;background:${catColors2[c]||'var(--accent)'}"></div>
        </div>
      </div>`;
    }).join('');
  }

  renderMetas();
}

function addMeta() {
  const nome = document.getElementById('meta-nome').value.trim();
  const alvo = parseFloat(document.getElementById('meta-alvo').value);
  const atual = parseFloat(document.getElementById('meta-atual').value) || 0;
  if (!nome || isNaN(alvo)) { alert('Preencha nome e valor alvo!'); return; }
  state.metas.push({ id: Date.now().toString(), nome, alvo, atual, prazo: document.getElementById('meta-prazo').value });
  save(); closeModal('modal-meta');
  document.getElementById('meta-nome').value = '';
  document.getElementById('meta-alvo').value = '';
  document.getElementById('meta-atual').value = '';
  renderMetas();
}

function renderMetas() {
  const el = document.getElementById('metas-list');
  const empty = document.getElementById('metas-empty');
  if (!el) return;
  if (!state.metas.length) { el.innerHTML = ''; if(empty) empty.style.display='block'; return; }
  if (empty) empty.style.display='none';
  el.innerHTML = state.metas.map(m => {
    const pct = Math.min(100, Math.round(m.atual / m.alvo * 100));
    return `<div class="meta-card">
      <div class="meta-header">
        <div class="meta-name">🎯 ${m.nome}</div>
        <div class="meta-progress">${pct}%</div>
      </div>
      <div class="meta-bar-bg"><div class="meta-bar-fill" style="width:${pct}%"></div></div>
      <div class="meta-footer">
        <span>${formatBRL(m.atual)} de ${formatBRL(m.alvo)}</span>
        <span>${m.prazo ? '⏳ ' + new Date(m.prazo+'T12:00:00').toLocaleDateString('pt-BR') : ''}</span>
        <button class="btn btn-danger btn-sm" onclick="deleteMeta('${m.id}')">Excluir</button>
      </div>
    </div>`;
  }).join('');
}

function deleteMeta(id) { state.metas = state.metas.filter(m => m.id !== id); save(); renderMetas(); }

function showFinTab(tab, el) {
  document.querySelectorAll('#page-financeiro .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#page-financeiro .tab-content').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ══════════════════════════════════════════
//  COMPRAS
// ══════════════════════════════════════════
const catEmojis = {
  'Hortifruti':'🥦','Laticínios':'🥛','Carnes':'🥩','Padaria':'🍞',
  'Bebidas':'🧃','Limpeza':'🧹','Higiene':'🧴','Cabelo':'💇','Outros':'📦'
};

function addCompra() {
  const nome = document.getElementById('cp-nome').value.trim();
  if (!nome) { alert('Digite o nome do item!'); return; }
  state.compras.push({
    id: Date.now().toString(), nome,
    cat: document.getElementById('cp-cat').value,
    qtd: document.getElementById('cp-qtd').value || '1 un',
    preco: parseFloat(document.getElementById('cp-preco').value) || 0,
    checked: false
  });
  save(); closeModal('modal-compra');
  document.getElementById('cp-nome').value = '';
  document.getElementById('cp-qtd').value = '';
  document.getElementById('cp-preco').value = '';
  renderCompras();
}

function toggleCompra(id) {
  const item = state.compras.find(c => c.id === id);
  if (item) item.checked = !item.checked;
  save(); renderCompras();
}

function deleteCompra(id) { state.compras = state.compras.filter(c => c.id !== id); save(); renderCompras(); }
function clearChecked() { state.compras = state.compras.filter(c => !c.checked); save(); renderCompras(); }

function renderCompras() {
  const el = document.getElementById('shopping-list');
  if (!el) return;
  const cats = [...new Set(state.compras.map(c => c.cat))];

  if (!state.compras.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div>Lista vazia! Adicione itens.</div>';
    document.getElementById('shop-total').textContent = 'R$ 0,00';
    updateBadges();
    return;
  }

  el.innerHTML = cats.map(cat => {
    const items = state.compras.filter(c => c.cat === cat);
    return `<div class="shop-category">
      <div class="shop-cat-title">
        <span>${catEmojis[cat]||'📦'} ${cat}</span>
        <span>${items.filter(i=>i.checked).length}/${items.length}</span>
      </div>
      ${items.map(item => `
        <div class="shop-item ${item.checked?'checked':''}" onclick="toggleCompra('${item.id}')">
          <div class="shop-checkbox">${item.checked?'✓':''}</div>
          <div class="shop-name">${item.nome}</div>
          <div class="shop-qty">${item.qtd}</div>
          ${item.preco > 0 ? `<div class="shop-price">${formatBRL(item.preco)}</div>` : ''}
          <button class="shop-delete" onclick="event.stopPropagation();deleteCompra('${item.id}')">🗑</button>
        </div>`).join('')}
    </div>`;
  }).join('');

  const total = state.compras.filter(c=>!c.checked).reduce((s,c)=>s+c.preco, 0);
  document.getElementById('shop-total').textContent = formatBRL(total);
  updateBadges();
}

// ══════════════════════════════════════════
//  TAREFAS
// ══════════════════════════════════════════
function addTarefa() {
  const titulo = document.getElementById('tk-titulo').value.trim();
  if (!titulo) { alert('Digite o título da tarefa!'); return; }
  state.tarefas.push({
    id: Date.now().toString(), titulo,
    cat: document.getElementById('tk-cat').value || 'Geral',
    prio: document.getElementById('tk-prio').value,
    data: document.getElementById('tk-data').value,
    status: document.getElementById('tk-status').value
  });
  save(); closeModal('modal-tarefa');
  document.getElementById('tk-titulo').value = '';
  document.getElementById('tk-cat').value = '';
  document.getElementById('tk-data').value = '';
  renderTarefas();
}

function moveTask(id, status) {
  const task = state.tarefas.find(t => t.id === id);
  if (task) task.status = status;
  save(); renderTarefas();
}
function deleteTask(id) { state.tarefas = state.tarefas.filter(t => t.id !== id); save(); renderTarefas(); }

function renderTarefas() {
  const cols = [
    { key:'todo',  label:'A Fazer',        dotColor:'#60a5fa' },
    { key:'doing', label:'Em Andamento',    dotColor:'#fbbf24' },
    { key:'done',  label:'Concluído',       dotColor:'#34d399' },
  ];
  const board = document.getElementById('task-board');
  if (!board) return;

  board.innerHTML = cols.map(col => {
    const tasks = state.tarefas.filter(t => t.status === col.key);
    return `<div class="task-column">
      <div class="task-col-header">
        <div class="task-col-title">
          <div class="col-dot" style="background:${col.dotColor}"></div>
          ${col.label}
        </div>
        <span class="chip">${tasks.length}</span>
      </div>
      ${tasks.map(t => `
        <div class="task-card">
          <div class="task-card-title">${t.titulo}</div>
          <div class="task-card-meta">
            <span class="task-priority prio-${t.prio}">${t.prio==='alta'?'Alta':t.prio==='media'?'Média':'Baixa'}</span>
            <span class="task-cat-tag">${t.cat}</span>
            ${t.data ? `<span class="task-date">📅 ${new Date(t.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</span>` : ''}
          </div>
          <div class="task-actions">
            ${col.key !== 'todo'  ? `<button class="btn btn-ghost btn-sm" onclick="moveTask('${t.id}','todo')">← Fazer</button>` : ''}
            ${col.key !== 'doing' ? `<button class="btn btn-ghost btn-sm" onclick="moveTask('${t.id}','doing')">⚡</button>` : ''}
            ${col.key !== 'done'  ? `<button class="btn btn-ghost btn-sm" style="color:var(--accent3)" onclick="moveTask('${t.id}','done')">✓</button>` : ''}
            <button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="deleteTask('${t.id}')">🗑</button>
          </div>
        </div>`).join('')}
      <button class="add-task-btn" onclick="openModal('modal-tarefa')">+ Adicionar tarefa</button>
    </div>`;
  }).join('');

  updateBadges();
}

// ══════════════════════════════════════════
//  BADGES
// ══════════════════════════════════════════
function updateBadges() {
  const pendingTarefas = state.tarefas.filter(t => t.status !== 'done').length;
  const pendingCompras = state.compras.filter(c => !c.checked).length;

  const badgeTarefas = document.getElementById('badge-tarefas');
  if (badgeTarefas) badgeTarefas.textContent = pendingTarefas || '0';

  const badgeCompras = document.getElementById('badge-compras');
  if (badgeCompras) badgeCompras.textContent = pendingCompras || '0';

  const dashTarefas = document.getElementById('dash-tarefas');
  if (dashTarefas) dashTarefas.textContent = pendingTarefas;
  const dashCompras = document.getElementById('dash-compras');
  if (dashCompras) dashCompras.textContent = state.compras.length;
}

// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════
function renderDashboard() {
  const receitas = state.transacoes.filter(t=>t.tipo==='receita').reduce((s,t)=>s+t.valor,0);
  const despesas = state.transacoes.filter(t=>t.tipo==='despesa').reduce((s,t)=>s+t.valor,0);
  const saldo = receitas - despesas;

  const saldoEl = document.getElementById('dash-saldo');
  if (saldoEl) {
    saldoEl.textContent = formatBRL(Math.abs(saldo));
    saldoEl.style.color = saldo >= 0 ? 'var(--accent3)' : 'var(--danger)';
  }
  const recEl = document.getElementById('dash-receitas');
  if (recEl) recEl.textContent = formatBRL(receitas);
  const despEl = document.getElementById('dash-despesas');
  if (despEl) despEl.textContent = formatBRL(despesas);

  // Próximos eventos
  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = state.eventos.filter(e => e.data >= todayStr).sort((a,b) => a.data.localeCompare(b.data)).slice(0,3);
  const evEl = document.getElementById('dash-eventos');
  if (evEl) {
    evEl.innerHTML = upcoming.length
      ? upcoming.map(e => `<div class="event-item" style="margin-bottom:8px">
          <div class="event-info">
            <div class="event-title">${e.titulo}</div>
            <div class="event-time">${new Date(e.data+'T12:00:00').toLocaleDateString('pt-BR')} ${e.hora?'· '+e.hora:''}</div>
          </div>
        </div>`).join('')
      : '<div class="empty-state" style="padding:20px"><div class="empty-icon">📅</div>Nenhum evento próximo</div>';
  }

  updateBadges();
  updateHairDashboard();
}

// ══════════════════════════════════════════
//  RENDER ALL
// ══════════════════════════════════════════
function renderAll() {
  renderDashboard();
  renderCalendar();
  renderHair();
  renderFinanceiro();
  renderCompras();
  renderTarefas();
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
initDate();
renderAll();
