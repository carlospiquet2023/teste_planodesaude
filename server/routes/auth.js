const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');
const { loginLimiter } = require('../middleware/security');
const { securityLogger } = require('../middleware/logger');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'vendaplano_secret_key_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

// Login do admin (com rate limiting e validação)
router.post('/login', loginLimiter, authValidation.login, async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Buscar admin no banco
    const admin = await database.get(
      'SELECT * FROM admins WHERE username = ?', 
      [username]
    );

    if (!admin) {
      // Não revelar se o usuário existe ou não (segurança)
      securityLogger.loginFailed(username, clientIp, 'Usuário não encontrado');
      
      // Delay intencional para dificultar brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      securityLogger.loginFailed(username, clientIp, 'Senha incorreta');
      
      // Delay intencional para dificultar brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        iat: Date.now()
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Atualizar último login
    await database.run(
      'UPDATE admins SET last_login = ? WHERE id = ?',
      [new Date().toISOString(), admin.id]
    );

    // Log de sucesso
    securityLogger.loginSuccess(username, clientIp);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });

  } catch (error) {
    securityLogger.suspiciousActivity('Erro no login', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    const { logger } = require('../middleware/logger');
    logger.error('❌ Erro no login:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno ao processar login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verificar se o token é válido
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const admin = await database.get(
      'SELECT id, username, email FROM admins WHERE id = ?',
      [req.adminId]
    );

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        error: 'Admin não encontrado' 
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao verificar autenticação' 
    });
  }
});

// Alterar senha (protegido)
router.post('/change-password', authMiddleware, authValidation.changePassword, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Buscar admin
    const admin = await database.get(
      'SELECT * FROM admins WHERE id = ?', 
      [req.adminId]
    );

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        error: 'Admin não encontrado' 
      });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, admin.password);

    if (!validPassword) {
      securityLogger.suspiciousActivity('Tentativa de troca de senha com senha atual incorreta', {
        adminId: req.adminId,
        ip: req.ip
      });
      
      return res.status(401).json({ 
        success: false,
        error: 'Senha atual incorreta' 
      });
    }

    // Criptografar nova senha com bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Atualizar no banco
    await database.run(
      'UPDATE admins SET password = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date().toISOString(), req.adminId]
    );

    // Log de segurança
    securityLogger.dataModification(req.adminId, 'change_password', 'admin', req.adminId);

    res.json({ 
      success: true, 
      message: 'Senha alterada com sucesso' 
    });

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    securityLogger.suspiciousActivity('Erro ao alterar senha', {
      adminId: req.adminId,
      error: error.message
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Erro ao alterar senha' 
    });
  }
});

module.exports = router;
