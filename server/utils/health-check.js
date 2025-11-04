/**
 * 🏥 HEALTH CHECK AVANÇADO
 * Verifica saúde completa do sistema
 */

const database = require('../config/database');
const { logger } = require('../middleware/logger');
const fs = require('fs');
const path = require('path');

class HealthCheck {
  /**
   * Verifica se o banco de dados está respondendo
   */
  static async checkDatabase() {
    try {
      await database.get('SELECT 1');
      return {
        status: 'ok',
        message: 'Database conectado',
        responseTime: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database não responde',
        error: error.message
      };
    }
  }

  /**
   * Verifica espaço em disco
   */
  static async checkDiskSpace() {
    try {
      const dbPath = process.env.DB_PATH || './database/vendas.db';
      const stats = fs.statSync(path.resolve(__dirname, '..', dbPath));
      
      return {
        status: 'ok',
        databaseSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Não foi possível verificar espaço'
      };
    }
  }

  /**
   * Verifica uso de memória
   */
  static checkMemory() {
    const used = process.memoryUsage();
    const rss = (used.rss / 1024 / 1024).toFixed(2);
    const heapUsed = (used.heapUsed / 1024 / 1024).toFixed(2);
    
    return {
      status: heapUsed < 500 ? 'ok' : 'warning',
      rss: `${rss} MB`,
      heapUsed: `${heapUsed} MB`,
      heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`
    };
  }

  /**
   * Verifica uptime
   */
  static checkUptime() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return {
      status: 'ok',
      uptime: `${days}d ${hours}h ${minutes}m`,
      uptimeSeconds: uptime
    };
  }

  /**
   * Verifica variáveis de ambiente críticas
   */
  static checkEnvironment() {
    const required = ['NODE_ENV', 'JWT_SECRET', 'PORT'];
    const missing = required.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      return {
        status: 'error',
        message: 'Variáveis de ambiente faltando',
        missing
      };
    }
    
    return {
      status: 'ok',
      environment: process.env.NODE_ENV,
      port: process.env.PORT
    };
  }

  /**
   * Health check completo
   */
  static async runFullCheck() {
    const startTime = Date.now();
    
    const [database, diskSpace, memory, uptime, environment] = await Promise.all([
      this.checkDatabase(),
      this.checkDiskSpace(),
      Promise.resolve(this.checkMemory()),
      Promise.resolve(this.checkUptime()),
      Promise.resolve(this.checkEnvironment())
    ]);

    const responseTime = Date.now() - startTime;
    
    // Determinar status geral
    const checks = { database, diskSpace, memory, uptime, environment };
    const hasError = Object.values(checks).some(c => c.status === 'error');
    const hasWarning = Object.values(checks).some(c => c.status === 'warning');
    
    const overallStatus = hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy';
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      checks
    };
  }

  /**
   * Health check simples (usado pelo load balancer)
   */
  static async runSimpleCheck() {
    try {
      await database.get('SELECT 1');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = HealthCheck;
