/**
 * 🛠️ HELPERS - FUNÇÕES UTILITÁRIAS REUTILIZÁVEIS
 * Centraliza lógica comum para evitar duplicação de código
 */

const { logger } = require('../middleware/logger');

/**
 * Formata resposta de sucesso padronizada
 */
function successResponse(data, message = null) {
  return {
    success: true,
    ...(message && { message }),
    ...data
  };
}

/**
 * Formata resposta de erro padronizada
 */
function errorResponse(error, statusCode = 500) {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    success: false,
    error: error.message || error,
    ...(isDev && error.stack && { stack: error.stack }),
    statusCode
  };
}

/**
 * Wrapper para async/await com tratamento de erros
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Valida se um email é válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se um telefone brasileiro é válido
 */
function isValidPhone(phone) {
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Formata telefone brasileiro
 */
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Sanitiza entrada de usuário (básico)
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .substring(0, 1000); // Limita tamanho
}

/**
 * Gera ID único simples
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Delay/sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se está em ambiente de produção
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Paginação helper
 */
function paginate(items, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const total = items.length;
  const pages = Math.ceil(total / limit);
  
  return {
    data: items.slice(offset, offset + limit),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  };
}

/**
 * Logger seguro - substitui console.log
 */
function logInfo(message, meta = {}) {
  logger.info(message, meta);
}

function logError(message, error, meta = {}) {
  logger.error(message, {
    error: error.message || error,
    stack: error.stack,
    ...meta
  });
}

function logWarn(message, meta = {}) {
  logger.warn(message, meta);
}

function logDebug(message, meta = {}) {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(message, meta);
  }
}

module.exports = {
  successResponse,
  errorResponse,
  asyncHandler,
  isValidEmail,
  isValidPhone,
  formatPhone,
  sanitizeInput,
  generateId,
  sleep,
  isProduction,
  paginate,
  logInfo,
  logError,
  logWarn,
  logDebug
};
