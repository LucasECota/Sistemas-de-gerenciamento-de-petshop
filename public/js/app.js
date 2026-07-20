const RESOURCES = {
  tutores: {
    label: 'Tutores', endpoint: '/api/tutores', idField: 'id_tutor',
    columns: [
      ['nome', 'Nome', 'text'], ['cpf', 'CPF', 'text'], ['telefone', 'Telefone', 'text'],
      ['email', 'E-mail', 'text'], ['endereco', 'Endereço', 'text'],
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'endereco', label: 'Endereço', type: 'text' },
    ]
  },
  pets: {
    label: 'Pets', endpoint: '/api/pets', idField: 'id_pet',
    columns: [
      ['nome', 'Nome', 'text'], ['especie', 'Espécie', 'text', false], ['raca', 'Raça', 'text', false],
      ['peso', 'Peso (kg)', 'number'], ['nome_tutor', 'Tutor', 'text'],
    ],
    fields: [
      { name: 'id_tutor', label: 'Tutor', type: 'select', source: 'tutores', optValue: 'id_tutor', optLabel: 'nome', required: true },
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'especie', label: 'Espécie', type: 'text', required: true },
      { name: 'raca', label: 'Raça', type: 'text' },
      { name: 'data_nascimento', label: 'Nascimento', type: 'date' },
      { name: 'peso', label: 'Peso (kg)', type: 'number', step: '0.01' },
    ]
  },
  funcionarios: {
    label: 'Funcionários', endpoint: '/api/funcionarios', idField: 'id_funcionario',
    columns: [
      ['nome', 'Nome', 'text'], ['cpf', 'CPF', 'text'], ['cargo', 'Cargo', 'text'],
      ['data_contratacao', 'Contratação', 'date'],
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'cargo', label: 'Cargo', type: 'text', required: true },
      { name: 'data_contratacao', label: 'Data de contratação', type: 'date' },
    ]
  },
  servicos: {
    label: 'Serviços', endpoint: '/api/servicos', idField: 'id_servico',
    columns: [['nome', 'Nome', 'text'], ['descricao', 'Descrição', 'text', false], ['preco', 'Preço', 'number']],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'descricao', label: 'Descrição', type: 'text' },
      { name: 'preco', label: 'Preço (R$)', type: 'number', step: '0.01', required: true },
    ]
  },
  produtos: {
    label: 'Produtos', endpoint: '/api/produtos', idField: 'id_produto',
    columns: [['nome', 'Nome', 'text'], ['preco', 'Preço', 'number'], ['estoque', 'Estoque', 'number']],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'preco', label: 'Preço (R$)', type: 'number', step: '0.01', required: true },
      { name: 'estoque', label: 'Estoque', type: 'number', required: true },
    ]
  },
  agendamentos: { label: 'Agendamentos', endpoint: '/api/agendamentos', idField: 'id_agendamento', custom: 'agendamentos' },
  vendas: { label: 'Vendas', endpoint: '/api/vendas', idField: 'id_venda', custom: 'vendas' },
};

function gerarHorarios() {
  const opcoes = [];
  for (let h = 6; h <= 20; h++) {
    for (const m of ['00', '30']) {
      if (h === 20 && m === '30') continue;
      const hora = String(h).padStart(2, '0');
      opcoes.push(`<option value="${hora}:${m}">${hora}:${m}</option>`);
    }
  }
  return opcoes.join('');
}

const navEl = document.getElementById('nav');
const titleEl = document.getElementById('section-title');
const formArea = document.getElementById('form-area');
const tableArea = document.getElementById('table-area');

let currentKey = 'tutores';

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

function buildNav() {
  navEl.innerHTML = '';
  Object.entries(RESOURCES).forEach(([key, cfg]) => {
    const item = document.createElement('div');
    item.className = 'nav-item' + (key === currentKey ? ' active' : '');
    item.textContent = cfg.label;
    item.onclick = () => { currentKey = key; buildNav(); loadSection(key); };
    navEl.appendChild(item);
  });
}

