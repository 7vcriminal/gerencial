// Módulo Tempo de APN
// Arquivo separado para que merges do módulo audiências nunca o apaguem.
// Este arquivo injeta seu HTML no DOM e expõe hooks para initApp/subscribeRealtime.

(function () {
    'use strict';

    // === INJEÇÃO DE HTML ===

    const tabs = document.querySelector('.module-tabs');
    if (tabs && !document.getElementById('tab-apn')) {
        tabs.insertAdjacentHTML('beforeend',
            '<button class="module-tab" id="tab-apn" onclick="setModule(\'apn\')"><i class="fas fa-gavel"></i> Tempo de APN</button>');
    }

    const viewCartas = document.getElementById('view-cartas');
    if (viewCartas && !document.getElementById('view-apn')) {
        viewCartas.insertAdjacentHTML('afterend', `
<section id="view-apn" style="display:none">
    <div class="stats-grid">
        <div class="stat-card" onclick="filterApn('todos')"><div class="stat-label">Total</div><div class="stat-value" id="ap-total">0</div><div class="stat-hint">clique para ver todos</div></div>
        <div class="stat-card urgente" onclick="filterApn('urgente')"><div class="stat-label">Tramitação &gt; 500 dias</div><div class="stat-value" id="ap-urgente">0</div><div class="stat-hint">clique para filtrar</div></div>
        <div class="stat-card atencao" onclick="filterApn('atencao')"><div class="stat-label">Sem sentença</div><div class="stat-value" id="ap-sem-sentenca">0</div><div class="stat-hint">clique para filtrar</div></div>
        <div class="stat-card" onclick="filterApn('julgados')"><div class="stat-label">Julgados</div><div class="stat-value" id="ap-julgados">0</div><div class="stat-hint">clique para filtrar</div></div>
        <div class="stat-card" onclick="filterApn('arquivados')"><div class="stat-label">Suspensos/Arquivados</div><div class="stat-value" id="ap-arquivados">0</div><div class="stat-hint">clique para filtrar</div></div>
    </div>
    <div id="ap-alerta-banner" onclick="toggleAlertaApn()" style="display:none;align-items:center;gap:0.5rem;padding:0.65rem 1rem;border-radius:0.5rem;margin-bottom:0.75rem;cursor:pointer;font-size:0.875rem;font-weight:500;"></div>
    <div class="toolbar">
        <div class="search-box"><i class="fas fa-search"></i><input type="text" id="ap-search" placeholder="Buscar por processo, fase, promotoria..."></div>
        <select id="ap-filter-fase"><option value="">Todas as fases</option></select>
        <select id="ap-filter-julgado">
            <option value="">Julgado e não julgado</option>
            <option value="sim">Julgado</option>
            <option value="nao">Não julgado</option>
        </select>
        <button class="btn-new" onclick="openModalApn()"><i class="fas fa-plus"></i> Novo Processo</button>
    </div>
    <div class="table-wrapper">
        <div class="table-info">
            <span id="ap-count">Carregando...</span>
            <span style="font-size:0.75rem;color:#aaa">Clique em uma linha para editar</span>
        </div>
        <div style="overflow-x:auto">
        <table>
            <thead>
                <tr>
                    <th class="no-sort">Situação</th>
                    <th onclick="sortApn('tramitacao')">Tramitação <span id="sort-ap-tramitacao"></span></th>
                    <th onclick="sortApn('processo')">Processo <span id="sort-ap-processo"></span></th>
                    <th class="no-sort">Status</th>
                    <th onclick="sortApn('data_distribuicao')">Distribuição <span id="sort-ap-data_distribuicao"></span></th>
                    <th class="no-sort">Denúncia</th>
                    <th class="no-sort">1ª Sentença</th>
                    <th class="no-sort">Julgado</th>
                    <th onclick="sortApn('fase_processual')">Fase <span id="sort-ap-fase_processual"></span></th>
                    <th class="no-sort">Fila</th>
                    <th class="no-sort">Pendências</th>
                </tr>
            </thead>
            <tbody id="ap-table-body"></tbody>
        </table>
        </div>
    </div>
</section>`);
    }

    const toast = document.getElementById('toast');
    if (toast && !document.getElementById('modal-apn')) {
        toast.insertAdjacentHTML('beforebegin', `
<div class="modal-overlay" id="modal-apn">
    <div class="modal">
        <div class="modal-header">
            <h2 id="modal-apn-title">Novo Processo</h2>
            <button class="btn-close" onclick="closeModalApn()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="ap-id">
            <div class="form-grid">
                <div class="form-group full">
                    <label>Nº do Processo</label>
                    <input type="text" id="ap-processo" placeholder="0000000-00.0000.8.04.0001">
                </div>
                <div class="form-group">
                    <label>Data de Distribuição</label>
                    <input type="date" id="ap-data-distribuicao">
                </div>
                <div class="form-group">
                    <label>Data da Denúncia</label>
                    <input type="date" id="ap-denuncia">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="ap-status" onchange="handleApnNovaOpcao(this, loadApnStatus, saveApnStatus, 'Status')"></select>
                </div>
                <div class="form-group">
                    <label>Fase Processual</label>
                    <select id="ap-fase" onchange="handleApnNovaOpcao(this, loadApnFases, saveApnFases, 'Fase Processual')"></select>
                </div>
                <div class="form-group">
                    <label>Fila Processual</label>
                    <select id="ap-localizacao" onchange="handleApnNovaOpcao(this, loadApnFilas, saveApnFilas, 'Fila Processual')"></select>
                </div>
                <div class="form-group">
                    <label>Promotoria</label>
                    <select id="ap-mp">
                        <option value="">Selecione...</option>
                        <option value="04ª PJ">04ª PJ</option>
                        <option value="92ª PJ">92ª PJ</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Defesa</label>
                    <div class="form-checks">
                        <label class="form-check"><input type="checkbox" id="ap-defesa-dpe"> DPE</label>
                        <label class="form-check"><input type="checkbox" id="ap-defesa-adv"> ADV</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Situação</label>
                    <div class="form-checks">
                        <label class="form-check"><input type="checkbox" id="ap-sentenca"> 1ª Sentença</label>
                        <label class="form-check"><input type="checkbox" id="ap-julgado"> Julgado</label>
                    </div>
                </div>
                <div class="form-group full">
                    <label>Pendências / Anotações</label>
                    <textarea id="ap-pendencias" rows="3"></textarea>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-del" id="ap-del-btn" onclick="deleteApn()"><i class="fas fa-trash"></i> Excluir</button>
            <div style="display:flex;gap:0.75rem">
                <button class="btn-cancel-modal" onclick="closeModalApn()">Cancelar</button>
                <button class="btn-save" onclick="saveApn()"><i class="fas fa-save"></i> Salvar</button>
            </div>
        </div>
    </div>
</div>`);
    }

    // === PATCH setModule para incluir APN ===
    const _origSetModule = window.setModule;
    if (typeof _origSetModule === 'function') {
        window.setModule = function (m) {
            _origSetModule(m);
            const tabApn = document.getElementById('tab-apn');
            const viewApn = document.getElementById('view-apn');
            if (tabApn) tabApn.classList.toggle('active', m === 'apn');
            if (viewApn) viewApn.style.display = m === 'apn' ? '' : 'none';
            if (m === 'apn') renderApn();
        };
    }

    // === INICIALIZAÇÃO AUTÔNOMA via onAuthStateChange ===
    // Captura logins novos; o F5 é tratado pelo _apnBoot no final do arquivo
    if (typeof sb !== 'undefined') {
        sb.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && !window._apnInitialized) {
                window._apnInitialized = true;
                await window.__apnInit();
                window.__apnSubscribe();
            }
            if (event === 'SIGNED_OUT') {
                window._apnInitialized = false;
            }
        });
    }

    // Registrar listener de input para máscara CNJ no campo ap-processo
    document.addEventListener('input', function (e) {
        if (e.target.id === 'ap-processo' && typeof formatProcessoCNJ === 'function') {
            e.target.value = formatProcessoCNJ(e.target.value);
        }
        if (e.target.id === 'ap-search') renderApn();
    });
    document.addEventListener('change', function (e) {
        if (e.target.id === 'ap-filter-fase' || e.target.id === 'ap-filter-julgado') renderApn();
    });

})();

