# 🚀 Deploy no Render - Correções Aplicadas

## 🔧 Correções para Produção

### Problema Identificado
O login no Render estava falhando devido a:
1. **Banco de dados antigo** sem as colunas `last_login` e `updated_at`
2. **Validação de senha muito restritiva** no middleware
3. **CORS não configurado** para permitir mesma origem

### ✅ Soluções Implementadas

#### 1. Script de Migração Automática
Criado `scripts/migrate-db.js` que:
- Detecta banco existente
- Adiciona colunas faltantes automaticamente
- Não quebra se colunas já existirem

#### 2. Script de Build Inteligente
Criado `build.sh` que:
- Detecta se banco é novo ou existente
- Executa migração ou inicialização conforme necessário
- Garante estrutura correta do banco

#### 3. Validação de Login Relaxada
- Senha mínima: 3 caracteres (no login)
- Sem exigência de maiúsculas/minúsculas (no login)
- Segurança mantida em changePassword

#### 4. CORS Ajustado
- Permite requisições da mesma origem
- Aceita domínio `onrender.com`
- Mantém segurança para outras origens

## 📝 Arquivos Modificados

1. **`server/server.js`** - CORS ajustado para Render
2. **`server/middleware/validation.js`** - Validação de login relaxada
3. **`server/scripts/migrate-db.js`** - Nova migração automática
4. **`server/build.sh`** - Script de build inteligente
5. **`server/package.json`** - Novo script `migrate-db`
6. **`render.yaml`** - Build command atualizado

## 🎯 Como Forçar Redeploy no Render

### Opção 1: Via Dashboard (Recomendado)
1. Acesse: https://dashboard.render.com
2. Selecione o serviço `vendaplano-backend`
3. Clique em **Manual Deploy** > **Clear build cache & deploy**

### Opção 2: Via Git Push
```bash
git add .
git commit -m "fix: Correções para deploy no Render"
git push origin main
```

### Opção 3: Resetar Banco de Dados
Se quiser recomeçar do zero:
1. No Render Dashboard, vá em **Disks**
2. Delete o disco `vendaplano-db`
3. Faça um novo deploy

## 🔍 Verificar Deploy

Após o deploy, teste:

### 1. Health Check
```bash
curl https://teste-planodesaude.onrender.com/api/health
```

### 2. Login Admin
1. Acesse: https://teste-planodesaude.onrender.com/admin
2. Use: `admin` / `admin123`
3. Deve funcionar sem erros!

### 3. Verificar Logs
No Render Dashboard:
- **Logs** > Procure por "✅ Migração concluída" ou "✅ Tabelas criadas"

## 🐛 Troubleshooting

### Se ainda der erro 500
```bash
# Verificar estrutura do banco no Render
# Adicione temporariamente em server.js:
app.get('/debug/db-structure', async (req, res) => {
  const info = await database.all('PRAGMA table_info(admins)');
  res.json(info);
});
```

### Se der erro de CORS
Verifique no console do navegador qual é a origem sendo bloqueada e adicione em `CORS_ORIGIN` nas variáveis de ambiente do Render.

### Se der erro 400 (validação)
Significa que a validação ainda está restrita. Verifique se o código foi atualizado:
```bash
# No Render Shell
cat server/middleware/validation.js | grep -A 5 "login:"
```

## 📊 Checklist Pré-Deploy

- [x] Código commitado e pushado para `main`
- [x] Build.sh tem permissão de execução
- [x] Script de migração testado localmente
- [x] CORS configurado para Render
- [x] Validação relaxada no login
- [x] Package.json com script migrate-db

## 🎉 Status Esperado

Após deploy bem-sucedido, você deve ver:

```
🚀 Iniciando build para Render...
📦 Instalando dependências...
🔄 Banco existente detectado. Executando migração...
✅ Coluna last_login já existe (ou adicionada)
✅ Coluna updated_at já existe (ou adicionada)
📋 Estrutura atual da tabela admins:
  - id (INTEGER)
  - username (TEXT)
  - password (TEXT)
  - email (TEXT)
  - last_login (DATETIME)
  - created_at (DATETIME)
  - updated_at (DATETIME)
✅ Migração concluída com sucesso!
✅ Build concluído com sucesso!
```

## 🔐 Credenciais

**Produção (Render):**
- URL: https://teste-planodesaude.onrender.com/admin
- Usuário: `admin`
- Senha: `admin123` (ou a definida em `ADMIN_PASSWORD`)

---

**Última atualização:** 03/11/2025
**Status:** ✅ Pronto para deploy
