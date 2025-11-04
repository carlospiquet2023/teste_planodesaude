/**
 * 🔄 CONTENT LOADER - Carrega conteúdo dinâmico do banco de dados
 * Atualiza elementos do site com conteúdo editável pelo painel admin
 */

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : `${window.location.origin}/api`;

// Função para carregar conteúdo do site
async function loadSiteContent() {
    try {
        // Carregar conteúdo editável
        const contentResponse = await fetch(`${API_URL}/content/public`);
        const contentData = await contentResponse.json();
        
        if (contentData.success && contentData.content) {
            applyContentToPage(contentData.content);
        }
        
        // Carregar configurações
        const settingsResponse = await fetch(`${API_URL}/settings/public`);
        const settingsData = await settingsResponse.json();
        
        if (settingsData.success && settingsData.settings) {
            applySettingsToPage(settingsData.settings);
        }
        
        // Carregar planos
        const plansResponse = await fetch(`${API_URL}/pricing/public`);
        const plansData = await plansResponse.json();
        
        if (plansData.success && plansData.plans) {
            applyPlansToPage(plansData.plans);
        }
        
    } catch (error) {
        console.log('Usando conteúdo padrão do HTML');
    }
}

// Aplicar conteúdo aos elementos da página
function applyContentToPage(content) {
    content.forEach(item => {
        // Buscar elemento com data-content
        const element = document.querySelector(`[data-content="${item.element_key}"]`);
        if (element) {
            if (item.element_type === 'html') {
                element.innerHTML = item.value;
            } else if (item.element_type === 'number') {
                element.textContent = item.value;
            } else {
                element.textContent = item.value;
            }
            console.log(`✅ Atualizado: ${item.element_key} = ${item.value}`);
        }
    });
}

// Aplicar configurações
function applySettingsToPage(settings) {
    settings.forEach(setting => {
        // Buscar elemento com data-setting
        const elements = document.querySelectorAll(`[data-setting="${setting.key}"]`);
        elements.forEach(el => {
            el.textContent = setting.value;
            
            // Adicionar links se necessário
            if (setting.key === 'phone') {
                el.href = `tel:${setting.value.replace(/\D/g, '')}`;
            } else if (setting.key === 'whatsapp') {
                el.href = `https://wa.me/${setting.value}`;
            } else if (setting.key === 'email') {
                el.href = `mailto:${setting.value}`;
            }
        });
        
        console.log(`✅ Configuração aplicada: ${setting.key} = ${setting.value}`);
    });
}

// Aplicar planos de preços
function applyPlansToPage(plans) {
    const plansContainer = document.querySelector('[data-plans-container]');
    if (!plansContainer) return;
    
    // Ordenar planos
    plans.sort((a, b) => a.display_order - b.display_order);
    
    plansContainer.innerHTML = plans.map(plan => {
        const features = JSON.parse(plan.features || '[]');
        const isFeatured = plan.is_featured === 1;
        
        return `
            <div class="pricing-card ${isFeatured ? 'featured' : ''}">
                ${isFeatured ? '<div class="popular-badge">Mais Popular</div>' : ''}
                <h3 class="plan-name">${plan.name}</h3>
                <div class="plan-price">
                    ${plan.original_price ? `<span class="price-old">R$ ${plan.original_price.toFixed(2)}</span>` : ''}
                    <span class="price-current">R$ ${plan.price.toFixed(2)}</span>
                    <span class="price-period">/mês</span>
                </div>
                <ul class="plan-features">
                    ${features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
                <button class="btn-plan" onclick="selectPlan('${plan.name}', ${plan.price})">
                    Contratar Agora
                </button>
            </div>
        `;
    }).join('');
}

// Função para selecionar plano
function selectPlan(planName, price) {
    // Rolar para o simulador
    const simulador = document.getElementById('simulador');
    if (simulador) {
        simulador.scrollIntoView({ behavior: 'smooth' });
        
        // Preencher campo do plano se existir
        setTimeout(() => {
            const planSelect = document.querySelector('select[name="interested_plan"]');
            if (planSelect) {
                const option = Array.from(planSelect.options).find(opt => 
                    opt.text.includes(planName)
                );
                if (option) {
                    planSelect.value = option.value;
                }
            }
        }, 500);
    }
}

// Carregar conteúdo quando a página carregar
document.addEventListener('DOMContentLoaded', loadSiteContent);

// Exportar funções para uso global
window.loadSiteContent = loadSiteContent;
window.selectPlan = selectPlan;