// === CONSTANTES ===
const STORAGE_APN = 'controleProcessual_apn_v1';
const STORAGE_APN_FILAS = 'controleProcessual_apn_filas_v1';
const STORAGE_APN_STATUS = 'controleProcessual_apn_status_v1';
const STORAGE_APN_FASES = 'controleProcessual_apn_fases_v1';
const DEFAULT_APN_STATUS = ['Ativo', 'Suspenso', 'Arquivado'];
const DEFAULT_APN_FASES = ['Citação', 'Resposta à Acusação', 'Instrução', 'Alegações Finais', 'Sentença'];

// === VARIÁVEIS DE ESTADO ===
let apns = [];
let nextApnId = 1;
let apSort = { field: 'tramitacao', dir: 'desc' };
let apCardFilter = 'pendentes';
let apFilterAlerta = false;

// === MAPEAMENTO SUPABASE ===
function apnToRow(p) {
    return {
        id: p.id, processo: p.processo, data_distribuicao: p.dataDistribuicao || null,
        denuncia: p.denuncia || null, status: p.status || 'Ativo',
        tramitacao_congelada: p.tramitacaoCongelada ?? null,
        fase_processual: p.faseProcessual || null, localizacao: p.localizacao || null,
        mp_origem: p.mpOrigem || null, defesa: p.defesa || null,
        primeira_sentenca: !!p.primeiraSentenca, julgado: !!p.julgado,
        pendencias: p.pendencias || null, updated_at: p.updatedAt || null,
    };
}
function rowToApn(r) {
    return {
        id: r.id, processo: r.processo, dataDistribuicao: r.data_distribuicao,
        denuncia: r.denuncia, status: r.status, tramitacaoCongelada: r.tramitacao_congelada,
        faseProcessual: r.fase_processual, localizacao: r.localizacao,
        mpOrigem: r.mp_origem, defesa: r.defesa,
        primeiraSentenca: r.primeira_sentenca, julgado: r.julgado,
        pendencias: r.pendencias, updatedAt: r.updated_at,
    };
}

