const express = require('express');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Criar nova mensagem (público - usado pelo chat)
router.post('/', async (req, res) => {
  try {
    const { conversation_id, sender, message, message_type } = req.body;

    if (!conversation_id || !sender || !message) {
      return res.status(400).json({ error: 'Conversation ID, sender e message são obrigatórios' });
    }

    const result = await database.run(
      'INSERT INTO messages (conversation_id, sender, message, message_type) VALUES (?, ?, ?, ?)',
      [conversation_id, sender, message, message_type || 'text']
    );

    const newMessage = await database.get('SELECT * FROM messages WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// Listar mensagens de uma conversa
router.get('/conversation/:conversation_id', async (req, res) => {
  try {
    const messages = await database.all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [req.params.conversation_id]
    );

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

// Responder mensagem do admin (protegido)
router.post('/admin-reply', authMiddleware, async (req, res) => {
  try {
    const { conversation_id, message } = req.body;

    if (!conversation_id || !message) {
      return res.status(400).json({ error: 'Conversation ID e message são obrigatórios' });
    }

    const result = await database.run(
      'INSERT INTO messages (conversation_id, sender, message, message_type) VALUES (?, ?, ?, ?)',
      [conversation_id, 'admin', message, 'text']
    );

    const newMessage = await database.get('SELECT * FROM messages WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
    res.status(500).json({ error: 'Erro ao enviar resposta' });
  }
});

module.exports = router;
