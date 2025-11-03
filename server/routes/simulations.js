const express = require('express');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Criar nova simulação (público - usado pelo chat)
router.post('/', async (req, res) => {
  try {
    const { client_id, conversation_id, plan_type, dependents, total_value } = req.body;

    if (!plan_type || total_value === undefined) {
      return res.status(400).json({ error: 'Plan type e total value são obrigatórios' });
    }

    const result = await database.run(
      'INSERT INTO simulations (client_id, conversation_id, plan_type, dependents, total_value) VALUES (?, ?, ?, ?, ?)',
      [client_id, conversation_id, plan_type, dependents || 0, total_value]
    );

    const simulation = await database.get('SELECT * FROM simulations WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      simulation
    });

  } catch (error) {
    console.error('Erro ao criar simulação:', error);
    res.status(500).json({ error: 'Erro ao criar simulação' });
  }
});

// Listar todas as simulações (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const simulations = await database.all(
      `SELECT s.*, c.name as client_name, c.email as client_email 
       FROM simulations s
       LEFT JOIN clients c ON s.client_id = c.id
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      simulations
    });

  } catch (error) {
    console.error('Erro ao listar simulações:', error);
    res.status(500).json({ error: 'Erro ao listar simulações' });
  }
});

// Buscar simulações por cliente
router.get('/client/:client_id', async (req, res) => {
  try {
    const simulations = await database.all(
      'SELECT * FROM simulations WHERE client_id = ? ORDER BY created_at DESC',
      [req.params.client_id]
    );

    res.json({
      success: true,
      simulations
    });

  } catch (error) {
    console.error('Erro ao buscar simulações:', error);
    res.status(500).json({ error: 'Erro ao buscar simulações' });
  }
});

module.exports = router;
