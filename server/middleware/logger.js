const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * 📝 SISTEMA DE LOGGING DE SEGURANÇA
 * Registra eventos críticos, tentativas de ataque e erros
 */

// Formato customizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    // Adiciona metadados se existirem
    if (Object.keys(meta).length > 0) {
      // Remove dados sensíveis antes de logar
      const sanitizedMeta = sanitizeLogData(meta);
      log += ` ${JSON.stringify(sanitizedMeta)}`;
    }
    
    return log;
  })
);

// Remove dados sensíveis dos logs
function sanitizeLogData(data) {
  const sensitiveFields = ['password', 'token', 'jwt', 'secret', 'apiKey', 'creditCard'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
    
    // Sanitiza objetos aninhados
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
}

// Configuração do Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Log de erros em arquivo separado
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Log de segurança em arquivo separado
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    
    // Log combinado de todas as atividades
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 7
    })
  ]
});

// Em desenvolvimento, também loga no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Middleware para logar requisições HTTP
const httpLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Captura a resposta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    
    // Log de requisições suspeitas
    if (res.statusCode >= 400) {
      logger.warn('Requisição com erro', logData);
    } else {
      logger.info('Requisição HTTP', logData);
    }
  });
  
  next();
};

// Logs de segurança específicos
const securityLogger = {
  loginAttempt: (username, success, ip, reason = null) => {
    logger.info('Tentativa de login', {
      username,
      success,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  loginFailed: (username, ip, reason) => {
    logger.warn('Login falhou', {
      username,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  loginSuccess: (username, ip) => {
    logger.info('Login bem-sucedido', {
      username,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  unauthorizedAccess: (path, ip, reason) => {
    logger.warn('Acesso não autorizado', {
      path,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: (activity, details) => {
    logger.warn('Atividade suspeita detectada', {
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  dataModification: (adminId, action, resource, resourceId) => {
    logger.info('Modificação de dados', {
      adminId,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString()
    });
  },
  
  rateLimitExceeded: (ip, endpoint) => {
    logger.warn('Rate limit excedido', {
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },
  
  sqlInjectionAttempt: (ip, query, params) => {
    logger.error('Tentativa de SQL Injection detectada', {
      ip,
      query: query.substring(0, 200), // Limita tamanho
      params: sanitizeLogData(params),
      timestamp: new Date().toISOString()
    });
  },
  
  xssAttempt: (ip, payload) => {
    logger.error('Tentativa de XSS detectada', {
      ip,
      payload: payload.substring(0, 200),
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  httpLogger,
  securityLogger
};
