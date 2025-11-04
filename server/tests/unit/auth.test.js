/**
 * 🧪 TESTES UNITÁRIOS - AUTENTICAÇÃO
 * Testa funcionalidades de login, JWT e segurança
 */

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock do database antes de importar as rotas
jest.mock('../../config/database');
const database = require('../../config/database');

describe('🔐 Autenticação - Testes Unitários', () => {
  let app;
  
  beforeAll(() => {
    // Criar app Express para testes
    app = express();
    app.use(express.json());
    
    // Importar rotas após mocks
    const authRoutes = require('../../routes/auth');
    app.use('/api/auth', authRoutes);
  });
  
  describe('POST /api/auth/login', () => {
    it('✅ Deve fazer login com credenciais válidas', async () => {
      // Arrange
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        email: 'admin@vendaplano.com'
      };
      
      database.get.mockResolvedValue(mockAdmin);
      database.run.mockResolvedValue({ changes: 1 });
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.admin.username).toBe('admin');
    });
    
    it('❌ Deve rejeitar credenciais inválidas', async () => {
      // Arrange
      database.get.mockResolvedValue(null);
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid',
          password: 'wrong'
        });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválidas');
    });
    
    it('❌ Deve rejeitar senha incorreta', async () => {
      // Arrange
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('correct', 10),
        email: 'admin@vendaplano.com'
      };
      
      database.get.mockResolvedValue(mockAdmin);
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrong_password'
        });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('🔒 Deve validar campos obrigatórios', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      // Assert
      expect(response.status).toBe(400);
    });
  });
  
  describe('🔐 JWT Token', () => {
    it('✅ Deve gerar token JWT válido', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        email: 'admin@vendaplano.com'
      };
      
      database.get.mockResolvedValue(mockAdmin);
      database.run.mockResolvedValue({ changes: 1 });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      expect(response.body.token).toBeDefined();
      
      // Verificar se o token é válido
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.username).toBe('admin');
    });
  });
});