// === PERSISTÊNCIA ===
async function persistApn(p) {
    localStorage.setItem(STORAGE_APN, JSON.stringify(apns));
    try { await sb.from('tempo_apn').upsert(apnToRow(p)); }
    catch (e) { console.error('Supabase save error', e); showToast('Erro ao sincronizar', 'error'); }
}
async function removeApn(id) {
    localStorage.setItem(STORAGE_APN, JSON.stringify(apns));
    try { await sb.from('tempo_apn').delete().eq('id', id); }
    catch (e) { console.error('Supabase delete error', e); }
}

// === HOOKS PARA initApp / subscribeRealtime ===
window.__apnInit = async function () {
    try {
        const { data: apRows, error: e3 } = await sb.from('tempo_apn').select('*');
        if (e3) throw e3;
        apns = (apRows || []).map(rowToApn);
        localStorage.setItem(STORAGE_APN, JSON.stringify(apns));
    } catch (e) {
        console.warn('Tabela tempo_apn indisponível, usando localStorage', e);
        apns = JSON.parse(localStorage.getItem(STORAGE_APN) || '[]');
    }
    nextApnId = apns.length ? Math.max(...apns.map(p => p.id)) + 1 : 1;
};

window.__apnSubscribe = function () {
    sb.channel('tempo-apn-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tempo_apn' }, payload => {
            handleRealtime(apns, payload, rowToApn, () => {
                localStorage.setItem(STORAGE_APN, JSON.stringify(apns));
                renderApn();
            });
        })
        .subscribe();
};

// === LÓGICA DE TRAMITAÇÃO ===
// Tramitação só é contada a partir da data da denúncia
function tramitacaoApn(p) {
    if ((p.status === 'Suspenso' || p.status === 'Arquivado') && p.tramitacaoCongelada != null)
        return p.tramitacaoCongelada;
    if (!p.denuncia) return null;
    return diasDesde(p.denuncia);
}

