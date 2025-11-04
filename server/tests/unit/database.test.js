/**
 * 🧪 TESTES UNITÁRIOS - DATABASE
 * Testa conexão e operações de banco de dados
 */

const Database = require('../../config/database');
const fs = require('fs');
const path = require('path');

describe('🗄️ Database - Testes Unitários', () => {
  const testDbPath = path.resolve(__dirname, '../../database/test.db');
  
  beforeEach(async () => {
    // Limpar banco de testes
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  
  afterAll(async () => {
    // Cleanup
    if (Database.db) {
      await Database.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  
  describe('Conexão', () => {
    it('✅ Deve conectar ao banco de dados', async () => {
      await expect(Database.connect()).resolves.toBeDefined();
      expect(Database.db).toBeDefined();
    });
    
    it('✅ Deve criar diretório se não existir', async () => {
      const dbDir = path.dirname(testDbPath);
      expect(fs.existsSync(dbDir)).toBe(true);
    });
  });
  
  describe('Operações CRUD', () => {
    beforeEach(async () => {
      await Database.connect();
      
      // Criar tabela de teste
      await Database.run(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER
        )
      `);
    });
    
    it('✅ Deve inserir dados', async () => {
      const result = await Database.run(
        'INSERT INTO test_table (name, value) VALUES (?, ?)',
        ['test', 123]
      );
      
      expect(result.lastID).toBeGreaterThan(0);
    });
    
    it('✅ Deve buscar um registro', async () => {
      await Database.run(
        'INSERT INTO test_table (name, value) VALUES (?, ?)',
        ['test', 123]
      );
      
      const row = await Database.get(
        'SELECT * FROM test_table WHERE name = ?',
        ['test']
      );
      
      expect(row).toBeDefined();
      expect(row.name).toBe('test');
      expect(row.value).toBe(123);
    });
    
    it('✅ Deve buscar múltiplos registros', async () => {
      await Database.run('INSERT INTO test_table (name, value) VALUES (?, ?)', ['test1', 1]);
      await Database.run('INSERT INTO test_table (name, value) VALUES (?, ?)', ['test2', 2]);
      await Database.run('INSERT INTO test_table (name, value) VALUES (?, ?)', ['test3', 3]);
      
      const rows = await Database.all('SELECT * FROM test_table');
      
      expect(rows).toHaveLength(3);
    });
    
    it('✅ Deve atualizar registros', async () => {
      await Database.run('INSERT INTO test_table (name, value) VALUES (?, ?)', ['test', 123]);
      
      const result = await Database.run(
        'UPDATE test_table SET value = ? WHERE name = ?',
        [456, 'test']
      );
      
      expect(result.changes).toBe(1);
      
      const row = await Database.get('SELECT * FROM test_table WHERE name = ?', ['test']);
      expect(row.value).toBe(456);
    });
  });
});
