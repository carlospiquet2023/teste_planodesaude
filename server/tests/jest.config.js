/**
 * 🧪 CONFIGURAÇÃO JEST - TESTES AUTOMATIZADOS
 * Framework de testes profissional para garantir qualidade
 */

module.exports = {
  // Ambiente de testes
  testEnvironment: 'node',
  
  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Limites mínimos de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Arquivos a serem testados
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Arquivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/database/',
    '/logs/'
  ],
  
  // Setup e teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout padrão (útil para testes de integração)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks automaticamente entre testes
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
