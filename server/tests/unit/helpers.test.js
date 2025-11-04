/**
 * 🧪 TESTES UNITÁRIOS - HELPERS
 * Testa funções utilitárias
 */

const {
  successResponse,
  errorResponse,
  isValidEmail,
  isValidPhone,
  formatPhone,
  sanitizeInput,
  paginate
} = require('../../utils/helpers');

describe('🛠️ Helpers - Testes Unitários', () => {
  
  describe('successResponse', () => {
    it('✅ Deve formatar resposta de sucesso', () => {
      const response = successResponse({ user: 'João' });
      
      expect(response.success).toBe(true);
      expect(response.user).toBe('João');
    });
    
    it('✅ Deve incluir mensagem se fornecida', () => {
      const response = successResponse({ user: 'João' }, 'Operação concluída');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Operação concluída');
    });
  });
  
  describe('errorResponse', () => {
    it('✅ Deve formatar resposta de erro', () => {
      const response = errorResponse('Erro ao processar');
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Erro ao processar');
      expect(response.statusCode).toBe(500);
    });
    
    it('✅ Deve aceitar statusCode customizado', () => {
      const response = errorResponse('Não encontrado', 404);
      
      expect(response.statusCode).toBe(404);
    });
  });
  
  describe('isValidEmail', () => {
    it('✅ Deve validar email correto', () => {
      expect(isValidEmail('teste@example.com')).toBe(true);
      expect(isValidEmail('usuario.nome@dominio.com.br')).toBe(true);
    });
    
    it('❌ Deve rejeitar email inválido', () => {
      expect(isValidEmail('email-invalido')).toBe(false);
      expect(isValidEmail('email@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('email@.com')).toBe(false);
    });
  });
  
  describe('isValidPhone', () => {
    it('✅ Deve validar telefone brasileiro correto', () => {
      expect(isValidPhone('11999999999')).toBe(true);
      expect(isValidPhone('(11) 99999-9999')).toBe(true);
      expect(isValidPhone('+55 11 99999-9999')).toBe(true);
    });
    
    it('❌ Deve rejeitar telefone inválido', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
    });
  });
  
  describe('formatPhone', () => {
    it('✅ Deve formatar telefone com 11 dígitos', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
    });
    
    it('✅ Deve formatar telefone com 10 dígitos', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    });
    
    it('✅ Deve retornar original se formato incorreto', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });
  
  describe('sanitizeInput', () => {
    it('✅ Deve remover caracteres perigosos', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<');
      expect(sanitizeInput('Texto normal')).toBe('Texto normal');
    });
    
    it('✅ Deve fazer trim', () => {
      expect(sanitizeInput('  texto  ')).toBe('texto');
    });
    
    it('✅ Deve limitar tamanho', () => {
      const longText = 'a'.repeat(2000);
      expect(sanitizeInput(longText).length).toBe(1000);
    });
  });
  
  describe('paginate', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
    
    it('✅ Deve paginar corretamente', () => {
      const result = paginate(items, 1, 10);
      
      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.pages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });
    
    it('✅ Deve retornar página 2 corretamente', () => {
      const result = paginate(items, 2, 10);
      
      expect(result.data).toHaveLength(10);
      expect(result.data[0].id).toBe(11);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });
    
    it('✅ Deve retornar última página parcial', () => {
      const result = paginate(items, 3, 10);
      
      expect(result.data).toHaveLength(5);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });
});
