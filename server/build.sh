#!/bin/bash

echo "🚀 Iniciando build para Render..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se o diretório do banco existe
if [ ! -d "database" ]; then
  echo "📁 Criando diretório do banco..."
  mkdir -p database
fi

# SEMPRE executar init-db para garantir que todas as tabelas existam
echo "🗄️ Garantindo que todas as tabelas existam..."
npm run init-db

# Se o banco já existia, executar migração adicional
if [ -f "database/vendas.db" ]; then
  echo "🔄 Executando migração adicional..."
  npm run migrate-db || echo "⚠️  Migração pulada (já atualizado)"
fi

echo "✅ Build concluído com sucesso!"