// === FILTROS E ORDENAÇÃO ===
function filterApn(card) {
    apCardFilter = apCardFilter === card ? 'pendentes' : card;
    if (apCardFilter === 'todos') apFilterAlerta = false;
    renderApn();
}
function toggleAlertaApn() {
    apFilterAlerta = !apFilterAlerta;
    renderApn();
}
function sortApn(field) {
    if (apSort.field === field) apSort.dir = apSort.dir === 'asc' ? 'desc' : 'asc';
    else { apSort.field = field; apSort.dir = 'desc'; }
    renderApn();
}
function getFilteredApn() {
    const term = (document.getElementById('ap-search').value || '').toLowerCase();
    const fase = document.getElementById('ap-filter-fase').value;
    const julgadoF = document.getElementById('ap-filter-julgado').value;
    let list = apns.map(p => ({ ...p, _dias: tramitacaoApn(p), _diasMov: p.updatedAt ? diasDesde(p.updatedAt.slice(0, 10)) : 999 }));
    if (term) {
        list = list.filter(p =>
            (p.processo || '').toLowerCase().includes(term) ||
            (p.faseProcessual || '').toLowerCase().includes(term) ||
            (p.mpOrigem || '').toLowerCase().includes(term) ||
            (p.defesa || '').toLowerCase().includes(term) ||
            (p.pendencias || '').toLowerCase().includes(term)
        );
    }
    if (fase) list = list.filter(p => p.faseProcessual === fase);
    if (julgadoF === 'sim') list = list.filter(p => p.julgado);
    if (julgadoF === 'nao') list = list.filter(p => !p.julgado);
    if (apFilterAlerta) list = list.filter(p => p._diasMov != null && p._diasMov >= 15);
    if (apCardFilter === 'pendentes') list = list.filter(p => p.status !== 'Suspenso' && p.status !== 'Arquivado');
    if (apCardFilter === 'urgente') list = list.filter(p => p.status === 'Ativo' && !p.primeiraSentenca && p._dias != null && p._dias > 500);
    if (apCardFilter === 'atencao') list = list.filter(p => !p.primeiraSentenca);
    if (apCardFilter === 'julgados') list = list.filter(p => p.julgado);
    if (apCardFilter === 'arquivados') list = list.filter(p => p.status === 'Suspenso' || p.status === 'Arquivado');
    list.sort((a, b) => {
        let va, vb;
        if (apSort.field === 'tramitacao') { va = a._dias ?? -1; vb = b._dias ?? -1; }
        else { va = (a[apSort.field] || '').toString(); vb = (b[apSort.field] || '').toString(); }
        if (va < vb) return apSort.dir === 'asc' ? -1 : 1;
        if (va > vb) return apSort.dir === 'asc' ? 1 : -1;
        return 0;
    });
    return list;
}

