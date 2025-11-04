const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMetrics, resetMetrics, getHealthStatus } = require('../middleware/performance');
const { getCacheStats, resetStats, flushCache } = require('../middleware/cache');
const { logger } = require('../middleware/logger');

// ============================================
// 📊 MÉTRICAS DE PERFORMANCE (Protegido)
// ============================================

router.get('/performance', authMiddleware, (req, res) => {
  try {
    const metrics = getMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    logger.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas'
    });
  }
});

// ============================================
// 🗄️ ESTATÍSTICAS DE CACHE (Protegido)
// ============================================

router.get('/cache', authMiddleware, (req, res) => {
  try {
    const stats = getCacheStats();
    res.json({
      success: true,
      cache: stats
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas de cache:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas de cache'
    });
  }
});

// ============================================
// 🏥 HEALTH CHECK DETALHADO (Protegido)
// ============================================

router.get('/health', authMiddleware, (req, res) => {
  try {
    const health = getHealthStatus();
    const cacheStats = getCacheStats();
    const metrics = getMetrics();

    const status = health.status === 'healthy' ? 200 : 503;

    res.status(status).json({
      success: health.status === 'healthy',
      health,
      cache: cacheStats,
      uptime: metrics.uptime,
      memory: metrics.memory,
      cpu: metrics.cpu,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro no health check:', error);
    res.status(503).json({
      success: false,
      error: 'Erro no health check',
      status: 'unhealthy'
    });
  }
});

// ============================================
// 🔄 RESETAR MÉTRICAS (Protegido)
// ============================================

router.post('/reset-metrics', authMiddleware, (req, res) => {
  try {
    resetMetrics();
    resetStats();
    
    logger.info('Métricas resetadas via API', {
      admin: req.adminId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Métricas resetadas com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao resetar métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao resetar métricas'
    });
  }
});

// ============================================
// 🗑️ LIMPAR CACHE (Protegido)
// ============================================

router.post('/clear-cache', authMiddleware, (req, res) => {
  try {
    flushCache();
    
    logger.info('Cache limpo via API', {
      admin: req.adminId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache'
    });
  }
});

// ============================================
// 📈 DASHBOARD DE SISTEMA (Protegido)
// ============================================

router.get('/system', authMiddleware, (req, res) => {
  try {
    const metrics = getMetrics();
    const health = getHealthStatus();
    const cacheStats = getCacheStats();

    // Informações do sistema
    const systemInfo = {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      totalMemory: require('os').totalmem(),
      freeMemory: require('os').freemem(),
      uptime: process.uptime(),
      pid: process.pid
    };

    res.json({
      success: true,
      system: systemInfo,
      health,
      metrics,
      cache: cacheStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao buscar informações do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar informações do sistema'
    });
  }
});

module.exports = router;
