const express = require('express');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { clientValidation, queryValidation } = require('../middleware/validation');
const { createLimiter } = require('../middleware/security');
const { securityLogger } = require('../middleware/logger');
const router = express.Router();

// Criar novo cliente (público - usado pelo chat) com rate limiting e validação
router.post('/', createLimiter, clientValidation.create, async (req, res) => {
  try {
    const { name, email, phone, city, state, interested_plan, source } = req.body;

    const result = await database.run(
      `INSERT INTO clients (name, email, phone, city, state, interested_plan, source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'novo')`,
      [name, email, phone, city, state, interested_plan, source || 'chat']
    );

    const client = await database.get('SELECT * FROM clients WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      client
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar cliente' 
    });
  }
});

// Listar todos os clientes (protegido) com paginação validada
router.get('/', authMiddleware, queryValidation.pagination, async (req, res) => {
  try {
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

    res.json({
      success: true,
      clients,
      total: total.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Buscar cliente por ID (protegido)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await database.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
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

    res.json({
      success: true,
      client,
      conversations,
      simulations
    });

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Atualizar cliente (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, city, state, status, interested_plan } = req.body;

    await database.run(
      `UPDATE clients 
       SET name = ?, email = ?, phone = ?, city = ?, state = ?, status = ?, interested_plan = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, city, state, status, interested_plan, req.params.id]
    );

    const client = await database.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      client
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente (protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await database.run('DELETE FROM clients WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;
