/**
 * 🧪 TESTES DE INTEGRAÇÃO - API COMPLETA
 * Testa o fluxo completo da aplicação
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

describe('🔗 Testes de Integração - API Completa', () => {
  let app;
  let token;
  const testDbPath = path.resolve(__dirname, '../../database/test.db');
  
  beforeAll(async () => {
    // Limpar banco de testes
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    // Inicializar banco de dados
    const { spawn } = require('child_process');
    await new Promise((resolve) => {
      const initDb = spawn('node', ['scripts/init-db.js'], {
        cwd: path.resolve(__dirname, '../../'),
        env: { ...process.env, DB_PATH: './database/test.db' }
      });
      initDb.on('close', resolve);
    });
    
    // Importar app
    app = require('../../server');
  });
  
  afterAll(async () => {
    // Cleanup
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  
  describe('🔐 Fluxo de Autenticação', () => {
    it('✅ Deve fazer login e receber token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      
      token = response.body.token;
    });
    
    it('✅ Deve acessar rota protegida com token', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
    });
    
    it('❌ Deve rejeitar acesso sem token', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('👥 Fluxo de Clientes', () => {
    it('✅ Deve criar um novo cliente', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11999999999',
          source: 'website'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.client).toBeDefined();
    });
    
    it('✅ Deve listar clientes', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.clients)).toBe(true);
    });
  });
  
  describe('💬 Fluxo de Conversas', () => {
    let conversationId;
    
    it('✅ Deve criar uma nova conversa', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .send({
          clientId: 1,
          status: 'active'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      conversationId = response.body.conversation.id;
    });
    
    it('✅ Deve enviar mensagem na conversa', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          conversationId,
          sender: 'client',
          message: 'Olá, gostaria de informações'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
    
    it('✅ Deve listar mensagens da conversa', async () => {
      const response = await request(app)
        .get(`/api/messages/${conversationId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.messages)).toBe(true);
    });
  });
  
  describe('🏥 Health Check', () => {
    it('✅ API deve estar operacional', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
