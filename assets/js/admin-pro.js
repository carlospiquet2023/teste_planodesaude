// ============================================
// 🎛️ ADMIN DASHBOARD PRO - SISTEMA COMPLETO
// ============================================

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : `${window.location.origin}/api`;

let leadsData = [];
let simulationsData = [];
let conversationsData = [];
let leadsChart = null;
let simulationsChart = null;

// ============================================
// 🔐 AUTENTICAÇÃO
// ============================================

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success && data.token) {
            sessionStorage.setItem('adminToken', data.token);
            sessionStorage.setItem('adminLoggedIn', 'true');
            
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            
            loadDashboard();
        } else {
            showLoginError(data.message || 'Usuário ou senha incorretos!');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showLoginError('Erro ao conectar com o servidor');
    }
});

function showLoginError(message) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 5000);
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

// Verificar login
window.addEventListener('load', () => {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadDashboard();
    }
});

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
    };
}

// ============================================
// 📊 NAVEGAÇÃO
// ============================================

function showSection(section) {
    // Atualiza menu
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event?.target?.closest('.menu-item')?.classList.add('active');
    
    // Esconde todas as seções
    document.querySelectorAll('.section-view').forEach(view => view.classList.add('hidden'));
    
    // Mostra seção selecionada
    document.getElementById(`section-${section}`)?.classList.remove('hidden');
    
    // Carrega dados
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'leads': loadLeadsSection(); break;
        case 'analytics': loadAnalytics(); break;
        case 'content': loadContentEditor(); break;
        case 'pricing': loadPricingEditor(); break;
        case 'settings': loadSettings(); break;
    }
}

// ============================================
// 📊 DASHBOARD PRINCIPAL
// ============================================

