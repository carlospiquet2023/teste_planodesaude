#!/bin/bash

echo "=========================================="
echo "🚀 Iniciando VendaPlano Backend"
echo "=========================================="

# Navegar para o diretório do servidor
cd server

echo "📦 Instalando dependências..."
npm install

echo "📁 Criando diretórios necessários..."
mkdir -p database
mkdir -p logs

echo "🗄️  Inicializando banco de dados..."
npm run init-db

echo "✅ Iniciando servidor..."
node server.js
