const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

/**
 * 🛡️ MIDDLEWARE DE SEGURANÇA AVANÇADO
 * Proteção contra ataques comuns: XSS, Clickjacking, MIME Sniffing, etc.
 */

// Configuração do Helmet - Proteção de Headers HTTP
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        "https://cdn.sheetjs.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"], // ✅ Permite onclick, onload, etc
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.jsdelivr.net", 
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "http://localhost:3000", "https://api.vendaplano.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  noSniff: true, // X-Content-Type-Options: nosniff
  frameguard: { action: 'deny' }, // X-Frame-Options: DENY
  xssFilter: true, // X-XSS-Protection: 1; mode=block
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Rate Limiter para Login (mais restritivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  skipSuccessfulRequests: true, // não conta requisições bem-sucedidas
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const logger = require('./logger');
    logger.warn(`Rate limit excedido para login - IP: ${req.ip}, Usuario: ${req.body.username}`);
    res.status(429).json({
      success: false,
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    });
  }
});

// Rate Limiter para API geral
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate Limiter para criação de recursos (mais restritivo)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // máximo 50 criações por hora
  message: {
    success: false,
    error: 'Limite de criação de recursos excedido. Tente novamente em 1 hora.'
  }
});

// Sanitização de dados - Remove caracteres perigosos
const sanitizeData = (req, res, next) => {
  // Remove caracteres NoSQL injection
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  
  // Remove caracteres perigosos HTML/JS
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/javascript:/gi, '');
      }
    });
  }
  
  next();
};

// Proteção contra HTTP Parameter Pollution
const hppProtection = hpp({
  whitelist: ['status', 'limit', 'offset', 'sort'] // Parâmetros que podem ser duplicados
});

// Validação de Content-Type
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type deve ser application/json'
      });
    }
  }
  next();
};

// Middleware de segurança de headers customizado
const securityHeaders = (req, res, next) => {
  // Remove header que expõe tecnologia
  res.removeHeader('X-Powered-By');
  
  // Headers de segurança adicionais
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Proteção contra timing attacks no login
const timingSafeEqual = async (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  const crypto = require('crypto');
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  
  if (bufferA.length !== bufferB.length) {
    // Adiciona delay aleatório para prevenir timing attacks
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
};

module.exports = {
  helmetConfig,
  loginLimiter,
  apiLimiter,
  createLimiter,
  sanitizeData,
  hppProtection,
  validateContentType,
  securityHeaders,
  timingSafeEqual
};
