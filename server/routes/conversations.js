const express = require('express');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Criar nova conversa (público)
router.post('/', async (req, res) => {
  try {
    const { client_id, session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID é obrigatório' });
    }

    const result = await database.run(
      'INSERT INTO conversations (client_id, session_id, status) VALUES (?, ?, ?)',
      [client_id, session_id, 'active']
    );

    const conversation = await database.get('SELECT * FROM conversations WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
});

// Listar todas as conversas (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT c.*, cl.name as client_name, cl.email as client_email 
      FROM conversations c
      LEFT JOIN clients cl ON c.client_id = cl.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE c.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY c.started_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const conversations = await database.all(sql, params);

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({ error: 'Erro ao listar conversas' });
  }
});

// Buscar conversa por ID ou session_id
router.get('/:identifier', async (req, res) => {
  try {
    let conversation;
    
    if (isNaN(req.params.identifier)) {
      // É um session_id
      conversation = await database.get('SELECT * FROM conversations WHERE session_id = ?', [req.params.identifier]);
    } else {
      // É um ID numérico
      conversation = await database.get('SELECT * FROM conversations WHERE id = ?', [req.params.identifier]);
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    // Buscar mensagens da conversa
    const messages = await database.all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversation.id]
    );

    res.json({
      success: true,
      conversation,
      messages
    });

  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

// Atualizar status da conversa (protegido)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updateData = { status };
    if (status === 'closed' || status === 'archived') {
      updateData.ended_at = new Date().toISOString();
    }

    await database.run(
      'UPDATE conversations SET status = ?, ended_at = ? WHERE id = ?',
      [status, updateData.ended_at || null, req.params.id]
    );

    const conversation = await database.get('SELECT * FROM conversations WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    res.status(500).json({ error: 'Erro ao atualizar conversa' });
  }
});

module.exports = router;
