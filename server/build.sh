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

# Se o banco já existe, fazer migração. Senão, inicializar
if [ -f "database/vendas.db" ]; then
  echo "🔄 Banco existente detectado. Executando migração..."
  npm run migrate-db
else
  echo "🗄️ Inicializando novo banco de dados..."
  npm run init-db
fi

echo "✅ Build concluído com sucesso!"
