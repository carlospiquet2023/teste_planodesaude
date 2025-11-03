const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const database = require('./config/database');

// 🛡️ Middlewares de Segurança
const { 
  helmetConfig, 
  apiLimiter, 
  sanitizeData, 
  hppProtection,
  validateContentType,
  securityHeaders 
} = require('./middleware/security');
const { httpLogger, logger } = require('./middleware/logger');
const { detectXss } = require('./middleware/validation');

// Rotas
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const simulationRoutes = require('./routes/simulations');
const dashboardRoutes = require('./routes/dashboard');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🛡️ CAMADA DE SEGURANÇA
// ============================================

// Helmet - Proteção de headers HTTP
app.use(helmetConfig);

// Headers de segurança customizados
app.use(securityHeaders);

// CORS configurado de forma segura
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Permite requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Body parser com limite de tamanho para prevenir DoS
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requisições HTTP
app.use(httpLogger);

// Sanitização de dados de entrada
app.use(sanitizeData);

// Proteção contra HTTP Parameter Pollution
app.use(hppProtection);

// Validação de Content-Type
app.use(validateContentType);

// Detecção de XSS
app.use(detectXss);

// Rate limiting na API
app.use('/api/', apiLimiter);

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/content', contentRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Rota principal - serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Rota admin - serve o dashboard PRO (painel unificado)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Rotas antigas redirecionam para o painel único (canonical)
app.get('/admin/cms', (req, res) => {
  res.redirect(301, '/admin');
});

app.get('/admin/simple', (req, res) => {
  res.redirect(301, '/admin');
});

// Tratamento de erros 404
app.use((req, res) => {
  logger.warn(`Rota não encontrada: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Não expõe detalhes do erro em produção
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Erro interno do servidor';
  
  res.status(err.status || 500).json({
    success: false,
    error: errorMessage
  });
});

// Inicializar servidor
async function startServer() {
  try {
    await database.connect();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🛡️ Segurança ativada: Helmet, Rate Limiting, Sanitização, XSS Protection`);
      console.log(`\n✅ Servidor iniciado com sucesso!`);
      console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🔐 Admin disponível em: http://localhost:${PORT}/admin\n`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  console.error('ERRO CRÍTICO - Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  console.error('ERRO CRÍTICO - Promise rejeitada:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor graciosamente...');
  process.exit(0);
});

startServer();
