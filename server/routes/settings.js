const express = require('express');
const router = express.Router();
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ============================================
// ⚙️ CONFIGURAÇÕES DO SITE
// ============================================

// 🌐 Obter configurações públicas (SEM autenticação - para o site)
router.get('/public', async (req, res) => {
  try {
    const db = await database.connect();
    
    const settings = await db.all(`
      SELECT key, value FROM site_settings
    `);
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações'
    });
  }
});

// Obter todas as configurações (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await database.connect();
    
    const settings = await db.all(`
      SELECT * FROM site_settings
    `);
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações'
    });
  }
});

// Atualizar configuração
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const db = await database.connect();
    
    // Verificar se existe
    const exists = await db.get('SELECT * FROM site_settings WHERE key = ?', [key]);
    
    if (exists) {
      await db.run(`
        UPDATE site_settings 
        SET value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE key = ?
      `, [value, key]);
    } else {
      await db.run(`
        INSERT INTO site_settings (key, value) VALUES (?, ?)
      `, [key, value]);
    }
    
    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configuração'
    });
  }
});

// Atualizar várias configurações de uma vez
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const db = await database.connect();
    
    for (const [key, value] of Object.entries(settings)) {
      const exists = await db.get('SELECT * FROM site_settings WHERE key = ?', [key]);
      
      if (exists) {
        await db.run(`
          UPDATE site_settings 
          SET value = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE key = ?
        `, [value, key]);
      } else {
        await db.run(`
          INSERT INTO site_settings (key, value) VALUES (?, ?)
        `, [key, value]);
      }
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
