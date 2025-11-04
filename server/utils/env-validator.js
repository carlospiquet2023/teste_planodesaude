/**
 * 🔐 VALIDADOR DE VARIÁVEIS DE AMBIENTE
 * Garante que todas as variáveis críticas estão configuradas
 */

const { logger } = require('../middleware/logger');

/**
 * Variáveis obrigatórias
 */
const REQUIRED_VARS = [
  'NODE_ENV',
  'JWT_SECRET',
  'PORT'
];

/**
 * Variáveis recomendadas para produção
 */
const RECOMMENDED_VARS = [
  'CORS_ORIGIN',
  'DB_PATH',
  'LOG_LEVEL'
];

/**
 * Validações específicas
 */
const VALIDATIONS = {
  JWT_SECRET: (value) => {
    if (value.length < 32) {
      return 'JWT_SECRET deve ter no mínimo 32 caracteres';
    }
    if (value.includes('secret') || value.includes('key') || value.includes('vendaplano')) {
      return 'JWT_SECRET não deve conter palavras óbvias';
    }
    return null;
  },
  
  PORT: (value) => {
    const port = parseInt(value);
    if (isNaN(port) || port < 1 || port > 65535) {
      return 'PORT deve ser um número entre 1 e 65535';
    }
    return null;
  },
  
  NODE_ENV: (value) => {
    const valid = ['development', 'production', 'test'];
    if (!valid.includes(value)) {
      return `NODE_ENV deve ser: ${valid.join(', ')}`;
    }
    return null;
  }
};

/**
 * Valida se todas as variáveis necessárias estão configuradas
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  
  // Verificar variáveis obrigatórias
  REQUIRED_VARS.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`❌ Variável obrigatória ausente: ${varName}`);
    } else {
      // Executar validação específica
      if (VALIDATIONS[varName]) {
        const error = VALIDATIONS[varName](process.env[varName]);
        if (error) {
          errors.push(`❌ ${varName}: ${error}`);
        }
      }
    }
  });
  
  // Verificar variáveis recomendadas
  RECOMMENDED_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`⚠️ Variável recomendada ausente: ${varName}`);
    }
  });
  
  // Validações específicas de produção
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CORS_ORIGIN) {
      warnings.push('⚠️ CORS_ORIGIN não configurado - aceita todas as origens (inseguro)');
    }
    
    // Verifica JWT_SECRET em produção
    if (process.env.JWT_SECRET) {
      // Lista de JWT_SECRETs considerados inseguros
      const insecureSecrets = [
        'vendaplano_secret_key_2024',
        'secret',
        'password',
        '123456'
      ];
      
      if (insecureSecrets.some(insecure => process.env.JWT_SECRET.includes(insecure))) {
        warnings.push('⚠️ JWT_SECRET usando valor inseguro em produção');
      }
    }
  }
  
  // Log de resultados
  if (errors.length > 0) {
    logger.error('🚨 ERROS CRÍTICOS DE CONFIGURAÇÃO:');
    errors.forEach(err => logger.error(err));
    
    // Em produção, só lança erro se for crítico
    if (process.env.NODE_ENV === 'production') {
      logger.error('⚠️ Continuando apesar dos erros...');
      logger.error('⚠️ CORRIJA ESTES PROBLEMAS O MAIS RÁPIDO POSSÍVEL!');
    } else {
      throw new Error('Configuração inválida. Corrija os erros antes de iniciar.');
    }
  }
  
  if (warnings.length > 0) {
    logger.warn('⚠️ AVISOS DE CONFIGURAÇÃO:');
    warnings.forEach(warn => logger.warn(warn));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    logger.info('✅ Todas as variáveis de ambiente validadas com sucesso');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Gera chave JWT segura (para uso em scripts)
 */
function generateSecureKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Retorna configurações sanitizadas (sem informações sensíveis)
 */
function getSafeConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    dbPath: process.env.DB_PATH ? '***' : undefined,
    jwtConfigured: !!process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || 'all',
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

module.exports = {
  validateEnvironment,
  generateSecureKey,
  getSafeConfig,
  REQUIRED_VARS,
  RECOMMENDED_VARS
};
