// ============================================
// 📊 MONITORAMENTO DE PERFORMANCE
// ============================================

const { logger } = require('./logger');

// Métricas em memória
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    byPath: {}
  },
  responseTimes: [],
  activeConnections: 0,
  peakConnections: 0,
  startTime: Date.now()
};

// ============================================
// MIDDLEWARE DE PERFORMANCE
// ============================================

function performanceMonitor(req, res, next) {
  const startTime = Date.now();
  metrics.activeConnections++;
  metrics.requests.total++;

  // Atualizar pico de conexões
  if (metrics.activeConnections > metrics.peakConnections) {
    metrics.peakConnections = metrics.activeConnections;
  }

  // Contar por path
  const path = req.path || 'unknown';
  if (!metrics.requests.byPath[path]) {
    metrics.requests.byPath[path] = { count: 0, avgTime: 0, times: [] };
  }
  metrics.requests.byPath[path].count++;

  // Interceptar o fim da resposta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.activeConnections--;

    // Registrar tempo de resposta
    metrics.responseTimes.push(duration);
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift(); // Mantém apenas os últimos 1000
    }

    // Tempo por path
    metrics.requests.byPath[path].times.push(duration);
    if (metrics.requests.byPath[path].times.length > 100) {
      metrics.requests.byPath[path].times.shift();
    }

    // Calcular média
    const times = metrics.requests.byPath[path].times;
    metrics.requests.byPath[path].avgTime = 
      times.reduce((a, b) => a + b, 0) / times.length;

    // Contar sucesso/erro
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.errors++;
    }

    // Log de requisições lentas (> 3 segundos)
    if (duration > 3000) {
      logger.warn('⚠️ Requisição lenta detectada', {
        path,
        method: req.method,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    }

    // Log de requisições muito lentas (> 10 segundos)
    if (duration > 10000) {
      logger.error('🐌 Requisição MUITO lenta detectada', {
        path,
        method: req.method,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        query: req.query,
        body: req.body
      });
    }
  });

  next();
}

// ============================================
// FUNÇÕES DE MÉTRICAS
// ============================================

function getMetrics() {
  const uptime = Date.now() - metrics.startTime;
  const avgResponseTime = metrics.responseTimes.length > 0
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
    : 0;

  const successRate = metrics.requests.total > 0
    ? ((metrics.requests.success / metrics.requests.total) * 100).toFixed(2)
    : 0;

  // Top 10 rotas mais acessadas
  const topPaths = Object.entries(metrics.requests.byPath)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([path, data]) => ({
      path,
      count: data.count,
      avgTime: Math.round(data.avgTime)
    }));

  // Top 10 rotas mais lentas
  const slowestPaths = Object.entries(metrics.requests.byPath)
    .sort((a, b) => b[1].avgTime - a[1].avgTime)
    .slice(0, 10)
    .map(([path, data]) => ({
      path,
      avgTime: Math.round(data.avgTime),
      count: data.count
    }));

  return {
    uptime: Math.floor(uptime / 1000), // segundos
    requests: {
      total: metrics.requests.total,
      success: metrics.requests.success,
      errors: metrics.requests.errors,
      successRate: `${successRate}%`
    },
    connections: {
      active: metrics.activeConnections,
      peak: metrics.peakConnections
    },
    performance: {
      avgResponseTime: Math.round(avgResponseTime),
      minResponseTime: Math.min(...metrics.responseTimes) || 0,
      maxResponseTime: Math.max(...metrics.responseTimes) || 0,
      p95ResponseTime: calculatePercentile(metrics.responseTimes, 95),
      p99ResponseTime: calculatePercentile(metrics.responseTimes, 99)
    },
    topPaths,
    slowestPaths,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };
}

function calculatePercentile(arr, percentile) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Math.round(sorted[index]);
}

function resetMetrics() {
  metrics.requests = {
    total: 0,
    success: 0,
    errors: 0,
    byPath: {}
  };
  metrics.responseTimes = [];
  metrics.peakConnections = metrics.activeConnections;
  metrics.startTime = Date.now();
}

// ============================================
// HEALTH CHECK
// ============================================

function getHealthStatus() {
  const avgResponseTime = metrics.responseTimes.length > 0
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
    : 0;

  const errorRate = metrics.requests.total > 0
    ? (metrics.requests.errors / metrics.requests.total) * 100
    : 0;

  // Determinar status
  let status = 'healthy';
  let issues = [];

  if (avgResponseTime > 5000) {
    status = 'degraded';
    issues.push('Tempo de resposta alto');
  }

  if (errorRate > 5) {
    status = 'degraded';
    issues.push('Taxa de erro elevada');
  }

  if (metrics.activeConnections > 1000) {
    status = 'degraded';
    issues.push('Muitas conexões ativas');
  }

  if (errorRate > 20 || avgResponseTime > 10000) {
    status = 'unhealthy';
  }

  return {
    status,
    issues,
    avgResponseTime: Math.round(avgResponseTime),
    errorRate: `${errorRate.toFixed(2)}%`,
    activeConnections: metrics.activeConnections
  };
}

// ============================================
// ALERTAS AUTOMÁTICOS
// ============================================

// Verificar métricas a cada minuto
setInterval(() => {
  const health = getHealthStatus();
  
  if (health.status === 'unhealthy') {
    logger.error('🚨 ALERTA: Sistema em estado UNHEALTHY', health);
  } else if (health.status === 'degraded') {
    logger.warn('⚠️ AVISO: Performance degradada', health);
  }
}, 60000); // 1 minuto

module.exports = {
  performanceMonitor,
  getMetrics,
  resetMetrics,
  getHealthStatus
};
