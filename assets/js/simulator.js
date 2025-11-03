// ============================================
// 🎯 SIMULADOR DE PREÇOS - LÓGICA COMPLETA
// ============================================

let currentStep = 1;
let simulatorData = {};
let iaraKnowledgeSimulator = null;

// Carregar dados das operadoras
async function loadOperadorasData() {
    try {
        const response = await fetch('assets/data/iara-knowledge.json');
        iaraKnowledgeSimulator = await response.json();
        console.log('✅ Dados das operadoras carregados!');
    } catch (error) {
        console.warn('⚠️ Usando dados padrão');
    }
}

// Carregar dados ao iniciar
loadOperadorasData();

// ============================================
// NAVEGAÇÃO ENTRE STEPS
// ============================================

function nextStep(step) {
    // Valida o step atual antes de avançar
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Coleta dados do step atual
    collectStepData(currentStep);
    
    // Oculta step atual
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    // Mostra próximo step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Atualiza step atual
    currentStep = step;
    
    // Scroll para o topo do formulário
    document.querySelector('.simulator-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Track evento
    VidaPremium.trackEvent('Simulator', 'Step', `Step ${step}`);
}

function prevStep(step) {
    // Oculta step atual
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    // Mostra step anterior
    document.getElementById(`step${step}`).classList.add('active');
    
    // Atualiza step atual
    currentStep = step;
    
    // Scroll para o topo do formulário
    document.querySelector('.simulator-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// VALIDAÇÃO DE STEPS
// ============================================

function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (field.type === 'radio') {
            const radioGroup = stepElement.querySelectorAll(`input[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked) {
                isValid = false;
                VidaPremium.showNotification('Por favor, selecione uma opção', 'error');
            }
        } else {
            if (!field.value || field.value.trim() === '') {
                isValid = false;
                field.style.borderColor = '#FF1744';
                VidaPremium.showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
                
                setTimeout(() => {
                    field.style.borderColor = '';
                }, 2000);
            }
        }
    });
    
    return isValid;
}

// ============================================
// COLETA DE DADOS
// ============================================

function collectStepData(step) {
    const stepElement = document.getElementById(`step${step}`);
    const inputs = stepElement.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                simulatorData[input.name] = input.value;
            }
        } else {
            simulatorData[input.name] = input.value;
        }
    });
    
    // Salva no localStorage
    VidaPremium.storage.set('simulatorData', simulatorData);
}

// ============================================
// SUBMISSÃO DO FORMULÁRIO
// ============================================

document.getElementById('simulatorForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Valida step final
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Coleta dados finais
    collectStepData(currentStep);
    
    // Mostra loading
    VidaPremium.showLoading();
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calcula idade
    const birthDate = new Date(simulatorData.birthDate);
    const age = calculateAge(birthDate);
    
    // Gera planos baseados nos dados
    const plans = generatePlans(simulatorData, age);
    
    // Esconde loading
    VidaPremium.hideLoading();
    
    // Mostra resultados
    showResults(plans);
    
    // Track conversão
    VidaPremium.trackEvent('Simulator', 'Complete', 'Simulation Completed');
});

// ============================================
// CÁLCULO DE IDADE
// ============================================

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// ============================================
// GERAÇÃO DE PLANOS COM DADOS REAIS
// ============================================

function generatePlans(data, age) {
    // Operadoras reais com dados aproximados do mercado
    const operators = [
        { 
            name: 'Amil', 
            rating: 4.5, 
            basePrice: 285,
            registroANS: '326305',
            rede: '50.000+ credenciados'
        },
        { 
            name: 'Bradesco Saúde', 
            rating: 4.3, 
            basePrice: 320,
            registroANS: '005711',
            rede: '45.000+ credenciados'
        },
        { 
            name: 'SulAmérica', 
            rating: 4.6, 
            basePrice: 395,
            registroANS: '003549',
            rede: '55.000+ credenciados'
        },
        { 
            name: 'Unimed', 
            rating: 4.4, 
            basePrice: 340,
            registroANS: 'Regional',
            rede: '110.000+ credenciados'
        },
        { 
            name: 'NotreDame Intermédica', 
            rating: 4.2, 
            basePrice: 265,
            registroANS: '359661',
            rede: '70.000+ credenciados'
        }
    ];
    
    // Calcula multiplicador baseado na idade (tabela ANS)
    let ageMultiplier = 1;
    if (age >= 0 && age <= 18) ageMultiplier = 1.0;
    else if (age >= 19 && age <= 23) ageMultiplier = 1.2;
    else if (age >= 24 && age <= 28) ageMultiplier = 1.4;
    else if (age >= 29 && age <= 33) ageMultiplier = 1.6;
    else if (age >= 34 && age <= 38) ageMultiplier = 1.9;
    else if (age >= 39 && age <= 43) ageMultiplier = 2.3;
    else if (age >= 44 && age <= 48) ageMultiplier = 2.8;
    else if (age >= 49 && age <= 53) ageMultiplier = 3.5;
    else if (age >= 54 && age <= 58) ageMultiplier = 4.5;
    else if (age >= 59) ageMultiplier = 6.0;
    
    // Ajustes por tipo de plano
    const typeMultiplier = data.planType === 'familiar' ? 2.3 : data.planType === 'empresarial' ? 0.75 : 1;
    
    // Ajuste por acomodação
    const accommodationMultiplier = data.accommodation === 'apartamento' ? 1.8 : 1;
    
    // Ajuste por coparticipação
    const coparticipationMultiplier = data.coparticipation === 'sim' ? 0.70 : 1;
    
    // Variação regional (5-15%)
    const regionalVariation = 1 + (Math.random() * 0.10 - 0.05);
    
    // Gera planos para cada operadora
    return operators.map(operator => {
        const baseCalculated = Math.round(
            operator.basePrice * 
            ageMultiplier * 
            typeMultiplier * 
            accommodationMultiplier * 
            coparticipationMultiplier *
            regionalVariation
        );
        
        // Adiciona variação de mercado (±8%)
        const marketVariation = 1 + (Math.random() * 0.16 - 0.08);
        const monthlyPrice = Math.round(baseCalculated * marketVariation);
        
        const originalPrice = Math.round(monthlyPrice * 1.35); // Preço "sem desconto"
        const discount = Math.round((1 - (monthlyPrice / originalPrice)) * 100);
        
        return {
            operator: operator.name,
            registroANS: operator.registroANS,
            rating: operator.rating,
            monthlyPrice,
            originalPrice,
            discount,
            coverage: data.accommodation === 'apartamento' ? 'Completa + Apartamento' : 'Completa - Enfermaria',
            network: operator.rede,
            carency: data.planType === 'empresarial' ? '24h (negociável)' : '24h emergência / 180 dias partos',
            benefits: [
                'Consultas médicas ilimitadas',
                'Exames laboratoriais e imagem',
                'Cirurgias de todas as complexidades',
                'Internação hospitalar',
                'Pronto-socorro 24h',
                data.accommodation === 'apartamento' ? 'Acomodação em apartamento' : 'Acomodação enfermaria',
                'Telemedicina incluída',
                operator.rating >= 4.5 ? 'Rede Premium' : 'Rede Credenciada'
            ]
        };
    }).sort((a, b) => a.monthlyPrice - b.monthlyPrice).slice(0, 4); // Mostra apenas os 4 melhores
}

// ============================================
// EXIBIÇÃO DE RESULTADOS
// ============================================

function showResults(plans) {
    // Cria modal de resultados
    const modal = document.createElement('div');
    modal.className = 'results-modal';
    modal.innerHTML = `
        <div class="results-overlay" onclick="closeResults()"></div>
        <div class="results-container">
            <button class="results-close" onclick="closeResults()">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="results-header">
                <i class="fas fa-check-circle"></i>
                <h2>🎉 Encontramos os <span class="highlight-gradient">MELHORES planos</span> para você!</h2>
                <p>Confira os planos selecionados especialmente para o seu perfil:</p>
                
                <div class="simulation-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>⚠️ IMPORTANTE - SIMULAÇÃO</strong>
                        <p>Os valores apresentados são SIMULAÇÕES baseadas em médias de mercado. Os valores REAIS podem variar para <strong>MAIS</strong> ou para <strong>MENOS</strong> dependendo de: estado de residência, histórico médico, análise cadastral, forma de pagamento e condições comerciais da operadora no momento da contratação.</p>
                        <p><small>✅ Todos os planos são regulamentados pela ANS • ⏰ Condições válidas por 48 horas</small></p>
                    </div>
                </div>
            </div>
            
            <div class="results-grid">
                ${plans.map((plan, index) => `
                    <div class="plan-card ${index === 0 ? 'plan-recommended' : ''}" style="animation-delay: ${index * 0.1}s">
                        ${index === 0 ? '<div class="recommended-tag">MELHOR CUSTO-BENEFÍCIO</div>' : ''}
                        
                        <div class="plan-header">
                            <h3>${plan.operator}</h3>
                            <div class="plan-rating">
                                ${'<i class="fas fa-star"></i>'.repeat(Math.floor(plan.rating))}
                                <span>${plan.rating}</span>
                            </div>
                        </div>
                        
                        <div class="plan-price">
                            <span class="price-original">De R$ ${plan.originalPrice.toLocaleString('pt-BR')}/mês</span>
                            <div class="price-current">
                                <span class="price-label">Por apenas</span>
                                <span class="price-value">R$ ${plan.monthlyPrice.toLocaleString('pt-BR')}</span>
                                <span class="price-period">/mês</span>
                            </div>
                            <div class="price-discount">${plan.discount}% DE ECONOMIA</div>
                        </div>
                        
                        <div class="plan-details">
                            <div class="plan-feature">
                                <i class="fas fa-shield-check"></i>
                                <div>
                                    <strong>Cobertura</strong>
                                    <span>${plan.coverage}</span>
                                </div>
                            </div>
                            <div class="plan-feature">
                                <i class="fas fa-hospital"></i>
                                <div>
                                    <strong>Rede</strong>
                                    <span>${plan.network}</span>
                                </div>
                            </div>
                            <div class="plan-feature">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <strong>Carência</strong>
                                    <span>${plan.carency}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="plan-benefits">
                            <strong>Benefícios inclusos:</strong>
                            <ul>
                                ${plan.benefits.map(benefit => `<li><i class="fas fa-check"></i> ${benefit}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <button class="btn-choose-plan" onclick="choosePlan('${plan.operator}', ${plan.monthlyPrice})">
                            <i class="fas fa-rocket"></i>
                            QUERO ESTE PLANO
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div class="results-footer">
                <p><i class="fas fa-info-circle"></i> Valores aproximados. O valor final pode variar de acordo com análise cadastral.</p>
                <button class="btn-talk-consultant" onclick="talkToConsultant()">
                    <i class="fas fa-headset"></i>
                    FALAR COM ESPECIALISTA
                </button>
            </div>
        </div>
    `;
    
    // Adiciona estilos
    const style = document.createElement('style');
    style.textContent = `
        .results-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            animation: fadeIn 0.3s ease;
        }
        
        .results-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
        }
        
        .results-container {
            position: relative;
            background: white;
            border-radius: 24px;
            max-width: 1400px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 3rem;
            animation: slideInUp 0.5s ease;
        }
        
        .results-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: #f8f9fa;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .results-close:hover {
            background: #FF1744;
            color: white;
            transform: rotate(90deg);
        }
        
        .results-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .results-header i {
            font-size: 4rem;
            color: #00E676;
            margin-bottom: 1rem;
            animation: zoomIn 0.6s ease;
        }
        
        .results-header h2 {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 1rem;
        }
        
        .results-header p {
            font-size: 1.2rem;
            color: #6c757d;
        }
        
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .plan-card {
            background: #f8f9fa;
            border: 3px solid #e9ecef;
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.3s ease;
            animation: fadeInUp 0.6s ease both;
            position: relative;
        }
        
        .plan-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            border-color: #0066FF;
        }
        
        .plan-recommended {
            border-color: #00E676;
            background: linear-gradient(180deg, rgba(0, 230, 118, 0.05) 0%, transparent 100%);
        }
        
        .recommended-tag {
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 800;
            white-space: nowrap;
        }
        
        .plan-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e9ecef;
        }
        
        .plan-header h3 {
            font-size: 1.5rem;
            font-weight: 800;
        }
        
        .plan-rating {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            color: #FFD700;
        }
        
        .plan-rating span {
            margin-left: 0.25rem;
            color: #1a1a2e;
            font-weight: 700;
        }
        
        .plan-price {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .price-original {
            display: block;
            text-decoration: line-through;
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .price-current {
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .price-label {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .price-value {
            font-size: 2.5rem;
            font-weight: 900;
            color: #0066FF;
        }
        
        .price-period {
            font-size: 1rem;
            color: #6c757d;
        }
        
        .price-discount {
            display: inline-block;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #1a1a2e;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 800;
        }
        
        .plan-details {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .plan-feature {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .plan-feature i {
            font-size: 1.5rem;
            color: #0066FF;
        }
        
        .plan-feature div {
            display: flex;
            flex-direction: column;
        }
        
        .plan-feature strong {
            font-size: 0.85rem;
            color: #6c757d;
        }
        
        .plan-feature span {
            font-size: 1rem;
            font-weight: 600;
        }
        
        .plan-benefits {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
        }
        
        .plan-benefits strong {
            display: block;
            margin-bottom: 1rem;
            font-size: 1rem;
        }
        
        .plan-benefits ul {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .plan-benefits li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        
        .plan-benefits li i {
            color: #00E676;
        }
        
        .btn-choose-plan {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .btn-choose-plan:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
        }
        
        .results-footer {
            text-align: center;
            padding-top: 2rem;
            border-top: 2px solid #e9ecef;
        }
        
        .results-footer p {
            color: #6c757d;
            margin-bottom: 1.5rem;
        }
        
        .btn-talk-consultant {
            padding: 1rem 2rem;
            background: transparent;
            color: #0066FF;
            border: 2px solid #0066FF;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .btn-talk-consultant:hover {
            background: #0066FF;
            color: white;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// ============================================
// AÇÕES DOS RESULTADOS
// ============================================

function closeResults() {
    const modal = document.querySelector('.results-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function choosePlan(operator, price) {
    // Salva escolha
    VidaPremium.storage.set('selectedPlan', { operator, price });
    
    // Track evento
    VidaPremium.trackEvent('Conversion', 'Plan Selected', operator);
    
    // Fecha resultados
    closeResults();
    
    // Abre formulário de cadastro ou chat
    openChat();
    
    // Notificação
    VidaPremium.showNotification('Ótima escolha! Vamos finalizar seu cadastro.', 'success');
}

function talkToConsultant() {
    VidaPremium.trackEvent('Contact', 'Consultant', 'From Results');
    VidaPremium.openWhatsApp('Olá! Fiz uma simulação e gostaria de falar com um especialista sobre os planos disponíveis.');
}

// Exporta funções globais
window.nextStep = nextStep;
window.prevStep = prevStep;
window.closeResults = closeResults;
window.choosePlan = choosePlan;
window.talkToConsultant = talkToConsultant;