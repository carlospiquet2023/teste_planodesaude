const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

// Validar variáveis de ambiente ANTES de tudo
const { validateEnvironment } = require('./utils/env-validator');
validateEnvironment();

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

// 🚀 Cache e Performance
const { cacheMiddleware, redisClient } = require('./middleware/cache');
const { performanceMonitor } = require('./middleware/performance');

// Rotas
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const simulationRoutes = require('./routes/simulations');
const dashboardRoutes = require('./routes/dashboard');
const contentRoutes = require('./routes/content');
const pricingRoutes = require('./routes/pricing');
const settingsRoutes = require('./routes/settings');
const metricsRoutes = require('./routes/metrics');

const app = express();
const PORT = process.env.PORT || 10000;
const WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length;

// ============================================
// 🚀 CLUSTER MODE PARA ALTA DISPONIBILIDADE
// ============================================

if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  logger.info(`🎯 Master process ${process.pid} is running`);
  logger.info(`🚀 Spawning ${WORKERS} worker processes...`);

  // Fork workers
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`❌ Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info('🔄 Starting a new worker...');
    cluster.fork();
  });

  // Health check endpoint para master
  const healthApp = express();
  healthApp.get('/health', (req, res) => {
    const workers = Object.values(cluster.workers).map(w => w.id);
    res.json({
      status: 'healthy',
      master: true,
      pid: process.pid,
      workers: workers,
      workersCount: workers.length,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });
  healthApp.listen(PORT + 1, () => {
    logger.info(`🏥 Master health check on port ${PORT + 1}`);
  });

} else {
  // Worker process
  startServer();
}

function startServer() {
  const workerId = cluster.worker ? cluster.worker.id : 'single';
  
  // ============================================
  // ⚙️ CONFIGURAÇÕES DE ALTA PERFORMANCE
  // ============================================

  // Aumentar limite de conexões simultâneas
  app.set('trust proxy', 1);
  app.set('x-powered-by', false); // Segurança
  app.set('etag', 'strong'); // Cache eficiente

  // ============================================
  // 🗜️ COMPRESSÃO GZIP/BROTLI
  // ============================================

  app.use(compression({
    level: 6, // Balanceamento entre CPU e compressão
    threshold: 1024, // Apenas para respostas > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // ============================================
  // 📊 MONITORAMENTO DE PERFORMANCE
  // ============================================

  app.use(performanceMonitor);

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
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'https://teste-planodesaude.onrender.com'
    ];
    
    // Permite requisições sem origin (mobile apps, Postman, etc.)
    // E permite mesma origem em produção
    if (!origin || origin.includes('onrender.com')) {
      return callback(null, true);
    }
    
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
const staticPath = path.join(__dirname, '../');
logger.info(`📁 Servindo arquivos estáticos de: ${staticPath}`);
app.use(express.static(staticPath, {
  maxAge: '1d', // Cache de 1 dia para assets
  etag: true
}));

// Assets específicos
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/metrics', metricsRoutes);

// Rota de health check
const HealthCheck = require('./utils/health-check');

app.get('/api/health', async (req, res) => {
  const health = await HealthCheck.runSimpleCheck();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Rota de health check detalhada (protegida ou com query param)
app.get('/api/health/detailed', async (req, res) => {
  // Opcional: proteger com token ou query param secreto
  const health = await HealthCheck.runFullCheck();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Rota de debug removida por questões de segurança
// Usar diagnose.js ao invés: node diagnose.js

// Rota principal - serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Rota admin - serve o dashboard PRO (com e sem barra final)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

app.get('/admin/', (req, res) => {
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

  // ============================================
  // 🚀 INICIALIZAÇÃO DO SERVIDOR
  // ============================================

  // Inicializar banco de dados
  async function initDatabase() {
    logger.info('🔄 Verificando banco de dados...');
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const initDb = spawn('node', ['scripts/init-db.js'], {
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      initDb.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ Banco de dados verificado/inicializado!');
          resolve();
        } else {
          logger.warn('⚠️ Aviso: Erro ao inicializar banco (tentando continuar...)');
          resolve(); // Continua mesmo com erro
        }
      });
      
      initDb.on('error', (error) => {
        logger.error('⚠️ Erro ao executar init-db:', { error: error.message });
        resolve(); // Continua mesmo com erro
      });
    });
  }

  // Iniciar servidor do worker
  async function initServer() {
    try {
      // Primeiro inicializa o banco
      await initDatabase();
      
      // Depois conecta
      await database.connect();
      
      const server = app.listen(PORT, '0.0.0.0', () => {
        const workerInfo = cluster.worker ? ` (Worker ${cluster.worker.id})` : '';
        logger.info(`🚀 Servidor iniciado${workerInfo}`);
        logger.info(`📡 Porta: ${PORT}`);
        logger.info(`🌍 URL: http://localhost:${PORT}`);
        logger.info(`⚡ Ambiente: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`� Database: ${database.dbPath}`);
        logger.info(`🔒 Segurança: ATIVADA`);
        logger.info(`� Performance Monitor: ATIVO`);
        logger.info(`�️ Compressão: ATIVA`);
        logger.info(`⚡ Alta Performance: 10K+ usuários/dia`);
      });

      // Graceful shutdown
      const gracefulShutdown = () => {
        logger.info('🔄 Recebido sinal de shutdown, fechando servidor...');
        server.close(() => {
          logger.info('✅ Servidor fechado');
          database.close(() => {
            logger.info('✅ Conexão com banco fechada');
            process.exit(0);
          });
        });

        // Força shutdown após 10 segundos
        setTimeout(() => {
          logger.error('⚠️ Forçando shutdown após timeout');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);
      
      // Tratamento de erros não capturados
      process.on('uncaughtException', (error) => {
        logger.error('ERRO CRÍTICO - Exceção não capturada:', { 
          error: error.message, 
          stack: error.stack 
        });
        gracefulShutdown();
      });

      process.on('unhandledRejection', (reason, promise) => {
        logger.error('ERRO CRÍTICO - Promise rejeitada:', { 
          reason: reason instanceof Error ? reason.message : reason,
          stack: reason instanceof Error ? reason.stack : undefined,
          promise: String(promise)
        });
      });

    } catch (error) {
      logger.error('❌ Erro ao iniciar servidor:', { error: error.message, stack: error.stack });
      process.exit(1);
    }
  }

  // Iniciar
  initServer();
}

module.exports = app;
