const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor...\n');

// Primeiro, inicializar o banco de dados
console.log('📦 Inicializando banco de dados...');
const initDb = exec('node scripts/init-db.js', { cwd: __dirname });

initDb.stdout.on('data', (data) => {
  console.log(data);
});

initDb.stderr.on('data', (data) => {
  console.error(data);
});

initDb.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Erro ao inicializar banco de dados');
    process.exit(1);
  }
  
  console.log('\n✅ Banco de dados inicializado com sucesso!\n');
  console.log('🌐 Iniciando servidor Express...\n');
  
  // Depois, iniciar o servidor
  const server = exec('node server.js', { cwd: __dirname });
  
  server.stdout.on('data', (data) => {
    console.log(data);
  });
  
  server.stderr.on('data', (data) => {
    console.error(data);
  });
  
  server.on('close', (code) => {
    console.log(`Servidor encerrado com código ${code}`);
  });
});
