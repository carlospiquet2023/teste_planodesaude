const express = require('express');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Dashboard com estatísticas (protegido)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Total de clientes
    const totalClients = await database.get('SELECT COUNT(*) as count FROM clients');

    // Clientes novos (últimos 7 dias)
    const newClients = await database.get(
      "SELECT COUNT(*) as count FROM clients WHERE created_at >= datetime('now', '-7 days')"
    );

    // Total de conversas
    const totalConversations = await database.get('SELECT COUNT(*) as count FROM conversations');

    // Conversas ativas
    const activeConversations = await database.get(
      "SELECT COUNT(*) as count FROM conversations WHERE status = 'active'"
    );

    // Total de simulações
    const totalSimulations = await database.get('SELECT COUNT(*) as count FROM simulations');

    // Valor total de simulações
    const totalSimulationValue = await database.get('SELECT SUM(total_value) as total FROM simulations');

    // Clientes por status
    const clientsByStatus = await database.all(
      'SELECT status, COUNT(*) as count FROM clients GROUP BY status'
    );

    // Planos mais simulados
    const topPlans = await database.all(
      'SELECT plan_type, COUNT(*) as count FROM simulations GROUP BY plan_type ORDER BY count DESC LIMIT 5'
    );

    // Conversas por dia (últimos 7 dias)
    const conversationsByDay = await database.all(
      `SELECT DATE(started_at) as date, COUNT(*) as count 
       FROM conversations 
       WHERE started_at >= datetime('now', '-7 days')
       GROUP BY DATE(started_at)
       ORDER BY date ASC`
    );

    res.json({
      success: true,
      stats: {
        totalClients: totalClients.count,
        newClients: newClients.count,
        totalConversations: totalConversations.count,
        activeConversations: activeConversations.count,
        totalSimulations: totalSimulations.count,
        totalSimulationValue: totalSimulationValue.total || 0,
        clientsByStatus,
        topPlans,
        conversationsByDay
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Atividade recente
router.get('/recent-activity', authMiddleware, async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    // Últimos clientes
    const recentClients = await database.all(
      'SELECT id, name, email, created_at FROM clients ORDER BY created_at DESC LIMIT ?',
      [limit]
    );

    // Últimas conversas
    const recentConversations = await database.all(
      `SELECT c.id, c.session_id, c.started_at, cl.name as client_name
       FROM conversations c
       LEFT JOIN clients cl ON c.client_id = cl.id
       ORDER BY c.started_at DESC LIMIT ?`,
      [limit]
    );

    // Últimas simulações
    const recentSimulations = await database.all(
      `SELECT s.id, s.plan_type, s.total_value, s.created_at, cl.name as client_name
       FROM simulations s
       LEFT JOIN clients cl ON s.client_id = cl.id
       ORDER BY s.created_at DESC LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      recentClients,
      recentConversations,
      recentSimulations
    });

  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error);
    res.status(500).json({ error: 'Erro ao buscar atividade recente' });
  }
});

module.exports = router;
