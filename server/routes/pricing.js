const express = require('express');
const router = express.Router();
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ============================================
// 💰 GERENCIAMENTO DE PLANOS DE PREÇOS
// ============================================

// 🌐 Obter planos públicos (SEM autenticação - para o site)
router.get('/public', async (req, res) => {
  try {
    const db = await database.connect();
    
    const plans = await db.all(`
      SELECT id, name, price, original_price, features, is_featured, display_order 
      FROM pricing_plans 
      ORDER BY display_order ASC
    `);
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('Erro ao buscar planos públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos'
    });
  }
});

// Obter todos os planos (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await database.connect();
    
    const plans = await db.all(`
      SELECT * FROM pricing_plans 
      ORDER BY display_order ASC
    `);
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos'
    });
  }
});

// Atualizar plano
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, original_price, features, is_featured, display_order } = req.body;
    
    const db = await database.connect();
    
    await db.run(`
      UPDATE pricing_plans 
      SET name = ?, price = ?, original_price = ?, features = ?, 
          is_featured = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [name, price, original_price, JSON.stringify(features), is_featured, display_order, id]);
    
    res.json({
      success: true,
      message: 'Plano atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar plano'
    });
  }
});

module.exports = router;
