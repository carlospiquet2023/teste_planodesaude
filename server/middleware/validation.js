const { body, param, query, validationResult } = require('express-validator');
const { securityLogger } = require('./logger');

/**
 * 🛡️ VALIDAÇÃO E SANITIZAÇÃO DE ENTRADA
 * Protege contra injection attacks e dados malformados
 */

// Middleware para verificar erros de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Loga tentativas suspeitas
    const suspiciousPatterns = /(\$|<script|javascript:|onerror=|alert\(|union\s+select)/i;
    const values = Object.values(req.body).concat(Object.values(req.query)).join(' ');
    
    if (suspiciousPatterns.test(values)) {
      securityLogger.suspiciousActivity('Validação falhou com padrões suspeitos', {
        ip: req.ip,
        errors: errors.array(),
        body: req.body
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Dados de entrada inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Validações para autenticação
const authValidation = {
  login: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username deve ter entre 3 e 50 caracteres')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username contém caracteres inválidos')
      .escape(),
    
    body('password')
      .isLength({ min: 6, max: 100 })
      .withMessage('Senha deve ter entre 6 e 100 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
    
    validateRequest
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    
    body('newPassword')
      .isLength({ min: 8, max: 100 })
      .withMessage('Nova senha deve ter no mínimo 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais'),
    
    body('newPassword').custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Nova senha deve ser diferente da senha atual');
      }
      return true;
    }),
    
    validateRequest
  ]
};

// Validações para clientes
const clientValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('Nome contém caracteres inválidos')
      .escape(),
    
    body('email')
      .optional({ checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('Email muito longo'),
    
    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^[\d\s()+-]+$/)
      .withMessage('Telefone contém caracteres inválidos')
      .isLength({ min: 10, max: 20 })
      .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
    
    body('city')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Cidade muito longa')
      .escape(),
    
    body('state')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter 2 caracteres')
      .toUpperCase(),
    
    body('interested_plan')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 })
      .withMessage('Plano muito longo')
      .escape(),
    
    validateRequest
  ],
  
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID inválido'),
    
    body('status')
      .optional()
      .isIn(['novo', 'contatado', 'negociando', 'fechado', 'perdido'])
      .withMessage('Status inválido'),
    
    body('notes')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notas muito longas')
      .escape(),
    
    validateRequest
  ]
};

// Validações para mensagens
const messageValidation = {
  create: [
    body('conversation_id')
      .isInt({ min: 1 })
      .withMessage('ID da conversa inválido'),
    
    body('sender')
      .isIn(['user', 'bot'])
      .withMessage('Sender deve ser "user" ou "bot"'),
    
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Mensagem deve ter entre 1 e 2000 caracteres')
      .escape(),
    
    body('message_type')
      .optional()
      .isIn(['text', 'simulation', 'option', 'form'])
      .withMessage('Tipo de mensagem inválido'),
    
    validateRequest
  ]
};

// Validações para simulações
const simulationValidation = {
  create: [
    body('plan_type')
      .isIn(['start', 'growth', 'enterprise'])
      .withMessage('Tipo de plano inválido'),
    
    body('num_users')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Número de usuários inválido (1-10000)'),
    
    body('features')
      .optional()
      .isArray()
      .withMessage('Features deve ser um array'),
    
    body('monthly_price')
      .optional()
      .isFloat({ min: 0, max: 1000000 })
      .withMessage('Preço mensal inválido'),
    
    body('annual_price')
      .optional()
      .isFloat({ min: 0, max: 10000000 })
      .withMessage('Preço anual inválido'),
    
    validateRequest
  ]
};

// Validações para conteúdo
const contentValidation = {
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID inválido'),
    
    body('value')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Valor deve ter entre 1 e 5000 caracteres')
      .escape(),
    
    validateRequest
  ],
  
  bulkUpdate: [
    body('updates')
      .isArray({ min: 1, max: 100 })
      .withMessage('Updates deve ser um array com 1-100 itens'),
    
    body('updates.*.id')
      .isInt({ min: 1 })
      .withMessage('ID inválido no update'),
    
    body('updates.*.value')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Valor inválido no update')
      .escape(),
    
    validateRequest
  ]
};

// Validações para query parameters comuns
const queryValidation = {
  pagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit deve ser entre 1 e 100')
      .toInt(),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset deve ser maior ou igual a 0')
      .toInt(),
    
    validateRequest
  ]
};

// Sanitização SQL adicional
const sanitizeSql = (value) => {
  if (typeof value !== 'string') return value;
  
  // Detecta padrões de SQL injection
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\||;|\/\*|\*\/|xp_|sp_)/gi,
    /('|('')|;|--|\/\*|\*\/)/gi
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(value)) {
      securityLogger.sqlInjectionAttempt('IP não disponível', 'sanitizeSql', value);
      throw new Error('Caracteres não permitidos detectados');
    }
  }
  
  return value;
};

// Detecta XSS
const detectXss = (req, res, next) => {
  const xssPatterns = [
    /<script[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          securityLogger.xssAttempt(req.ip, value);
          return true;
        }
      }
    }
    return false;
  };
  
  // Verifica body, query e params
  const dataToCheck = { ...req.body, ...req.query, ...req.params };
  
  for (const key in dataToCheck) {
    if (checkValue(dataToCheck[key])) {
      return res.status(400).json({
        success: false,
        error: 'Conteúdo potencialmente perigoso detectado'
      });
    }
  }
  
  next();
};

module.exports = {
  validateRequest,
  authValidation,
  clientValidation,
  messageValidation,
  simulationValidation,
  contentValidation,
  queryValidation,
  sanitizeSql,
  detectXss
};