// === RENDER ===
function renderAlertaApn() {
    const banner = document.getElementById('ap-alerta-banner');
    if (!banner) return;
    const total = apns.filter(p => {
        const d = p.updatedAt ? diasDesde(p.updatedAt.slice(0, 10)) : 999;
        return d != null && d >= 15;
    }).length;
    if (total > 0) {
        banner.style.display = 'flex';
        banner.style.background = apFilterAlerta ? '#b91c1c' : '#fef2f2';
        banner.style.border = `1px solid ${apFilterAlerta ? '#7f1d1d' : '#fecaca'}`;
        banner.style.color = apFilterAlerta ? '#fff' : '#b91c1c';
        const filterLabel = apFilterAlerta ? ' — <span style="text-decoration:underline">clique para mostrar todos</span>' : ' — <span style="text-decoration:underline">clique para filtrar</span>';
        banner.innerHTML = `<i class="fas fa-triangle-exclamation"></i> <strong>${total} processo(s)</strong> sem movimentação há 15 dias ou mais${filterLabel}`;
    } else {
        banner.style.display = 'none';
        if (apFilterAlerta) apFilterAlerta = false;
    }
}
function buildApnFaseFilter() {
    const sel = document.getElementById('ap-filter-fase');
    if (!sel) return;
    const current = sel.value;
    const fases = [...new Set(apns.map(p => p.faseProcessual).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Todas as fases</option>' +
        fases.map(f => `<option value="${f}">${f}</option>`).join('');
    sel.value = current;
}
function renderApn() {
    buildApnFaseFilter();
    renderAlertaApn();
    const list = getFilteredApn();
    const elTotal = document.getElementById('ap-total');
    if (!elTotal) return;
    document.getElementById('ap-total').textContent = apns.length;
    document.getElementById('ap-urgente').textContent = apns.filter(p =>
        p.status === 'Ativo' && !p.primeiraSentenca && (tramitacaoApn(p) || 0) > 500
    ).length;
    document.getElementById('ap-sem-sentenca').textContent = apns.filter(p => !p.primeiraSentenca).length;
    document.getElementById('ap-julgados').textContent = apns.filter(p => p.julgado).length;
    document.getElementById('ap-arquivados').textContent = apns.filter(p => p.status === 'Suspenso' || p.status === 'Arquivado').length;
    document.getElementById('ap-count').textContent = `${list.length} de ${apns.length} processo(s)`;
    ['tramitacao', 'processo', 'data_distribuicao', 'fase_processual'].forEach(f => {
        const el = document.getElementById('sort-ap-' + f);
        if (el) el.textContent = apSort.field === f ? (apSort.dir === 'asc' ? '▲' : '▼') : '';
    });
    const tbody = document.getElementById('ap-table-body');
    if (!tbody) return;
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><i class="fas fa-folder-open"></i><div>Nenhum processo encontrado</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(p => {
        const ok = p.status === 'Suspenso' || p.status === 'Arquivado';
        const stale = p._diasMov != null && p._diasMov >= 15;
        const staleTitle = !p.updatedAt ? 'Sem atualização registrada no sistema' : `Sem movimentação há ${p._diasMov} dias`;
        return `
        <tr onclick="openModalApn(${p.id})">
            <td class="center">${ok
                ? '<span class="badge badge-sim"><i class="fas fa-check"></i> OK</span>'
                : '<span class="badge badge-nao"><i class="fas fa-exclamation"></i> Pendente</span>'}</td>
            <td class="center"><span class="dias-pill ${diasClass(p._dias, 180, 500)}">${p._dias != null ? p._dias + ' dias' : '—'}</span></td>
            <td class="proc-num">${p.processo}${stale ? ` <i class="fas fa-triangle-exclamation" style="color:var(--red)" title="${staleTitle}"></i>` : ''}</td>
            <td class="center">${p.status || 'Ativo'}</td>
            <td class="center">${fmtData(p.dataDistribuicao)}</td>
            <td class="center">${fmtData(p.denuncia)}</td>
            <td class="center"><span class="badge ${p.primeiraSentenca ? 'badge-sim' : 'badge-nao'}">${p.primeiraSentenca ? 'Sim' : 'Não'}</span></td>
            <td class="center"><span class="badge ${p.julgado ? 'badge-sim' : 'badge-nao'}">${p.julgado ? 'Sim' : 'Não'}</span></td>
            <td>${p.faseProcessual || '—'}</td>
            <td>${p.localizacao || '—'}</td>
            <td class="pendencia-preview" title="${(p.pendencias || '').replace(/"/g, '&quot;')}">${p.pendencias || '—'}</td>
        </tr>
    `;
    }).join('');
}

// === SELECT DINÂMICO ===
function loadApnFilas() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_APN_FILAS) || '[]');
    const fromData = apns.map(p => p.localizacao).filter(Boolean);
    return [...new Set([...stored, ...fromData])].sort((a, b) => a.localeCompare(b));
}
function saveApnFilas(list) { localStorage.setItem(STORAGE_APN_FILAS, JSON.stringify(list)); }
function loadApnStatus() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_APN_STATUS) || '[]');
    const fromData = apns.map(p => p.status).filter(Boolean);
    return [...new Set([...DEFAULT_APN_STATUS, ...stored, ...fromData])];
}
function saveApnStatus(list) { localStorage.setItem(STORAGE_APN_STATUS, JSON.stringify(list)); }
function loadApnFases() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_APN_FASES) || '[]');
    const fromData = apns.map(p => p.faseProcessual).filter(Boolean);
    return [...new Set([...DEFAULT_APN_FASES, ...stored, ...fromData])];
}
function saveApnFases(list) { localStorage.setItem(STORAGE_APN_FASES, JSON.stringify(list)); }
function buildApnSelect(selectEl, options, currentValue) {
    const all = currentValue && !options.includes(currentValue) ? [...options, currentValue] : options;
    selectEl.innerHTML = '<option value="">Selecione...</option>'
        + all.map(o => `<option value="${o}">${o}</option>`).join('')
        + '<option value="__novo__">+ Adicionar novo...</option>';
    selectEl.value = currentValue || '';
}
function handleApnNovaOpcao(selectEl, loadFn, saveFn, label) {
    if (selectEl.value !== '__novo__') return;
    const valor = (window.prompt('Novo valor para ' + label + ':') || '').trim();
    if (!valor) { selectEl.value = ''; return; }
    const list = loadFn();
    if (!list.includes(valor)) { list.push(valor); saveFn(list); }
    buildApnSelect(selectEl, loadFn(), valor);
}

