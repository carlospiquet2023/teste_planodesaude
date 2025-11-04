const express = require('express');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { clientValidation, queryValidation } = require('../middleware/validation');
const { createLimiter } = require('../middleware/security');
const { securityLogger } = require('../middleware/logger');
const { ResponseHandler, asyncRoute } = require('../utils/response-handler');
const router = express.Router();

// Criar novo cliente (público - usado pelo chat) com rate limiting e validação
router.post('/', createLimiter, clientValidation.create, asyncRoute(async (req, res) => {
  const { name, email, phone, city, state, interested_plan, source } = req.body;

  const result = await database.run(
    `INSERT INTO clients (name, email, phone, city, state, interested_plan, source, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'novo')`,
    [name, email, phone, city, state, interested_plan, source || 'chat']
  );

  const client = await database.get('SELECT * FROM clients WHERE id = ?', [result.lastID]);

  return ResponseHandler.created(res, client, 'client');
}));

// Listar todos os clientes (protegido) com paginação validada
router.get('/', authMiddleware, queryValidation.pagination, asyncRoute(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  let sql = 'SELECT * FROM clients';
  const params = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const clients = await database.all(sql, params);
  const total = await database.get('SELECT COUNT(*) as count FROM clients');

  // Retornar no formato esperado pelo frontend
  return res.status(200).json({
    success: true,
    clients: clients || [],
    pagination: {
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      limit: parseInt(limit),
      total: total.count,
      pages: Math.ceil(total.count / parseInt(limit))
    }
  });
}));

// Buscar cliente por ID (protegido)
router.get('/:id', authMiddleware, asyncRoute(async (req, res) => {
  const client = await database.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);

  if (!client) {
    return ResponseHandler.notFound(res, 'Cliente');
  }

  // Buscar conversas do cliente
  const conversations = await database.all(
    'SELECT * FROM conversations WHERE client_id = ? ORDER BY started_at DESC',
    [req.params.id]
  );

  // Buscar simulações do cliente
  const simulations = await database.all(
    'SELECT * FROM simulations WHERE client_id = ? ORDER BY created_at DESC',
    [req.params.id]
  );

  return ResponseHandler.success(res, {
    client,
    conversations,
    simulations
  });
}));

// Atualizar cliente (protegido)
router.put('/:id', authMiddleware, asyncRoute(async (req, res) => {
  const { name, email, phone, city, state, status, interested_plan } = req.body;

  const result = await database.run(
    `UPDATE clients 
     SET name = ?, email = ?, phone = ?, city = ?, state = ?, status = ?, interested_plan = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, email, phone, city, state, status, interested_plan, req.params.id]
  );

  if (result.changes === 0) {
    return ResponseHandler.notFound(res, 'Cliente');
  }

  const client = await database.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);

  return ResponseHandler.successWithMessage(res, 'Cliente atualizado com sucesso', { client });
}));

// Deletar cliente (protegido)
router.delete('/:id', authMiddleware, asyncRoute(async (req, res) => {
  const result = await database.run('DELETE FROM clients WHERE id = ?', [req.params.id]);

  if (result.changes === 0) {
    return ResponseHandler.notFound(res, 'Cliente');
  }

  return ResponseHandler.successWithMessage(res, 'Cliente deletado com sucesso');
}));

module.exports = router;
