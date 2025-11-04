const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar logger apenas quando necessário
const getLogger = () => {
  try {
    return require('../middleware/logger').logger;
  } catch {
    return {
      info: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console)
    };
  }
};

const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './database/vendas.db');
const dbDir = path.dirname(dbPath);

class Database {
  constructor() {
    this.db = null;
    this.queryCount = 0;
    this.errorCount = 0;
    this.slowQueries = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      const logger = getLogger();
      
      // Garante que o diretório existe antes de criar o banco
      if (!fs.existsSync(dbDir)) {
        logger.info(`Criando diretório do banco de dados: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Erro ao conectar ao banco de dados:', { error: err.message });
          reject(err);
        } else {
          logger.info('✅ Conectado ao banco de dados SQLite');
          logger.info(`📁 Caminho do banco: ${dbPath}`);
          
          // Otimizações de performance para alta carga
          this.db.run('PRAGMA foreign_keys = ON');
          this.db.run('PRAGMA journal_mode = WAL'); // Write-Ahead Logging
          this.db.run('PRAGMA synchronous = NORMAL'); // Melhor performance
          this.db.run('PRAGMA cache_size = -64000'); // 64MB de cache
          this.db.run('PRAGMA temp_store = MEMORY'); // Armazenar temp em memória
          this.db.run('PRAGMA mmap_size = 268435456'); // 256MB mmap
          this.db.run('PRAGMA page_size = 4096'); // Tamanho de página otimizado
          this.db.run('PRAGMA busy_timeout = 10000'); // 10s de timeout
          
          logger.info('⚡ Otimizações de performance aplicadas (WAL, cache, mmap)');
          resolve(this.db);
        }
      });
    });
  }

  run(sql, params = []) {
    const startTime = Date.now();
    this.queryCount++;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        const duration = Date.now() - startTime;
        
        // Monitorar queries lentas
        if (duration > 1000) {
          const logger = getLogger();
          logger.warn('⚠️ Query lenta detectada:', {
            sql: sql.substring(0, 100),
            duration: `${duration}ms`,
            params: params.length
          });
          
          // Guardar últimas 10 queries lentas
          this.slowQueries.push({ sql, duration, timestamp: new Date() });
          if (this.slowQueries.length > 10) {
            this.slowQueries.shift();
          }
        }
        
        if (err) {
          this.errorCount++;
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    const startTime = Date.now();
    this.queryCount++;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        const duration = Date.now() - startTime;
        
        if (duration > 1000) {
          const logger = getLogger();
          logger.warn('⚠️ Query lenta detectada:', {
            sql: sql.substring(0, 100),
            duration: `${duration}ms`
          });
        }
        
        if (err) {
          this.errorCount++;
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    const startTime = Date.now();
    this.queryCount++;
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        const duration = Date.now() - startTime;
        
        if (duration > 1000) {
          const logger = getLogger();
          logger.warn('⚠️ Query lenta detectada:', {
            sql: sql.substring(0, 100),
            duration: `${duration}ms`,
            rowCount: rows ? rows.length : 0
          });
        }
        
        if (err) {
          this.errorCount++;
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Executar queries em batch para melhor performance
  async runBatch(queries) {
    const results = [];
    for (const { sql, params } of queries) {
      try {
        const result = await this.run(sql, params);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  // Obter estatísticas do banco
  getStats() {
    return {
      queryCount: this.queryCount,
      errorCount: this.errorCount,
      errorRate: this.queryCount > 0 ? ((this.errorCount / this.queryCount) * 100).toFixed(2) + '%' : '0%',
      slowQueries: this.slowQueries.length,
      dbPath,
      dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0
    };
  }

  close() {
    return new Promise((resolve, reject) => {
      const logger = getLogger();
      if (!this.db) {
        resolve();
        return;
      }
      
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          logger.info('Conexão com banco de dados fechada');
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
