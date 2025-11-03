// ============================================
// 🤖 IARA - INTELIGÊNCIA ARTIFICIAL AVANÇADA
// Especialista em Planos de Saúde
// ============================================

const IARA_AVATAR = 'https://i.pravatar.cc/200?img=10';
const IARA_AVATAR_FALLBACK = 'https://ui-avatars.com/api/?name=IARA&background=667eea&color=fff&size=200';
const WHATSAPP_VENDEDOR = '5521977434614';

let chatOpen = false;
let conversationData = {
    name: '',
    phone: '',
    age: '',
    city: '',
    planType: '',
    coverage: '',
    hasHealthIssues: '',
    budget: '',
    questions: [],
    score: 0,
    startTime: new Date()
};

// Integração com Backend
let backendIntegrated = false;
let currentConversationId = null;
let currentClientId = null;

// Base de conhecimento da IARA
const iaraKnowledge = {
    saudacoes: [
        "Olá! 👋 Sou a IARA, sua consultora especialista em planos de saúde.",
        "Estou aqui para te ajudar a encontrar o plano PERFEITO para você e sua família!",
        "Vamos conversar um pouquinho para eu entender suas necessidades?"
    ],
    
    respostas: {
        carencias: {
            keywords: ['carência', 'carencia', 'prazo', 'quanto tempo', 'quando posso usar'],
            resposta: "Excelente pergunta, {name}! 😊\n\nAs carências variam por tipo:\n\n✅ **Urgência/Emergência:** 24 horas\n✅ **Consultas e exames simples:** 30 dias\n✅ **Exames especiais:** 180 dias\n✅ **Partos:** 300 dias (10 meses)\n✅ **Cirurgias:** 180 dias\n\n💡 **ÓTIMA NOTÍCIA:** Com portabilidade, você mantém as carências já cumpridas!\n\nVocê já tem algum plano atualmente?"
        },
        
        cobertura: {
            keywords: ['cobre', 'coberto', 'inclui', 'tem', 'oferece', 'disponível'],
            resposta: "Ótima pergunta, {name}! 👏\n\nTodos os planos regulamentados pela ANS cobrem:\n\n🏥 **Internações** (clínica e cirúrgica)\n👨‍⚕️ **Consultas** médicas ilimitadas\n🔬 **Exames** laboratoriais e de imagem\n💊 **Tratamentos** ambulatoriais\n🚑 **Emergências** 24 horas\n👶 **Obstetrícia** completa\n🦷 **Odontologia** (alguns planos)\n\nO que mais te interessa saber?"
        },
        
        preco: {
            keywords: ['quanto custa', 'valor', 'preço', 'preco', 'mensalidade', 'barato', 'caro'],
            resposta: "Entendo sua preocupação com investimento, {name}! 💰\n\nO valor varia conforme:\n📊 **Sua idade** (ANS permite reajuste por faixa etária)\n👥 **Tipo de plano** (individual, familiar, empresarial)\n🏨 **Acomodação** (enfermaria ou apartamento)\n🏙️ **Cidade/Estado**\n💳 **Forma de pagamento**\n\nPara te dar um valor REAL, preciso de alguns dados.\n\nQual sua idade?"
        },
        
        operadoras: {
            keywords: ['operadora', 'qual plano', 'amil', 'bradesco', 'sulamerica', 'unimed', 'notredame'],
            resposta: "Ótima pergunta, {name}! 🏆\n\nTrabalhamos com as TOP operadoras:\n\n⭐ **Amil** - Excelente rede nacional\n⭐ **SulAmérica** - Premium, melhor custo-benefício\n⭐ **Bradesco Saúde** - Tradicional e confiável\n⭐ **Unimed** - Maior rede credenciada\n⭐ **NotreDame Intermédica** - Ótimo preço\n\nTodas regulamentadas ANS! Qual seu interesse?"
        },
        
        documentos: {
            keywords: ['documento', 'precisa', 'necessário', 'necessario', 'cpf', 'rg'],
            resposta: "Tranquilo, {name}! 📄\n\nPara contratar você precisa:\n\n✅ **RG e CPF**\n✅ **Comprovante de residência**\n✅ **Declaração de saúde** (formulário simples)\n\n*Obs: Para empresarial, precisa CNPJ e contrato social*\n\nMas não se preocupe! Nosso time te ajuda com TUDO isso. 😉"
        },
        
        urgente: {
            keywords: ['urgente', 'rápido', 'rapido', 'hoje', 'agora', 'preciso logo'],
            resposta: "Entendo a urgência, {name}! 🚨\n\nTemos **aprovação expressa em até 24h**!\n\nProcesso rápido:\n1️⃣ Você preenche proposta (5 min)\n2️⃣ Enviamos para operadora\n3️⃣ Aprovação em até 24h\n4️⃣ Plano ativo!\n\n⚡ Em casos urgentes, podemos priorizar!\n\nQuer que eu já inicie seu processo?"
        },
        
        adesao: {
            keywords: ['como contratar', 'como faço', 'adesão', 'adesao', 'processo'],
            resposta: "Super fácil, {name}! 🎯\n\nPasso a passo:\n\n1️⃣ **Agora:** Você me passa seus dados\n2️⃣ **5 min:** Preenche proposta online\n3️⃣ **15 min:** Análise e envio docs\n4️⃣ **24h:** Aprovação da operadora\n5️⃣ **Pronto:** Plano ativo!\n\n✨ Simples assim! Vamos começar?"
        },

        portabilidade: {
            keywords: ['portabilidade', 'trocar', 'mudar', 'já tenho', 'tenho plano'],
            resposta: "Que bom que já cuida da saúde, {name}! 🎉\n\nCom **portabilidade** você:\n\n✅ Mantém carências cumpridas\n✅ Troca de operadora SEM novo prazo\n✅ Pode melhorar cobertura\n✅ Reduz mensalidade (em muitos casos)\n\n📋 Precisa ter:\n• Mínimo 2 anos no plano atual (ou 3 anos para partos)\n• Estar em dia com pagamentos\n\nQual plano você tem hoje?"
        },

        dependentes: {
            keywords: ['dependente', 'família', 'familia', 'filho', 'esposa', 'marido', 'cônjuge'],
            resposta: "Perfeito pensar na família toda, {name}! 👨‍👩‍👧‍👦\n\n**Plano Familiar** tem:\n\n💰 **Desconto progressivo** (quanto mais, menor o preço por pessoa)\n👥 Pode incluir: cônjuge, filhos até 21 anos (ou 24 se estudando)\n📊 Uma única mensalidade\n🎯 Gestão simplificada\n\nQuantas pessoas seriam?"
        },

        empresarial: {
            keywords: ['empresa', 'empresarial', 'cnpj', 'funcionário', 'funcionario', 'negócio'],
            resposta: "Excelente escolha, {name}! 🏢\n\n**Plano Empresarial** oferece:\n\n⭐ A partir de **2 vidas** já pode contratar\n💰 **Preço reduzido** (30% a 50% menor)\n⚡ **Sem carência** (em muitos casos)\n📊 Coparticipação opcional\n🎯 Benefício que valoriza colaboradores\n\nQuantos colaboradores você tem?"
        }
    }
};

