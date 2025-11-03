// Script de diagnóstico do servidor
const database = require('./config/database');

async function diagnose() {
  console.log('🔍 Verificando servidor...\n');
  
  try {
    // Testar conexão com o banco
    console.log('1️⃣ Testando conexão com banco de dados...');
    await database.connect();
    console.log('✅ Banco de dados conectado\n');
    
    // Verificar se tabelas existem
    console.log('2️⃣ Verificando tabelas...');
    const tables = await database.all(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    
    if (tables.length === 0) {
      console.log('⚠️  AVISO: Nenhuma tabela encontrada!');
      console.log('   Execute: npm run init-db\n');
    } else {
      console.log(`✅ ${tables.length} tabelas encontradas:`);
      tables.forEach(t => console.log(`   - ${t.name}`));
      console.log('');
    }
    
    // Verificar admin
    console.log('3️⃣ Verificando usuário admin...');
    const admin = await database.get('SELECT * FROM admins WHERE username = ?', ['admin']);
    
    if (admin) {
      console.log('✅ Usuário admin encontrado');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email || 'Não definido'}`);
      console.log(`   Último login: ${admin.last_login || 'Nunca'}\n`);
    } else {
      console.log('⚠️  AVISO: Usuário admin não encontrado!');
      console.log('   Execute: npm run init-db\n');
    }
    
    // Verificar variáveis de ambiente
    console.log('4️⃣ Verificando variáveis de ambiente...');
    console.log(`   PORT: ${process.env.PORT || '3000 (padrão)'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Definido' : '⚠️  Usando padrão'}`);
    console.log(`   DB_PATH: ${process.env.DB_PATH || './database/vendas.db (padrão)'}\n`);
    
    console.log('✅ Diagnóstico completo!\n');
    console.log('💡 Para iniciar o servidor, execute: npm start');
    
    await database.close();
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
    process.exit(1);
  }
}

diagnose();
