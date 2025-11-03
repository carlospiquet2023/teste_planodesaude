// Configuração da API
// Detecta automaticamente se está em produção ou desenvolvimento
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : `${window.location.origin}/api`;

// Gerenciador de sessão
class SessionManager {
  constructor() {
    this.sessionId = this.getOrCreateSession();
    this.conversationId = null;
    this.clientId = null;
  }

  getOrCreateSession() {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }

  async createConversation(clientId = null) {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          session_id: this.sessionId
        })
      });

      const data = await response.json();
      if (data.success) {
        this.conversationId = data.conversation.id;
        return data.conversation;
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  }

  async getConversation() {
    try {
      const response = await fetch(`${API_URL}/conversations/${this.sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        this.conversationId = data.conversation.id;
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
    }
  }
}

// Gerenciador de Cliente
class ClientManager {
  async createClient(clientData) {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      const data = await response.json();
      if (data.success) {
        return data.client;
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    }
  }
}

// Gerenciador de Mensagens
class MessageManager {
  constructor(conversationId) {
    this.conversationId = conversationId;
  }

  async sendMessage(sender, message, messageType = 'text') {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: this.conversationId,
          sender,
          message,
          message_type: messageType
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  async getMessages() {
    try {
      const response = await fetch(`${API_URL}/messages/conversation/${this.conversationId}`);
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }
}

// Gerenciador de Simulações
class SimulationManager {
  async saveSimulation(simulationData) {
    try {
      const response = await fetch(`${API_URL}/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
    }
  }
}

// Integração com o chat existente
class ChatIntegration {
  constructor() {
    this.sessionManager = new SessionManager();
    this.clientManager = new ClientManager();
    this.messageManager = null;
    this.simulationManager = new SimulationManager();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Tentar recuperar conversa existente
    const conversation = await this.sessionManager.getConversation();
    
    if (!conversation) {
      // Criar nova conversa
      await this.sessionManager.createConversation();
    }

    if (this.sessionManager.conversationId) {
      this.messageManager = new MessageManager(this.sessionManager.conversationId);
      this.initialized = true;
      console.log('Chat integrado com backend!');
    }
  }

  async saveUserMessage(message) {
    if (!this.initialized) await this.initialize();
    if (this.messageManager) {
      return await this.messageManager.sendMessage('user', message);
    }
  }

  async saveBotMessage(message) {
    if (!this.initialized) await this.initialize();
    if (this.messageManager) {
      return await this.messageManager.sendMessage('bot', message);
    }
  }

  async saveClientInfo(clientData) {
    if (!this.initialized) await this.initialize();
    
    // Adicionar informações da sessão
    clientData.source = 'chat';
    
    const client = await this.clientManager.createClient(clientData);
    
    if (client) {
      this.sessionManager.clientId = client.id;
      
      // Atualizar conversa com o cliente
      if (this.sessionManager.conversationId) {
        // Nota: Você pode adicionar uma rota para atualizar a conversa se necessário
        console.log('Cliente registrado:', client);
      }
    }
    
    return client;
  }

  async saveSimulation(planType, dependents, totalValue) {
    if (!this.initialized) await this.initialize();
    
    return await this.simulationManager.saveSimulation({
      client_id: this.sessionManager.clientId,
      conversation_id: this.sessionManager.conversationId,
      plan_type: planType,
      dependents: dependents,
      total_value: totalValue
    });
  }
}

// Instância global
const chatIntegration = new ChatIntegration();

// Inicializar automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chatIntegration.initialize();
  });
} else {
  chatIntegration.initialize();
}

// Exportar para uso global
window.chatIntegration = chatIntegration;