// === MODAL ===
function openModalApn(id) {
    const p = id ? apns.find(x => x.id === id) : null;
    document.getElementById('ap-id').value = p ? p.id : '';
    document.getElementById('ap-processo').value = p ? p.processo : '';
    document.getElementById('ap-data-distribuicao').value = p ? (p.dataDistribuicao || '') : '';
    document.getElementById('ap-denuncia').value = p ? (p.denuncia || '') : '';
    buildApnSelect(document.getElementById('ap-status'), loadApnStatus(), p ? (p.status || 'Ativo') : 'Ativo');
    buildApnSelect(document.getElementById('ap-fase'), loadApnFases(), p ? (p.faseProcessual || '') : '');
    buildApnSelect(document.getElementById('ap-localizacao'), loadApnFilas(), p ? (p.localizacao || '') : '');
    document.getElementById('ap-mp').value = p ? (p.mpOrigem || '') : '';
    const defesaVal = p ? (p.defesa || '') : '';
    document.getElementById('ap-defesa-dpe').checked = defesaVal.includes('DPE');
    document.getElementById('ap-defesa-adv').checked = defesaVal.includes('ADV');
    document.getElementById('ap-sentenca').checked = p ? !!p.primeiraSentenca : false;
    document.getElementById('ap-julgado').checked = p ? !!p.julgado : false;
    document.getElementById('ap-pendencias').value = p ? (p.pendencias || '') : '';
    document.getElementById('modal-apn-title').textContent = p ? 'Editar Processo' : 'Novo Processo';
    document.getElementById('ap-del-btn').style.display = p ? '' : 'none';
    document.getElementById('modal-apn').classList.add('open');
}
function closeModalApn() { document.getElementById('modal-apn').classList.remove('open'); }

async function saveApn() {
    const processo = document.getElementById('ap-processo').value.trim();
    if (!processo) { showToast('Informe o número do processo', 'error'); return; }
    const idVal = document.getElementById('ap-id').value;
    const id = idVal ? Number(idVal) : nextApnId++;
    const old = apns.find(x => x.id === id);
    const status = document.getElementById('ap-status').value;
    const dataDistribuicao = document.getElementById('ap-data-distribuicao').value || null;
    const denuncia = document.getElementById('ap-denuncia').value || null;
    let tramitacaoCongelada = old ? old.tramitacaoCongelada : null;
    if (status === 'Suspenso' || status === 'Arquivado') {
        if (!old || old.status === 'Ativo' || tramitacaoCongelada == null) {
            tramitacaoCongelada = denuncia ? diasDesde(denuncia) : null;
        }
    } else {
        tramitacaoCongelada = null;
    }
    const defesaParts = [];
    if (document.getElementById('ap-defesa-dpe').checked) defesaParts.push('DPE');
    if (document.getElementById('ap-defesa-adv').checked) defesaParts.push('ADV');
    const p = {
        id, processo,
        dataDistribuicao,
        denuncia,
        status,
        tramitacaoCongelada,
        faseProcessual: document.getElementById('ap-fase').value,
        localizacao: document.getElementById('ap-localizacao').value.trim(),
        mpOrigem: document.getElementById('ap-mp').value,
        defesa: defesaParts.join(', '),
        primeiraSentenca: document.getElementById('ap-sentenca').checked,
        julgado: document.getElementById('ap-julgado').checked,
        pendencias: document.getElementById('ap-pendencias').value.trim(),
        updatedAt: new Date().toISOString(),
    };
    if (p.localizacao) { const filas = loadApnFilas(); if (!filas.includes(p.localizacao)) { filas.push(p.localizacao); saveApnFilas(filas); } }
    if (status) { const statuses = loadApnStatus(); if (!statuses.includes(status)) { statuses.push(status); saveApnStatus(statuses); } }
    if (p.faseProcessual) { const fases = loadApnFases(); if (!fases.includes(p.faseProcessual)) { fases.push(p.faseProcessual); saveApnFases(fases); } }
    const idx = apns.findIndex(x => x.id === id);
    if (idx >= 0) apns[idx] = p; else apns.push(p);
    closeModalApn();
    renderApn();
    await persistApn(p);
    showToast('Processo salvo com sucesso');
}

async function deleteApn() {
    const id = Number(document.getElementById('ap-id').value);
    if (!id) return;
    if (!confirm('Excluir este processo do controle?')) return;
    apns = apns.filter(x => x.id !== id);
    closeModalApn();
    renderApn();
    await removeApn(id);
    showToast('Processo excluído');
}

// === BOOT AUTÔNOMO ===
// Verifica sessão ativa imediatamente (resolve problema de F5 onde
// onAuthStateChange INITIAL_SESSION já foi disparado antes deste arquivo carregar)
(async function _apnBoot() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (session && !window._apnInitialized) {
            window._apnInitialized = true;
            await window.__apnInit();
            window.__apnSubscribe();
        }
    } catch (e) {
        console.warn('APN boot error', e);
    }
}());
