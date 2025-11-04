const express = require('express');
const router = express.Router();
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ============================================
// 📄 GERENCIAMENTO DE CONTEÚDO DO SITE
// ============================================

// 🌐 Obter conteúdo público (SEM autenticação - para o site)
router.get('/public', async (req, res) => {
  try {
    const db = await database.connect();
    
    const content = await db.all(`
      SELECT section, element_key, element_type, value, description 
      FROM site_content 
      ORDER BY section, element_key
    `);
    
    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdo público:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar conteúdo do site'
    });
  }
});

// Obter todo o conteúdo editável do site (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await database.connect();
    
    const content = await db.all(`
      SELECT * FROM site_content 
      ORDER BY section, element_key
    `);
    
    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar conteúdo do site'
    });
  }
});

// Obter conteúdo por seção
router.get('/section/:section', authMiddleware, async (req, res) => {
  try {
    const { section } = req.params;
    const db = await database.connect();
    
    const content = await db.all(
      'SELECT * FROM site_content WHERE section = ? ORDER BY element_key',
      [section]
    );
    
    res.json({
      success: true,
      section: section,
      content: content
    });
  } catch (error) {
    console.error('Erro ao buscar seção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar seção do site'
    });
  }
});

// Atualizar elemento específico
router.put('/element/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Valor é obrigatório'
      });
    }
    
    const db = await database.connect();
    
    await db.run(
      `UPDATE site_content 
       SET value = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [value, id]
    );
    
    res.json({
      success: true,
      message: 'Conteúdo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar conteúdo'
    });
  }
});

// Atualizar múltiplos elementos de uma vez
router.put('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { updates } = req.body; // Array de {id, value}
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Updates deve ser um array'
      });
    }
    
    const db = await database.connect();
    
    for (const update of updates) {
      await db.run(
        `UPDATE site_content 
         SET value = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [update.value, update.id]
      );
    }
    
    res.json({
      success: true,
      message: `${updates.length} elementos atualizados com sucesso`
    });
  } catch (error) {
    console.error('Erro ao atualizar conteúdos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar conteúdos'
    });
  }
});

// Obter tabela de preços
router.get('/pricing', authMiddleware, async (req, res) => {
  try {
    const db = await database.connect();
    
    const plans = await db.all(`
      SELECT * FROM pricing_plans 
      ORDER BY display_order
    `);
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tabela de preços'
    });
  }
});

// Atualizar plano de preço
router.put('/pricing/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, original_price, features, is_featured } = req.body;
    
    const db = await database.connect();
    
    await db.run(
      `UPDATE pricing_plans 
       SET name = ?, price = ?, original_price = ?, 
           features = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, price, original_price, JSON.stringify(features), is_featured ? 1 : 0, id]
    );
    
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

// Criar novo plano
router.post('/pricing', authMiddleware, async (req, res) => {
  try {
    const { name, price, original_price, features, is_featured, display_order } = req.body;
    
    const db = await database.connect();
    
    const result = await db.run(
      `INSERT INTO pricing_plans 
       (name, price, original_price, features, is_featured, display_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, original_price, JSON.stringify(features), is_featured ? 1 : 0, display_order || 999]
    );
    
    res.json({
      success: true,
      message: 'Plano criado com sucesso',
      id: result.lastID
    });
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar plano'
    });
  }
});

// Deletar plano
router.delete('/pricing/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await database.connect();
    
    await db.run('DELETE FROM pricing_plans WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Plano deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar plano'
    });
  }
});

// Obter configurações do site
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const db = await database.connect();
    
    const settings = await db.all('SELECT * FROM site_settings');
    
    // Converter para objeto
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações'
    });
  }
});

// Atualizar configurações
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const settings = req.body;
    const db = await database.connect();
    
    for (const [key, value] of Object.entries(settings)) {
      await db.run(
        `INSERT OR REPLACE INTO site_settings (key, value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [key, value]
      );
    }
    
    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configurações'
    });
  }
});

module.exports = router;
