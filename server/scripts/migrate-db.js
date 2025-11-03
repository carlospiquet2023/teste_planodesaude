const database = require('../config/database');

async function migrateDatabase() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    await database.connect();

    // Verificar e adicionar coluna last_login se não existir
    try {
      await database.run('ALTER TABLE admins ADD COLUMN last_login DATETIME');
      console.log('✅ Coluna last_login adicionada');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  Coluna last_login já existe');
      } else {
        console.error('⚠️  Erro ao adicionar last_login:', error.message);
      }
    }

    // Verificar e adicionar coluna updated_at se não existir
    try {
      await database.run('ALTER TABLE admins ADD COLUMN updated_at DATETIME');
      console.log('✅ Coluna updated_at adicionada');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  Coluna updated_at já existe');
      } else {
        console.error('⚠️  Erro ao adicionar updated_at:', error.message);
      }
    }

    // Verificar estrutura da tabela
    const tableInfo = await database.all('PRAGMA table_info(admins)');
    console.log('\n📋 Estrutura atual da tabela admins:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    console.log('\n✅ Migração concluída com sucesso!');
    await database.close();

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

// Executar migração
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase;
