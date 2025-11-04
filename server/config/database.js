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
          this.db.run('PRAGMA foreign_keys = ON');
          resolve(this.db);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      const logger = getLogger();
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