// ---------- Tabela genérica: pesquisa + ordenação + filtro de status opcional ----------
function createTable({ data, columns, idField, endpoint, reloadKey, statusField, afterRender }) {
  const wrap = document.createElement('div');

  const controls = document.createElement('div');
  controls.className = 'table-controls';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Pesquisar...';
  searchInput.className = 'search-input';
  controls.appendChild(searchInput);

  let statusSelect = null;
  if (statusField) {
    statusSelect = document.createElement('select');
    statusSelect.className = 'status-filter';
    const valores = [...new Set(data.map(r => r[statusField]))];
    statusSelect.innerHTML = '<option value="">Todos os status</option>' +
      valores.map(v => `<option value="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('');
    controls.appendChild(statusSelect);
  }

  wrap.appendChild(controls);

  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'table-scroll';
  const table = document.createElement('table');
  scrollWrap.appendChild(table);
  wrap.appendChild(scrollWrap);

  let sortKey = null;
  let sortDir = 1;

  function getSortValue(row, col) {
    const raw = col.sortValue ? col.sortValue(row) : row[col.key];
    if (col.type === 'number') return Number(raw) || 0;
    if (col.type === 'date') return raw ? new Date(raw).getTime() : 0;
    return (raw ?? '').toString().toLowerCase();
  }

  function render() {
    const termo = searchInput.value.trim().toLowerCase();
    const statusVal = statusSelect ? statusSelect.value : '';

    let rows = data.filter(row => {
      if (statusVal && row[statusField] !== statusVal) return false;
      if (!termo) return true;
      return JSON.stringify(row).toLowerCase().includes(termo);
    });

    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      rows = rows.slice().sort((a, b) => {
        const va = getSortValue(a, col), vb = getSortValue(b, col);
        if (va < vb) return -1 * sortDir;
        if (va > vb) return 1 * sortDir;
        return 0;
      });
    }

    table.innerHTML = `<thead><tr>${columns.map(col => {
      if (col.sortable === false) return `<th>${col.label}</th>`;
      const arrow = sortKey === col.key ? (sortDir === 1 ? ' \u25B2' : ' \u25BC') : '';
      return `<th data-key="${col.key}">${col.label}${arrow}</th>`;
    }).join('')}<th></th></tr></thead>
    <tbody>${rows.length ? rows.map(row => `<tr>
      ${columns.map(col => `<td>${col.render ? col.render(row) : (row[col.key] ?? '')}</td>`).join('')}
      <td><button class="btn btn-danger" data-id="${row[idField]}">Excluir</button></td>
    </tr>`).join('') : `<tr><td colspan="${columns.length + 1}" class="empty">Nenhum registro encontrado.</td></tr>`}</tbody>`;

    table.querySelectorAll('th[data-key]').forEach(th => {
      th.onclick = () => {
        const key = th.dataset.key;
        if (sortKey === key) sortDir *= -1;
        else { sortKey = key; sortDir = 1; }
        render();
      };
    });

    table.querySelectorAll('.btn-danger').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Confirma excluir este registro?')) return;
        await api(`${endpoint}/${btn.dataset.id}`, { method: 'DELETE' });
        loadSection(reloadKey);
      };
    });

    if (afterRender) afterRender(table);
  }

  searchInput.oninput = render;
  if (statusSelect) statusSelect.onchange = render;
  render();

  return wrap;
}

async function loadSection(key) {
  const cfg = RESOURCES[key];
  titleEl.textContent = cfg.label;
  formArea.innerHTML = '<p class="empty">Carregando...</p>';
  tableArea.innerHTML = '';

  if (cfg.custom === 'agendamentos') return loadAgendamentos(cfg);
  if (cfg.custom === 'vendas') return loadVendas(cfg);

  const selectSources = {};
  for (const field of cfg.fields) {
    if (field.type === 'select') {
      selectSources[field.name] = await api(RESOURCES[field.source].endpoint);
    }
  }

  renderGenericForm(cfg, selectSources);
  const data = await api(cfg.endpoint);
  renderGenericTable(cfg, data);
}

function renderGenericForm(cfg, selectSources) {
  const form = document.createElement('form');
  form.className = 'card';
  form.innerHTML = `<h2>Novo registro</h2><div class="form-grid"></div>
    <div style="margin-top:14px"><button class="btn btn-primary" type="submit">Salvar</button></div>`;
  const grid = form.querySelector('.form-grid');

  cfg.fields.forEach(field => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const label = document.createElement('label');
    label.textContent = field.label;
    wrap.appendChild(label);

    if (field.type === 'select') {
      const select = document.createElement('select');
      select.name = field.name;
      select.required = !!field.required;
      select.innerHTML = '<option value="">Selecione...</option>' +
        selectSources[field.name].map(item =>
          `<option value="${item[field.optValue]}">${item[field.optLabel]}</option>`
        ).join('');
      wrap.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.required = !!field.required;
      if (field.step) input.step = field.step;
      wrap.appendChild(input);
    }
    grid.appendChild(wrap);
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      await api(cfg.endpoint, { method: 'POST', body: JSON.stringify(body) });
      loadSection(currentKey);
    } catch (err) {
      alert(err.message);
    }
  };

  formArea.innerHTML = '';
  formArea.appendChild(form);
}

function renderGenericTable(cfg, data) {
  tableArea.innerHTML = '';
  if (!data.length) {
    tableArea.innerHTML = '<p class="empty">Nenhum registro cadastrado ainda.</p>';
    return;
  }
  const columns = cfg.columns.map(c => {
    const type = c[2] || 'text';
    return {
      key: c[0], label: c[1], type,
      sortable: c[3] !== false,
      render: type === 'date'
        ? (row => row[c[0]] ? new Date(row[c[0]]).toLocaleDateString('pt-BR') : '')
        : undefined
    };
  });
  const table = createTable({
    data, columns, idField: cfg.idField, endpoint: cfg.endpoint, reloadKey: currentKey
  });
  tableArea.appendChild(table);
}

// ---------- Agendamentos (caso especial: pet + funcionario + servicos N:N) ----------
async function loadAgendamentos(cfg) {
  const [pets, funcionarios, servicos, data] = await Promise.all([
    api('/api/pets'), api('/api/funcionarios'), api('/api/servicos'), api(cfg.endpoint)
  ]);

  const form = document.createElement('form');
  form.className = 'card';
  form.innerHTML = `
    <h2>Novo agendamento</h2>
    <div class="form-grid">
      <div class="field"><label>Pet</label>
        <select name="id_pet" required>
          <option value="">Selecione...</option>
          ${pets.map(p => `<option value="${p.id_pet}">${p.nome} (${p.nome_tutor})</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Funcionário</label>
        <select name="id_funcionario" required>
          <option value="">Selecione...</option>
          ${funcionarios.map(f => `<option value="${f.id_funcionario}">${f.nome}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Data</label><input type="date" name="data" required></div>
        <div class="field"><label>Horário</label>
        <select name="hora" required>
        <option value="">Selecione...</option>
        ${gerarHorarios()}
        </select>
      </div>
      <div class="field"><label>Status</label>
        <select name="status">
          <option value="agendado">Agendado</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
    </div>
    <div class="field" style="margin-top:14px"><label>Serviços</label>
      <div class="checklist">
        ${servicos.map(s => `<label><input type="checkbox" value="${s.id_servico}"> ${s.nome}</label>`).join('')}
      </div>
    </div>
    <div style="margin-top:14px"><button class="btn btn-primary" type="submit">Salvar</button></div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const id_servicos = [...form.querySelectorAll('input[type=checkbox]:checked')].map(c => Number(c.value));
    const data_hora = `${fd.get('data')}T${fd.get('hora')}`;
    const body = {
      id_pet: fd.get('id_pet'), id_funcionario: fd.get('id_funcionario'),
      data_hora, status: fd.get('status'), id_servicos
    };
    try {
      await api(cfg.endpoint, { method: 'POST', body: JSON.stringify(body) });
      loadSection('agendamentos');
    } catch (err) { alert(err.message); }
  };

  formArea.innerHTML = '';
  formArea.appendChild(form);

  tableArea.innerHTML = '';
  if (!data.length) { tableArea.innerHTML = '<p class="empty">Nenhum agendamento ainda.</p>'; return; }

  const columns = [
    { key: 'nome_pet', label: 'Pet', type: 'text' },
    { key: 'nome_funcionario', label: 'Funcionário', type: 'text' },
    { key: 'data_hora', label: 'Data', type: 'date', render: a => new Date(a.data_hora).toLocaleString('pt-BR') },
    {
      key: 'status', label: 'Status', type: 'text',
      render: a => `<select class="status-select ${a.status}" data-id="${a.id_agendamento}">
        <option value="agendado" ${a.status === 'agendado' ? 'selected' : ''}>Agendado</option>
        <option value="concluido" ${a.status === 'concluido' ? 'selected' : ''}>Concluído</option>
        <option value="cancelado" ${a.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
      </select>`
    },
    { key: 'servicos', label: 'Serviços', type: 'text' },
  ];

  const table = createTable({
    data, columns, idField: cfg.idField, endpoint: cfg.endpoint, reloadKey: 'agendamentos',
    statusField: 'status',
    afterRender: (tableEl) => {
      tableEl.querySelectorAll('.status-select').forEach(select => {
        select.onchange = async () => {
          try {
            await api(`${cfg.endpoint}/${select.dataset.id}/status`, {
              method: 'PATCH',
              body: JSON.stringify({ status: select.value })
            });
            loadSection('agendamentos');
          } catch (err) {
            alert(err.message);
          }
        };
      });
    }
  });

  tableArea.appendChild(table);
}

// ---------- Vendas (caso especial: tutor + itens de produto) ----------
async function loadVendas(cfg) {
  const [tutores, produtos, data] = await Promise.all([
    api('/api/tutores'), api('/api/produtos'), api(cfg.endpoint)
  ]);

  const form = document.createElement('form');
  form.className = 'card';
  form.innerHTML = `
    <h2>Nova venda</h2>
    <div class="form-grid">
      <div class="field"><label>Tutor</label>
        <select name="id_tutor" required>
          <option value="">Selecione...</option>
          ${tutores.map(t => `<option value="${t.id_tutor}">${t.nome}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="itens" style="margin-top:14px"></div>
    <button type="button" id="add-item" class="btn btn-secondary" style="margin-top:6px">+ Adicionar produto</button>
    <div style="margin-top:14px"><button class="btn btn-primary" type="submit">Registrar venda</button></div>
  `;

  const itensDiv = form.querySelector('#itens');
  function addItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="field" style="flex:2"><label>Produto</label>
        <select class="item-produto">
          ${produtos.map(p => `<option value="${p.id_produto}" data-preco="${p.preco}">${p.nome} (R$ ${p.preco})</option>`).join('')}
        </select>
      </div>
      <div class="field" style="flex:1"><label>Qtd</label><input type="number" class="item-qtd" value="1" min="1"></div>
      <button type="button" class="btn btn-danger">Remover</button>
    `;
    row.querySelector('.btn-danger').onclick = () => row.remove();
    itensDiv.appendChild(row);
  }
  addItemRow();
  form.querySelector('#add-item').onclick = addItemRow;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const id_tutor = form.id_tutor.value;
    const itens = [...itensDiv.querySelectorAll('.item-row')].map(row => {
      const select = row.querySelector('.item-produto');
      return {
        id_produto: Number(select.value),
        quantidade: Number(row.querySelector('.item-qtd').value),
        preco_unitario: Number(select.selectedOptions[0].dataset.preco)
      };
    });
    try {
      await api(cfg.endpoint, { method: 'POST', body: JSON.stringify({ id_tutor, itens }) });
      loadSection('vendas');
    } catch (err) { alert(err.message); }
  };

  formArea.innerHTML = '';
  formArea.appendChild(form);

  tableArea.innerHTML = '';
  if (!data.length) { tableArea.innerHTML = '<p class="empty">Nenhuma venda registrada ainda.</p>'; return; }

  const columns = [
    { key: 'nome_tutor', label: 'Tutor', type: 'text' },
    { key: 'data', label: 'Data', type: 'date', render: v => new Date(v.data).toLocaleString('pt-BR') },
    { key: 'valor_total', label: 'Total', type: 'number', render: v => `R$ ${Number(v.valor_total).toFixed(2)}` },
  ];

  const table = createTable({
    data, columns, idField: cfg.idField, endpoint: cfg.endpoint, reloadKey: 'vendas'
  });

  tableArea.appendChild(table);
}

buildNav();
loadSection(currentKey);
