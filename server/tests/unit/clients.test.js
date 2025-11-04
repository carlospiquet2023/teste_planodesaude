/**
 * 🧪 TESTES UNITÁRIOS - CLIENTES
 * Testa operações CRUD de clientes
 */

const request = require('supertest');
const express = require('express');

// Mock do database
jest.mock('../../config/database');
const database = require('../../config/database');

describe('👥 Clientes - Testes Unitários', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    const clientRoutes = require('../../routes/clients');
    app.use('/api/clients', clientRoutes);
  });
  
  describe('POST /api/clients', () => {
    it('✅ Deve criar um novo cliente', async () => {
      database.run.mockResolvedValue({ lastID: 1 });
      
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
    
    it('❌ Deve rejeitar cliente sem nome', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          email: 'joao@example.com',
          phone: '11999999999'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('❌ Deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          name: 'João Silva',
          email: 'email-invalido',
          phone: '11999999999'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/clients', () => {
    it('✅ Deve listar todos os clientes', async () => {
      const mockClients = [
        { id: 1, name: 'João', email: 'joao@example.com' },
        { id: 2, name: 'Maria', email: 'maria@example.com' }
      ];
      
      database.all.mockResolvedValue(mockClients);
      
      const response = await request(app)
        .get('/api/clients');
      
      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(2);
    });
    
    it('✅ Deve retornar array vazio se não houver clientes', async () => {
      database.all.mockResolvedValue([]);
      
      const response = await request(app)
        .get('/api/clients');
      
      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(0);
    });
  });
  
  describe('GET /api/clients/:id', () => {
    it('✅ Deve buscar cliente por ID', async () => {
      const mockClient = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11999999999'
      };
      
      database.get.mockResolvedValue(mockClient);
      
      const response = await request(app)
        .get('/api/clients/1');
      
      expect(response.status).toBe(200);
      expect(response.body.client.name).toBe('João Silva');
    });
    
    it('❌ Deve retornar 404 se cliente não existir', async () => {
      database.get.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/clients/999');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('PUT /api/clients/:id', () => {
    it('✅ Deve atualizar cliente existente', async () => {
      database.run.mockResolvedValue({ changes: 1 });
      database.get.mockResolvedValue({
        id: 1,
        name: 'João Silva Atualizado',
        email: 'joao.novo@example.com'
      });
      
      const response = await request(app)
        .put('/api/clients/1')
        .send({
          name: 'João Silva Atualizado',
          email: 'joao.novo@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('DELETE /api/clients/:id', () => {
    it('✅ Deve deletar cliente existente', async () => {
      database.run.mockResolvedValue({ changes: 1 });
      
      const response = await request(app)
        .delete('/api/clients/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    it('❌ Deve retornar 404 ao deletar cliente inexistente', async () => {
      database.run.mockResolvedValue({ changes: 0 });
      
      const response = await request(app)
        .delete('/api/clients/999');
      
      expect(response.status).toBe(404);
    });
  });
});