async function loadDashboard() {
    try {
        // Carregar estatísticas
        const statsResponse = await fetch(`${API_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        const statsData = await statsResponse.json();
        
        // Carregar clientes para classificação
        const clientsResponse = await fetch(`${API_URL}/clients`, {
            headers: getAuthHeaders()
        });
        const clientsData = await clientsResponse.json();
        
        if (statsData.success) {
            renderStats(statsData.stats, clientsData.clients || []);
        }
        
        // Carregar leads para gráficos
        if (clientsData.success) {
            leadsData = clientsData.clients;
            renderCharts(clientsData.clients);
        }
        
        // Carregar atividades recentes
        loadRecentActivity();
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function renderStats(stats, clients) {
    // Classificar leads por temperatura
    const classified = classifyLeads(clients);
    
    const statsHTML = `
        <div class="stat-card primary">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <h4>Total de Clientes</h4>
            <div class="number">${stats.totalClients || 0}</div>
            <div class="trend"><i class="fas fa-arrow-up"></i> +${stats.last7DaysClients || 0} esta semana</div>
        </div>
        
        <div class="stat-card danger">
            <div class="stat-icon"><i class="fas fa-fire"></i></div>
            <h4>Leads Quentes 🔥</h4>
            <div class="number">${classified.hot}</div>
            <div class="trend">Alta prioridade</div>
        </div>
        
        <div class="stat-card warning">
            <div class="stat-icon"><i class="fas fa-temperature-half"></i></div>
            <h4>Leads Mornos 🌡️</h4>
            <div class="number">${classified.warm}</div>
            <div class="trend">Média prioridade</div>
        </div>
        
        <div class="stat-card success">
            <div class="stat-icon"><i class="fas fa-snowflake"></i></div>
            <h4>Leads Frios ❄️</h4>
            <div class="number">${classified.cold}</div>
            <div class="trend">Baixa prioridade</div>
        </div>
        
        <div class="stat-card primary">
            <div class="stat-icon"><i class="fas fa-calculator"></i></div>
            <h4>Simulações Hoje</h4>
            <div class="number">${stats.todaySimulations || 0}</div>
        </div>
        
        <div class="stat-card success">
            <div class="stat-icon"><i class="fas fa-comments"></i></div>
            <h4>Conversas Ativas</h4>
            <div class="number">${stats.activeConversations || 0}</div>
        </div>
    `;
    
    document.getElementById('statsGrid').innerHTML = statsHTML;
}

function classifyLeads(clients) {
    let hot = 0, warm = 0, cold = 0;
    
    clients.forEach(client => {
        const score = calculateLeadScore(client);
        if (score >= 70) hot++;
        else if (score >= 40) warm++;
        else cold++;
    });
    
    return { hot, warm, cold };
}

function calculateLeadScore(client) {
    let score = 0;
    
    // Pontuação baseada em dados fornecidos
    if (client.name) score += 15;
    if (client.email) score += 15;
    if (client.phone) score += 20;
    if (client.city) score += 10;
    if (client.interested_plan) score += 20;
    
    // Pontuação baseada em tempo (mais recente = maior pontuação)
    const daysSinceCreation = (new Date() - new Date(client.created_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) score += 20;
    else if (daysSinceCreation < 3) score += 10;
    else if (daysSinceCreation < 7) score += 5;
    
    return Math.min(score, 100);
}

function getLeadTemperature(score) {
    if (score >= 70) return { temp: 'hot', label: '🔥 Quente', class: 'badge-hot' };
    if (score >= 40) return { temp: 'warm', label: '🌡️ Morno', class: 'badge-warm' };
    return { temp: 'cold', label: '❄️ Frio', class: 'badge-cold' };
}

// ============================================
// 📈 GRÁFICOS
// ============================================

function renderCharts(clients) {
    // Classificar leads
    const classified = classifyLeads(clients);
    
    // Gráfico de Leads por Temperatura
    const ctx1 = document.getElementById('leadsChart');
    if (leadsChart) leadsChart.destroy();
    
    leadsChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['🔥 Quentes', '🌡️ Mornos', '❄️ Frios'],
            datasets: [{
                data: [classified.hot, classified.warm, classified.cold],
                backgroundColor: [
                    'rgba(255, 65, 108, 0.8)',
                    'rgba(247, 183, 51, 0.8)',
                    'rgba(0, 198, 255, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Gráfico de Simulações (últimos 7 dias)
    const ctx2 = document.getElementById('simulationsChart');
    if (simulationsChart) simulationsChart.destroy();
    
    const last7Days = getLast7Days();
    const simulationsByDay = countSimulationsByDay(clients);
    
    simulationsChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: last7Days.labels,
            datasets: [{
                label: 'Simulações',
                data: simulationsByDay,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function getLast7Days() {
    const days = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
        labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    return { days, labels };
}

function countSimulationsByDay(clients) {
    const { days } = getLast7Days();
    const counts = new Array(7).fill(0);
    
    clients.forEach(client => {
        const clientDate = new Date(client.created_at).toISOString().split('T')[0];
        const index = days.indexOf(clientDate);
        if (index !== -1) counts[index]++;
    });
    
    return counts;
}

// ============================================
// 📋 ATIVIDADES RECENTES
// ============================================

async function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando...</div>';
    
    try {
        const response = await fetch(`${API_URL}/clients`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.clients) {
            const recent = data.clients.slice(-10).reverse();
            
            const html = recent.map(client => {
                const score = calculateLeadScore(client);
                const temp = getLeadTemperature(score);
                
                return `
                    <div style="padding: 15px; border-bottom: 1px solid #f0f2f5; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${client.name}</strong>
                            <div style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                                ${client.phone || 'Sem telefone'} • ${new Date(client.created_at).toLocaleString('pt-BR')}
                            </div>
                        </div>
                        <span class="badge ${temp.class}">${temp.label}</span>
                    </div>
                `;
            }).join('') || '<div style="padding: 20px; text-align: center; color: #7f8c8d;">Nenhuma atividade recente</div>';
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #e74c3c;">Erro ao carregar atividades</div>';
    }
}

// ============================================
// 👥 SEÇÃO DE LEADS
// ============================================

async function loadLeadsSection() {
    const container = document.getElementById('leadsTable');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando leads...</div>';
    
    try {
        const response = await fetch(`${API_URL}/clients`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.clients) {
            leadsData = data.clients;
            renderLeadsTable(data.clients);
        }
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        container.innerHTML = '<div class="loading">Erro ao carregar leads</div>';
    }
}

function renderLeadsTable(clients) {
    const container = document.getElementById('leadsTable');
    
    if (clients.length === 0) {
        container.innerHTML = '<div class="loading">Nenhum lead cadastrado ainda</div>';
        return;
    }
    
    // Adicionar score e classificação
    const enrichedClients = clients.map(client => ({
        ...client,
        score: calculateLeadScore(client),
        temperature: getLeadTemperature(calculateLeadScore(client))
    }));
    
    // Ordenar por score (maior para menor)
    enrichedClients.sort((a, b) => b.score - a.score);
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Temperatura</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Cidade/UF</th>
                    <th>Plano Interesse</th>
                    <th>Score</th>
                    <th>Data</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${enrichedClients.map(client => `
                    <tr>
                        <td><span class="badge ${client.temperature.class}">${client.temperature.label}</span></td>
                        <td><strong>${client.name}</strong></td>
                        <td>${client.phone || '-'}</td>
                        <td>${client.email || '-'}</td>
                        <td>${client.city || '-'}${client.state ? '/' + client.state : ''}</td>
                        <td>${client.interested_plan || '-'}</td>
                        <td><strong>${client.score}%</strong></td>
                        <td>${new Date(client.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>
                            ${client.phone ? `
                                <button class="btn btn-success" style="padding: 6px 12px; font-size: 12px;" 
                                        onclick="window.open('https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá ${client.name}, vi que você se interessou por nossos planos!', '_blank')">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                            ` : '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function refreshLeads() {
    await loadLeadsSection();
}

// ============================================
// 📊 EXPORTAR PARA EXCEL
// ============================================

function exportLeadsToExcel() {
    if (leadsData.length === 0) {
        alert('Nenhum lead para exportar');
        return;
    }
    
    // Preparar dados para Excel
    const excelData = leadsData.map(client => {
        const score = calculateLeadScore(client);
        const temp = getLeadTemperature(score);
        
        return {
            'Temperatura': temp.label,
            'Score': score + '%',
            'Nome': client.name || '',
            'Telefone': client.phone || '',
            'Email': client.email || '',
            'Cidade': client.city || '',
            'Estado': client.state || '',
            'Plano de Interesse': client.interested_plan || '',
            'Status': client.status || 'novo',
            'Data de Cadastro': new Date(client.created_at).toLocaleDateString('pt-BR'),
            'Hora': new Date(client.created_at).toLocaleTimeString('pt-BR')
        };
    });
    
    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    
    // Gerar arquivo
    const fileName = `leads_vendaplano_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`✅ Excel exportado com sucesso!\nArquivo: ${fileName}`);
}

function exportFullReport() {
    if (leadsData.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }
    
    const classified = classifyLeads(leadsData);
    
    // Sheet 1: Resumo
    const summary = [{
        'Métrica': 'Total de Leads',
        'Valor': leadsData.length
    }, {
        'Métrica': 'Leads Quentes 🔥',
        'Valor': classified.hot
    }, {
        'Métrica': 'Leads Mornos 🌡️',
        'Valor': classified.warm
    }, {
        'Métrica': 'Leads Frios ❄️',
        'Valor': classified.cold
    }, {
        'Métrica': 'Taxa de Conversão Quente',
        'Valor': `${((classified.hot / leadsData.length) * 100).toFixed(1)}%`
    }];
    
    // Sheet 2: Leads Completos
    const leadsExport = leadsData.map(client => {
        const score = calculateLeadScore(client);
        const temp = getLeadTemperature(score);
        
        return {
            'Temperatura': temp.label,
            'Score': score,
            'Nome': client.name || '',
            'Telefone': client.phone || '',
            'Email': client.email || '',
            'Cidade': client.city || '',
            'Estado': client.state || '',
            'Plano': client.interested_plan || '',
            'Data': new Date(client.created_at).toLocaleString('pt-BR')
        };
    });
    
    // Criar workbook com múltiplas sheets
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');
    
    const ws2 = XLSX.utils.json_to_sheet(leadsExport);
    XLSX.utils.book_append_sheet(wb, ws2, 'Todos os Leads');
    
    // Leads Quentes
    const hotLeads = leadsExport.filter(l => l.Temperatura.includes('Quente'));
    if (hotLeads.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(hotLeads);
        XLSX.utils.book_append_sheet(wb, ws3, 'Leads Quentes');
    }
    
    // Gerar arquivo
    const fileName = `relatorio_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`✅ Relatório completo exportado!\nArquivo: ${fileName}\n\nConteúdo:\n- Resumo Geral\n- Todos os Leads\n- Leads Quentes (prioridade)`);
}

// ============================================
// 📈 ANALYTICS
// ============================================

async function loadAnalytics() {
    const container = document.getElementById('analyticsContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando análises...</div>';
    
    try {
        const response = await fetch(`${API_URL}/clients`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.clients) {
            renderAnalytics(data.clients);
        }
    } catch (error) {
        console.error('Erro ao carregar analytics:', error);
    }
}

function renderAnalytics(clients) {
    const container = document.getElementById('analyticsContent');
    
    const classified = classifyLeads(clients);
    const totalScore = clients.reduce((sum, c) => sum + calculateLeadScore(c), 0);
    const avgScore = (totalScore / clients.length).toFixed(1);
    
    // Análise por cidade
    const citiesMap = {};
    clients.forEach(c => {
        if (c.city) {
            citiesMap[c.city] = (citiesMap[c.city] || 0) + 1;
        }
    });
    const topCities = Object.entries(citiesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const html = `
        <div class="content-section">
            <div class="section-header">
                <h3><i class="fas fa-chart-pie"></i> Análise Geral</h3>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Score Médio dos Leads</h4>
                    <div class="number">${avgScore}%</div>
                </div>
                <div class="stat-card">
                    <h4>Taxa de Leads Quentes</h4>
                    <div class="number">${((classified.hot / clients.length) * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-card">
                    <h4>Taxa de Leads Mornos</h4>
                    <div class="number">${((classified.warm / clients.length) * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-card">
                    <h4>Taxa de Leads Frios</h4>
                    <div class="number">${((classified.cold / clients.length) * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
        
        <div class="content-section">
            <div class="section-header">
                <h3><i class="fas fa-map-marker-alt"></i> Top 5 Cidades</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Cidade</th>
                        <th>Número de Leads</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    ${topCities.map((city, index) => `
                        <tr>
                            <td><strong>#${index + 1}</strong></td>
                            <td>${city[0]}</td>
                            <td>${city[1]}</td>
                            <td>${((city[1] / clients.length) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="content-section">
            <div class="section-header">
                <h3><i class="fas fa-lightbulb"></i> Insights & Recomendações</h3>
            </div>
            <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; line-height: 1.8;">
                ${classified.hot > 0 ? `
                    <p><i class="fas fa-check-circle" style="color: #28a745;"></i> <strong>${classified.hot} leads quentes</strong> precisam de atenção IMEDIATA!</p>
                ` : ''}
                ${classified.warm > 10 ? `
                    <p><i class="fas fa-exclamation-circle" style="color: #f39c12;"></i> Você tem <strong>${classified.warm} leads mornos</strong> que podem ser convertidos com follow-up.</p>
                ` : ''}
                <p><i class="fas fa-trophy" style="color: #667eea;"></i> Score médio de <strong>${avgScore}%</strong> indica ${avgScore > 60 ? 'excelente' : 'boa'} qualidade de leads.</p>
                ${topCities.length > 0 ? `
                    <p><i class="fas fa-map" style="color: #3498db;"></i> Foco geográfico em <strong>${topCities[0][0]}</strong> com ${topCities[0][1]} leads.</p>
                ` : ''}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// ✏️ EDITOR DE CONTEÚDO
// ============================================

async function loadContentEditor() {
    const container = document.getElementById('contentEditor');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando conteúdo...</div>';
    
    try {
        const response = await fetch(`${API_URL}/content`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.content) {
            renderContentEditor(data.content);
        }
    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<div class="content-section"><p>Funcionalidade de edição de conteúdo disponível. Configure as tabelas no banco de dados.</p></div>';
    }
}

function renderContentEditor(content) {
    const container = document.getElementById('contentEditor');
    
    if (!content || content.length === 0) {
        container.innerHTML = '<div class="content-section"><p>Nenhum conteúdo encontrado. Use npm run init-db para inicializar.</p></div>';
        return;
    }

    // Agrupar conteúdo por seção
    const sections = {
        'hero': content.filter(c => c.section === 'hero'),
        'benefits': content.filter(c => c.section === 'benefits'),
        'how-it-works': content.filter(c => c.section === 'how-it-works'),
        'testimonials': content.filter(c => c.section === 'testimonials'),
        'faq': content.filter(c => c.section === 'faq'),
        'footer': content.filter(c => c.section === 'footer')
    };

    const getSectionTitle = (section) => {
        const titles = {
            'hero': '🏠 Seção Principal',
            'benefits': '✨ Benefícios',
            'how-it-works': '⚙️ Como Funciona',
            'testimonials': '💬 Depoimentos',
            'faq': '❓ FAQ',
            'footer': '📄 Rodapé'
        };
        return titles[section] || section;
    };

    container.innerHTML = `
        ${Object.entries(sections).map(([sectionName, items]) => {
            if (items.length === 0) return '';
            
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h3><i class="fas fa-edit"></i> ${getSectionTitle(sectionName)}</h3>
                        <button class="btn btn-success" onclick="saveSection('${sectionName}')">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                    </div>
                    <div class="editor-grid" id="editor-${sectionName}">
                        ${items.map(item => `
                            <div class="editor-field">
                                <label>${item.key}</label>
                                <small>ID: ${item.id} | Seção: ${item.section}</small>
                                <textarea 
                                    id="content-${item.id}" 
                                    rows="3"
                                    data-id="${item.id}"
                                >${item.value}</textarea>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

async function saveSection(section) {
    const container = document.getElementById(`editor-${section}`);
    if (!container) return;
    
    const textareas = container.querySelectorAll('textarea');
    const updates = Array.from(textareas).map(textarea => ({
        id: parseInt(textarea.dataset.id),
        value: textarea.value
    }));

    try {
        const response = await fetch(`${API_URL}/content`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ updates })
        });

        if (response.ok) {
            alert('✅ Conteúdo salvo com sucesso!');
            loadContentEditor();
        } else {
            alert('❌ Erro ao salvar conteúdo');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('❌ Erro ao conectar ao servidor');
    }
}

// ============================================
// 💰 EDITOR DE PREÇOS
// ============================================

async function loadPricingEditor() {
    const container = document.getElementById('pricingEditor');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando planos...</div>';
    
    try {
        const response = await fetch(`${API_URL}/content/pricing`, { 
            headers: getAuthHeaders() 
        });
        const plans = await response.json();
        renderPricingEditor(plans);
    } catch (error) {
        console.error('Erro ao carregar preços:', error);
        container.innerHTML = '<p>Erro ao carregar planos</p>';
    }
}

function renderPricingEditor(plans) {
    const container = document.getElementById('pricingEditor');
    
    if (!plans || plans.length === 0) {
        container.innerHTML = '<div class="content-section"><p>Nenhum plano encontrado.</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="action-buttons" style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="addNewPlan()">
                <i class="fas fa-plus"></i> Adicionar Novo Plano
            </button>
        </div>

        <div class="editor-grid">
            ${plans.map(plan => `
                <div class="content-section">
                    <div class="section-header">
                        <h3>${plan.name}</h3>
                        <div class="action-buttons">
                            <button class="btn btn-success" onclick="editPlan(${plan.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-logout" onclick="deletePlan(${plan.id}, '${plan.name}')">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                    <div class="editor-field">
                        <label>💰 Preço</label>
                        <input type="text" value="${plan.price}" readonly>
                    </div>
                    <div class="editor-field">
                        <label>📝 Descrição</label>
                        <textarea rows="2" readonly>${plan.description}</textarea>
                    </div>
                    <div class="editor-field">
                        <label>✨ Características</label>
                        <textarea rows="4" readonly>${plan.features}</textarea>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function editPlan(id) {
    try {
        const response = await fetch(`${API_URL}/content/pricing/${id}`, { 
            headers: getAuthHeaders() 
        });
        const plan = await response.json();
        
        const newName = prompt('Nome do Plano:', plan.name);
        if (!newName) return;
        
        const newPrice = prompt('Preço:', plan.price);
        if (!newPrice) return;
        
        const newDesc = prompt('Descrição:', plan.description);
        if (!newDesc) return;
        
        const newFeatures = prompt('Características (separadas por vírgula):', plan.features);
        if (!newFeatures) return;

        const updateResponse = await fetch(`${API_URL}/content/pricing/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: newName,
                price: newPrice,
                description: newDesc,
                features: newFeatures
            })
        });

        if (updateResponse.ok) {
            alert('✅ Plano atualizado com sucesso!');
            loadPricingEditor();
        } else {
            alert('❌ Erro ao atualizar plano');
        }
    } catch (error) {
        console.error('Erro ao editar plano:', error);
        alert('❌ Erro ao conectar ao servidor');
    }
}

async function deletePlan(id, name) {
    if (!confirm(`Tem certeza que deseja excluir o plano "${name}"?`)) return;

    try {
        const response = await fetch(`${API_URL}/content/pricing/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            alert('✅ Plano excluído com sucesso!');
            loadPricingEditor();
        } else {
            alert('❌ Erro ao excluir plano');
        }
    } catch (error) {
        console.error('Erro ao excluir plano:', error);
        alert('❌ Erro ao conectar ao servidor');
    }
}

async function addNewPlan() {
    const name = prompt('Nome do Plano:');
    if (!name) return;
    
    const price = prompt('Preço (ex: R$ 199/mês):');
    if (!price) return;
    
    const description = prompt('Descrição:');
    if (!description) return;
    
    const features = prompt('Características (separadas por vírgula):');
    if (!features) return;

    try {
        const response = await fetch(`${API_URL}/content/pricing`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, price, description, features })
        });

        if (response.ok) {
            alert('✅ Novo plano criado com sucesso!');
            loadPricingEditor();
        } else {
            alert('❌ Erro ao criar plano');
        }
    } catch (error) {
        console.error('Erro ao criar plano:', error);
        alert('❌ Erro ao conectar ao servidor');
    }
}

// ============================================
// ⚙️ CONFIGURAÇÕES
// ============================================

async function loadSettings() {
    const container = document.getElementById('settingsEditor');
    
    container.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h3><i class="fas fa-cog"></i> Informações do Sistema</h3>
            </div>
            
            <div class="editor-grid">
                <div class="editor-field">
                    <label>📌 Nome da Empresa</label>
                    <input type="text" value="VendaPlano - Sistema de Gestão" readonly>
                </div>
                
                <div class="editor-field">
                    <label>📧 Email de Contato</label>
                    <input type="email" value="contato@vendaplano.com.br" readonly>
                </div>
                
                <div class="editor-field">
                    <label>📱 Telefone</label>
                    <input type="tel" value="(11) 99999-9999" readonly>
                </div>
                
                <div class="editor-field">
                    <label>🌐 URL da API</label>
                    <input type="text" value="${API_URL}" readonly>
                </div>
                
                <div class="editor-field">
                    <label>👤 Usuário Logado</label>
                    <input type="text" value="${sessionStorage.getItem('adminUser') || 'Admin'}" readonly>
                </div>
                
                <div class="editor-field">
                    <label>📊 Versão do Sistema</label>
                    <input type="text" value="v1.0 - Dashboard Pro" readonly>
                </div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h4 style="margin-bottom: 15px; color: #667eea;">
                    <i class="fas fa-info-circle"></i> Sobre o Sistema
                </h4>
                <p style="color: #666; line-height: 1.6;">
                    <strong>VendaPlano Dashboard Pro</strong> é um sistema completo de gestão de leads e vendas
                    de planos de saúde. Oferece classificação inteligente de leads (quente/morno/frio),
                    relatórios detalhados, exportação para Excel e edição remota do site.
                </p>
                
                <h4 style="margin: 20px 0 15px; color: #667eea;">
                    <i class="fas fa-rocket"></i> Funcionalidades
                </h4>
                <ul style="color: #666; line-height: 2;">
                    <li>📊 Dashboard com estatísticas em tempo real</li>
                    <li>👥 Gestão completa de leads com classificação automática</li>
                    <li>📈 Gráficos interativos (Chart.js)</li>
                    <li>📤 Exportação para Excel (SheetJS)</li>
                    <li>✏️ Editor de conteúdo do site principal</li>
                    <li>💰 Gestão de preços e planos</li>
                    <li>🔐 Autenticação JWT segura</li>
                </ul>
                
                <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #667eea; border-radius: 5px;">
                    <strong style="color: #667eea;"><i class="fas fa-database"></i> Banco de Dados:</strong>
                    <p style="color: #666; margin-top: 5px;">SQLite com 8 tabelas ativas</p>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: white; border-left: 4px solid #28a745; border-radius: 5px;">
                    <strong style="color: #28a745;"><i class="fas fa-server"></i> Servidor:</strong>
                    <p style="color: #666; margin-top: 5px;">Node.js + Express rodando em ${API_URL.replace('/api', '')}</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// 🌐 EXPORTAR FUNÇÕES GLOBAIS
// ============================================
window.logout = logout;
window.showSection = showSection;
window.exportLeadsToExcel = exportLeadsToExcel;
window.exportFullReport = exportFullReport;
window.refreshLeads = refreshLeads;