// ============================================
// FUNÇÕES DE ABERTURA/FECHAMENTO
// ============================================

function openChat() {
    const chatWidget = document.getElementById('chatIara');
    const chatButton = document.querySelector('.chat-button');
    
    if (chatWidget && chatButton) {
        chatWidget.classList.add('active');
        chatButton.style.display = 'none';
        chatOpen = true;
        
        // Inicia conversa
        if (conversationData.name === '') {
            setTimeout(() => {
                sendIaraMessage(iaraKnowledge.saudacoes.join('<br><br>'));
            }, 500);
            
            setTimeout(() => {
                sendIaraMessage('Antes de começarmos, qual é o seu nome? 😊');
            }, 2000);
        }
    }
}

function closeChat() {
    const chatWidget = document.getElementById('chatIara');
    const chatButton = document.querySelector('.chat-button');
    
    if (chatWidget && chatButton) {
        chatWidget.classList.remove('active');
        chatButton.style.display = 'flex';
        chatOpen = false;
    }
}

// ============================================
// ENVIO DE MENSAGENS
// ============================================

function sendIaraMessage(message, delay = 0) {
    setTimeout(() => {
        const chatBody = document.getElementById('chatBody');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="${IARA_AVATAR}" alt="IARA" onerror="this.src='${IARA_AVATAR_FALLBACK}'">
            </div>
            <div class="message-bubble">
                ${message}
            </div>
        `;
        
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, delay);
}

function sendUserMessage(message) {
    const chatBody = document.getElementById('chatBody');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user';
    messageElement.innerHTML = `
        <div class="message-bubble">
            ${message}
        </div>
    `;
    
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Salvar no backend
    if (backendIntegrated) {
        saveMessageToBackend(message, 'user');
    }
}

function sendIaraMessage(message) {
    const chatBody = document.getElementById('chatBody');
    
    setTimeout(() => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot';
        messageElement.innerHTML = `
            <img src="${IARA_AVATAR}" alt="IARA" class="bot-avatar" onerror="this.src='${IARA_AVATAR_FALLBACK}'">
            <div class="message-bubble">
                ${message}
            </div>
        `;
        
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Salvar no backend
        if (backendIntegrated) {
            saveMessageToBackend(message, 'bot');
        }
    }, 800);
}

// Função auxiliar para salvar mensagens no backend
async function saveMessageToBackend(message, sender) {
    try {
        if (!window.chatIntegration) return;
        
        if (sender === 'user') {
            await window.chatIntegration.saveUserMessage(message);
        } else {
            await window.chatIntegration.saveBotMessage(message);
        }
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
    }
}

// ============================================
// PROCESSAMENTO INTELIGENTE
// ============================================

function processUserMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Envia mensagem do usuário
    sendUserMessage(message);
    input.value = '';
    
    // Salva na conversa
    conversationData.questions.push({
        user: message,
        timestamp: new Date()
    });
    
    // Processa resposta inteligente
    setTimeout(() => {
        processIntelligentResponse(message);
    }, 800);
}

function processIntelligentResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    const name = conversationData.name;
    
    // Se ainda não tem nome, captura
    if (name === '') {
        conversationData.name = userMessage.split(' ')[0]; // Pega primeiro nome
        conversationData.score += 10;
        
        sendIaraMessage(`Prazer em conhecer você, <strong>${conversationData.name}</strong>! 🤝✨`);
        
        setTimeout(() => {
            sendIaraMessage(`${conversationData.name}, qual seu telefone com DDD? Vou te enviar as melhores opções!`);
        }, 1500);
        return;
    }
    
    // Captura telefone
    if (conversationData.phone === '' && /\d{10,11}/.test(userMessage.replace(/\D/g, ''))) {
        conversationData.phone = userMessage.replace(/\D/g, '');
        conversationData.score += 10;
        
        sendIaraMessage(`Perfeito! Já salvei seu contato. 📱`);
        
        // Salvar cliente no backend
        handleUserDataComplete();
        
        setTimeout(() => {
            sendIaraMessage(`${conversationData.name}, me conta: você está buscando plano para você, sua família ou sua empresa?`);
        }, 1500);
        return;
    }
    
    // Detecta tipo de pergunta e responde
    let respondeu = false;
    
    for (const [tipo, config] of Object.entries(iaraKnowledge.respostas)) {
        if (config.keywords.some(keyword => msg.includes(keyword))) {
            const resposta = config.resposta.replace(/{name}/g, name);
            sendIaraMessage(resposta);
            conversationData.score += 3;
            respondeu = true;
            break;
        }
    }
    
    // Se não encontrou resposta específica, resposta genérica inteligente
    if (!respondeu) {
        handleGenericResponse(msg);
    }
}

function handleGenericResponse(msg) {
    const name = conversationData.name;
    
    // Captura idade
    if (/\b(\d{1,2})\b/.test(msg) && conversationData.age === '') {
        const idade = msg.match(/\b(\d{1,2})\b/)[1];
        if (parseInt(idade) >= 0 && parseInt(idade) <= 100) {
            conversationData.age = idade;
            conversationData.score += 5;
            
            sendIaraMessage(`Perfeito, ${name}! ${idade} anos. 👍`);
            
            setTimeout(() => {
                sendIaraMessage(`E qual sua cidade? Isso ajuda a encontrar a melhor rede credenciada para você!`);
            }, 1500);
            return;
        }
    }
    
    // Captura cidade
    if (conversationData.city === '' && msg.length > 3 && !conversationData.age) {
        conversationData.city = msg;
        conversationData.score += 3;
        
        sendIaraMessage(`${name}, você está em ${msg}. Ótimo! 🌆`);
        
        setTimeout(() => {
            askForMoreInfo();
        }, 1500);
        return;
    }
    
    // Resposta padrão inteligente
    const respostasGenericas = [
        `Entendi, ${name}! Deixa eu te explicar melhor sobre isso...`,
        `Boa pergunta, ${name}! Vou te dar uma resposta completa.`,
        `${name}, vou te ajudar com isso! 😊`
    ];
    
    const respostaAleatoria = respostasGenericas[Math.floor(Math.random() * respostasGenericas.length)];
    sendIaraMessage(respostaAleatoria);
    
    setTimeout(() => {
        sendIaraMessage(`Para te dar a melhor orientação, me conta um pouco mais sobre o que você precisa?\n\nPor exemplo:\n• Qual tipo de plano?\n• Faixa de preço?\n• Alguma necessidade específica?`);
    }, 2000);
}

function askForMoreInfo() {
    const name = conversationData.name;
    
    if (!conversationData.phone) {
        sendIaraMessage(`${name}, para continuar e te enviar as melhores opções personalizadas, preciso do seu WhatsApp.\n\nPode me passar? É só o número com DDD. 📱`);
    }
}

// ============================================
// FINALIZAÇÃO E ENVIO PARA WHATSAPP
// ============================================

function finalizarAtendimento() {
    const name = conversationData.name;
    
    sendIaraMessage(`Perfeito, ${name}! 🎉`);
    
    setTimeout(() => {
        sendIaraMessage(`Vou transferir você agora para nossa equipe humana que vai:\n\n✅ Confirmar os valores EXATOS\n✅ Tirar dúvidas finais\n✅ Finalizar sua contratação\n\nEm alguns segundos você será direcionado! ⏱️`);
    }, 1500);
    
    setTimeout(() => {
        enviarParaWhatsApp();
    }, 4000);
}

function enviarParaWhatsApp() {
    const name = conversationData.name;
    const duracao = Math.round((new Date() - conversationData.startTime) / 1000 / 60);
    
    // Monta mensagem completa para o vendedor
    let mensagem = `🤖 *LEAD QUALIFICADO - IARA*\n\n`;
    mensagem += `👤 *Nome:* ${conversationData.name || 'Não informado'}\n`;
    mensagem += `📱 *Telefone:* ${conversationData.phone || 'Não informado'}\n`;
    mensagem += `📅 *Idade:* ${conversationData.age || 'Não informado'}\n`;
    mensagem += `🏙️ *Cidade:* ${conversationData.city || 'Não informado'}\n`;
    mensagem += `📊 *Tipo:* ${conversationData.planType || 'Não informado'}\n`;
    mensagem += `💰 *Budget:* ${conversationData.budget || 'Não informado'}\n`;
    mensagem += `🔥 *Score:* ${conversationData.score} pontos\n`;
    mensagem += `⏱️ *Tempo conversa:* ${duracao} minutos\n\n`;
    
    if (conversationData.questions.length > 0) {
        mensagem += `💬 *Perguntas feitas:*\n`;
        conversationData.questions.slice(0, 5).forEach((q, i) => {
            mensagem += `${i + 1}. ${q.user}\n`;
        });
    }
    
    mensagem += `\n✅ Lead qualificado e pronto para fechamento!`;
    
    // Envia para WhatsApp
    const urlWhatsApp = `https://wa.me/${WHATSAPP_VENDEDOR}?text=${encodeURIComponent(mensagem)}`;
    
    sendIaraMessage(`${name}, clique no botão abaixo para falar com nossa equipe agora! 👇`);
    
    const chatBody = document.getElementById('chatBody');
    const whatsappButton = document.createElement('div');
    whatsappButton.className = 'chat-message bot';
    whatsappButton.innerHTML = `
        <div class="message-bubble" style="background: #25D366; padding: 0;">
            <a href="${urlWhatsApp}" target="_blank" style="display: block; padding: 1rem; color: white; text-decoration: none; font-weight: bold; text-align: center;">
                <i class="fab fa-whatsapp" style="font-size: 1.5rem; margin-right: 0.5rem;"></i>
                FALAR COM ESPECIALISTA AGORA
            </a>
        </div>
    `;
    
    chatBody.appendChild(whatsappButton);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.querySelector('.chat-send');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processUserMessage();
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', processUserMessage);
    }
    
    // Verificar se backend-integration está disponível
    if (typeof window.chatIntegration !== 'undefined') {
        backendIntegrated = true;
        console.log('✅ Chat integrado com backend');
    }
});

function sendMessage() {
    processUserMessage();
}

// Função para salvar cliente no backend
async function saveClientData() {
    if (!backendIntegrated || !window.chatIntegration) return;
    
    try {
        const clientData = {
            name: conversationData.name,
            phone: conversationData.phone,
            city: conversationData.city,
            interested_plan: conversationData.planType || 'A definir',
            source: 'chat',
            status: 'novo'
        };
        
        const client = await window.chatIntegration.saveClientInfo(clientData);
        
        if (client) {
            currentClientId = client.id;
            console.log('✅ Cliente salvo no backend:', client);
        }
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
    }
}

// Chamar quando o usuário fornecer nome e telefone
function handleUserDataComplete() {
    if (conversationData.name && conversationData.phone) {
        saveClientData();
    }
}
