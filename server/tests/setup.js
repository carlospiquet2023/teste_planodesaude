/**
 * 🔧 SETUP DE TESTES
 * Configurações iniciais executadas antes de cada teste
 */

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jwt_testing';
process.env.DB_PATH = './database/test.db';

// Aumentar timeout para operações de banco de dados
jest.setTimeout(10000);

// Mock de console para testes limpos (removível se necessário)
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
