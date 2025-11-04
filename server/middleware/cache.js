// ============================================
// 🚀 SISTEMA DE CACHE DE ALTA PERFORMANCE
// ============================================

const NodeCache = require('node-cache');
const { logger } = require('./logger');

// Cache em memória (alternativa ao Redis para simplicidade)
// Para 10k+ usuários, considere Redis em produção
const cache = new NodeCache({
  stdTTL: 600, // 10 minutos padrão
  checkperiod: 120, // Verificação a cada 2 minutos
  useClones: false, // Performance
  deleteOnExpire: true
});

// Estatísticas de cache
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

// ============================================
// MIDDLEWARE DE CACHE
// ============================================

function cacheMiddleware(duration = 600) {
  return (req, res, next) => {
    // Apenas em GET
    if (req.method !== 'GET') {
      return next();
    }

    // Ignora rotas de admin e autenticação
    if (req.path.includes('/admin') || req.path.includes('/auth')) {
      return next();
    }

    const key = `cache:${req.path}:${JSON.stringify(req.query)}`;

    try {
      const cachedResponse = cache.get(key);

      if (cachedResponse) {
        cacheStats.hits++;
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', key);
        return res.json(cachedResponse);
      }

      cacheStats.misses++;
      res.set('X-Cache', 'MISS');

      // Override res.json para cachear a resposta
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200) {
          cache.set(key, body, duration);
          cacheStats.sets++;
          res.set('X-Cache-Stored', 'true');
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache:', error);
      next();
    }
  };
}

// ============================================
// FUNÇÕES DE GERENCIAMENTO DE CACHE
// ============================================

function getCache(key) {
  try {
    const value = cache.get(key);
    if (value) {
      cacheStats.hits++;
      return value;
    }
    cacheStats.misses++;
    return null;
  } catch (error) {
    logger.error('Erro ao buscar cache:', error);
    return null;
  }
}

function setCache(key, value, ttl = 600) {
  try {
    cache.set(key, value, ttl);
    cacheStats.sets++;
    return true;
  } catch (error) {
    logger.error('Erro ao definir cache:', error);
    return false;
  }
}

function deleteCache(key) {
  try {
    cache.del(key);
    cacheStats.deletes++;
    return true;
  } catch (error) {
    logger.error('Erro ao deletar cache:', error);
    return false;
  }
}

function deleteCachePattern(pattern) {
  try {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchingKeys);
    cacheStats.deletes += matchingKeys.length;
    return matchingKeys.length;
  } catch (error) {
    logger.error('Erro ao deletar cache por padrão:', error);
    return 0;
  }
}

function flushCache() {
  try {
    cache.flushAll();
    logger.info('Cache limpo completamente');
    return true;
  } catch (error) {
    logger.error('Erro ao limpar cache:', error);
    return false;
  }
}

function getCacheStats() {
  const hitRate = cacheStats.hits + cacheStats.misses > 0
    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2)
    : 0;

  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    keys: cache.keys().length,
    size: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
}

// Limpar estatísticas
function resetStats() {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };
}

// ============================================
// CACHE DE CONSULTAS DE BANCO
// ============================================

async function cacheQuery(key, queryFn, ttl = 600) {
  try {
    // Verifica cache primeiro
    const cached = getCache(key);
    if (cached !== null) {
      return cached;
    }

    // Executa query
    const result = await queryFn();

    // Cacheia resultado
    setCache(key, result, ttl);

    return result;
  } catch (error) {
    logger.error('Erro no cacheQuery:', error);
    throw error;
  }
}

// ============================================
// LIMPAR CACHE AUTOMATICAMENTE
// ============================================

// Limpar cache de estatísticas a cada hora
setInterval(() => {
  deleteCachePattern('stats:');
  deleteCachePattern('dashboard:');
  logger.info('Cache de estatísticas limpo automaticamente');
}, 3600000); // 1 hora

module.exports = {
  cache,
  cacheMiddleware,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  flushCache,
  getCacheStats,
  resetStats,
  cacheQuery
};
