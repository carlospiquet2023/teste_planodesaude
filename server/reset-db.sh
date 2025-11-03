#!/bin/bash

echo "🔥 AVISO: Este script irá DELETAR e RECRIAR o banco de dados!"
echo "Use apenas se quiser recomeçar do zero."
echo ""

# Deletar banco existente se existir
if [ -f "database/vendas.db" ]; then
  echo "🗑️  Deletando banco existente..."
  rm -f database/vendas.db
  echo "✅ Banco deletado"
fi

# Garantir que o diretório existe
mkdir -p database

# Executar inicialização
echo "🆕 Criando novo banco de dados..."
npm run init-db

echo ""
echo "✅ Banco de dados resetado com sucesso!"
echo "🔐 Use as credenciais padrão para fazer login"
