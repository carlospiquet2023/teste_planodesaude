const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'vendaplano_secret_key_2024';

const authMiddleware = (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de autenticação não fornecido' 
      });
    }

    // Verificar formato "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false,
        error: 'Formato de token inválido. Use: Bearer [token]' 
      });
    }

    const token = parts[1];

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adicionar informações do admin na requisição
    req.adminId = decoded.id;
    req.adminUsername = decoded.username;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado. Faça login novamente.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }

    return res.status(401).json({ 
      success: false,
      error: 'Erro na autenticação' 
    });
  }
};

module.exports = authMiddleware;

