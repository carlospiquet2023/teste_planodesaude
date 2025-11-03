const fetch = require('node-fetch');
require('dotenv').config();

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
let authToken = null;
let testClientId = null;
let testConversationId = null;
let testSessionId = `test_${Date.now()}`;

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}, expectedStatus = 200) {
  try {
    log(`\n📝 Testando: ${name}`, 'blue');
    log(`   URL: ${url}`, 'reset');
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      log(`   ✅ Status: ${response.status} (esperado: ${expectedStatus})`, 'green');
      log(`   ✅ Resposta: ${JSON.stringify(data).substring(0, 100)}...`, 'green');
      return { success: true, data, status: response.status };
    } else {
      log(`   ❌ Status: ${response.status} (esperado: ${expectedStatus})`, 'red');
      log(`   ❌ Resposta: ${JSON.stringify(data)}`, 'red');
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════════════════', 'bright');
  log('🔍 TESTE COMPLETO DE QUALIDADE DA API - QA Report', 'bright');
  log('═══════════════════════════════════════════════════════════', 'bright');
  
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    categories: {}
  };
  
  function recordResult(category, passed) {
    testResults.total++;
    if (passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
    if (!testResults.categories[category]) {
      testResults.categories[category] = { passed: 0, failed: 0 };
    }
    if (passed) {
      testResults.categories[category].passed++;
    } else {
      testResults.categories[category].failed++;
    }
  }
  
  // ============================================
  // 1. TESTES DE CONECTIVIDADE E SAÚDE
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('1️⃣  TESTES DE CONECTIVIDADE', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  let result = await testEndpoint(
    'Health Check',
    `${API_BASE}/health`
  );
  recordResult('Conectividade', result.success);
  
  // ============================================
  // 2. TESTES DE AUTENTICAÇÃO
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('2️⃣  TESTES DE AUTENTICAÇÃO', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  // Login com credenciais incorretas
  result = await testEndpoint(
    'Login - Credenciais Inválidas',
    `${API_BASE}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'invalid',
        password: 'wrong'
      })
    },
    401
  );
  recordResult('Autenticação', result.status === 401);
  
  // Login com credenciais corretas
  result = await testEndpoint(
    'Login - Credenciais Válidas',
    `${API_BASE}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      })
    },
    200
  );
  recordResult('Autenticação', result.success);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log(`   🔑 Token obtido: ${authToken.substring(0, 20)}...`, 'green');
  }
  
  // Verificar token
  if (authToken) {
    result = await testEndpoint(
      'Verificar Token',
      `${API_BASE}/auth/verify`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Autenticação', result.success);
  }
  
  // Acesso sem autenticação
  result = await testEndpoint(
    'Acesso Protegido Sem Token',
    `${API_BASE}/clients`,
    {
      method: 'GET'
    },
    401
  );
  recordResult('Autenticação', result.status === 401);
  
  // ============================================
  // 3. TESTES DE CLIENTES
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('3️⃣  TESTES DE CLIENTES', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  // Criar cliente (endpoint público)
  result = await testEndpoint(
    'Criar Cliente',
    `${API_BASE}/clients`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Silva QA Test',
        email: 'joao.qa@test.com',
        phone: '11999999999',
        city: 'São Paulo',
        state: 'SP',
        interested_plan: 'Familiar',
        source: 'qa_test'
      })
    },
    201
  );
  recordResult('Clientes', result.success);
  
  if (result.success && result.data.client) {
    testClientId = result.data.client.id;
    log(`   👤 Cliente criado com ID: ${testClientId}`, 'green');
  }
  
  // Listar clientes (requer autenticação)
  if (authToken) {
    result = await testEndpoint(
      'Listar Clientes',
      `${API_BASE}/clients`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Clientes', result.success);
  }
  
  // Buscar cliente específico
  if (authToken && testClientId) {
    result = await testEndpoint(
      'Buscar Cliente por ID',
      `${API_BASE}/clients/${testClientId}`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Clientes', result.success);
  }
  
  // ============================================
  // 4. TESTES DE CONVERSAS
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('4️⃣  TESTES DE CONVERSAS', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  // Criar conversa
  result = await testEndpoint(
    'Criar Conversa',
    `${API_BASE}/conversations`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: testClientId,
        session_id: testSessionId
      })
    },
    201
  );
  recordResult('Conversas', result.success);
  
  if (result.success && result.data.conversation) {
    testConversationId = result.data.conversation.id;
    log(`   💬 Conversa criada com ID: ${testConversationId}`, 'green');
  }
  
  // Listar conversas
  if (authToken) {
    result = await testEndpoint(
      'Listar Conversas',
      `${API_BASE}/conversations`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Conversas', result.success);
  }
  
  // Buscar conversa por session_id
  if (testSessionId) {
    result = await testEndpoint(
      'Buscar Conversa por Session ID',
      `${API_BASE}/conversations/${testSessionId}`,
      {
        method: 'GET'
      }
    );
    recordResult('Conversas', result.success);
  }
  
  // ============================================
  // 5. TESTES DE MENSAGENS
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('5️⃣  TESTES DE MENSAGENS', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  // Enviar mensagem do usuário
  if (testConversationId) {
    result = await testEndpoint(
      'Enviar Mensagem do Usuário',
      `${API_BASE}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: testConversationId,
          sender: 'user',
          message: 'Olá, gostaria de informações sobre planos',
          message_type: 'text'
        })
      },
      201
    );
    recordResult('Mensagens', result.success);
    
    // Enviar mensagem do bot
    result = await testEndpoint(
      'Enviar Mensagem do Bot',
      `${API_BASE}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: testConversationId,
          sender: 'bot',
          message: 'Olá! Posso ajudar com nossos planos de saúde',
          message_type: 'text'
        })
      },
      201
    );
    recordResult('Mensagens', result.success);
  }
  
  // ============================================
  // 6. TESTES DE SIMULAÇÕES
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('6️⃣  TESTES DE SIMULAÇÕES', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  // Criar simulação
  if (testClientId && testConversationId) {
    result = await testEndpoint(
      'Criar Simulação',
      `${API_BASE}/simulations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: testClientId,
          conversation_id: testConversationId,
          plan_type: 'Familiar',
          dependents: 2,
          total_value: 599.90
        })
      },
      201
    );
    recordResult('Simulações', result.success);
  }
  
  // Listar simulações
  if (authToken) {
    result = await testEndpoint(
      'Listar Simulações',
      `${API_BASE}/simulations`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Simulações', result.success);
  }
  
  // ============================================
  // 7. TESTES DE DASHBOARD
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('7️⃣  TESTES DE DASHBOARD', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  if (authToken) {
    result = await testEndpoint(
      'Estatísticas do Dashboard',
      `${API_BASE}/dashboard/stats`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Dashboard', result.success);
    
    result = await testEndpoint(
      'Atividade Recente',
      `${API_BASE}/dashboard/recent-activity`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Dashboard', result.success);
  }
  
  // ============================================
  // 8. TESTES DE CONTEÚDO/CMS
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('8️⃣  TESTES DE CONTEÚDO (CMS)', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  if (authToken) {
    result = await testEndpoint(
      'Listar Conteúdo do Site',
      `${API_BASE}/content`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    recordResult('Conteúdo', result.success);
  }
  
  // ============================================
  // 9. TESTES DE SEGURANÇA
  // ============================================
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('9️⃣  TESTES DE SEGURANÇA', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  
  // SQL Injection attempt
  result = await testEndpoint(
    'Teste SQL Injection',
    `${API_BASE}/clients`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "'; DROP TABLE clients; --",
        email: 'hack@test.com'
      })
    },
    400
  );
  recordResult('Segurança', result.status === 400 || result.status === 201);
  
  // XSS attempt
  result = await testEndpoint(
    'Teste XSS',
    `${API_BASE}/clients`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '<script>alert("XSS")</script>',
        email: 'xss@test.com'
      })
    },
    400
  );
  recordResult('Segurança', result.status === 400 || result.status === 201);
  
  // ============================================
  // RELATÓRIO FINAL
  // ============================================
  log('\n\n═══════════════════════════════════════════════════════════', 'bright');
  log('📊 RELATÓRIO FINAL DE QUALIDADE (QA)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'bright');
  
  log(`\n✅ Testes Passados: ${testResults.passed}/${testResults.total}`, 'green');
  log(`❌ Testes Falhados: ${testResults.failed}/${testResults.total}`, testResults.failed > 0 ? 'red' : 'green');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  log(`\n📈 Taxa de Sucesso: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
  log('\n📋 Resultados por Categoria:', 'blue');
  Object.entries(testResults.categories).forEach(([category, results]) => {
    const rate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(0);
    log(`   ${category}: ${results.passed}/${results.passed + results.failed} (${rate}%)`, 
        rate >= 90 ? 'green' : rate >= 70 ? 'yellow' : 'red');
  });
  
  log('\n═══════════════════════════════════════════════════════════', 'bright');
  
  if (successRate >= 90) {
    log('🎉 PROJETO PRONTO PARA PRODUÇÃO!', 'green');
  } else if (successRate >= 70) {
    log('⚠️  PROJETO PRECISA DE AJUSTES', 'yellow');
  } else {
    log('❌ PROJETO NÃO ESTÁ PRONTO PARA PRODUÇÃO', 'red');
  }
  
  log('═══════════════════════════════════════════════════════════\n', 'bright');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Executar testes
runTests().catch(error => {
  log(`\n❌ Erro fatal ao executar testes: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
