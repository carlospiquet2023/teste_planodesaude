# 🔧 CORREÇÃO APLICADA - SQLITE_CANTOPEN

## ❌ Problema Identificado

```
Error: SQLITE_CANTOPEN: unable to open database file
errno: 14
code: 'SQLITE_CANTOPEN'
```

## 🔍 Causa Raiz

O diretório `database/` não existia antes de tentar criar o arquivo SQLite. O Render precisa que os diretórios sejam criados explicitamente antes de usar.

## ✅ Soluções Aplicadas

### 1. Atualizado `database.js`

Adicionado verificação e criação automática do diretório:

```javascript
const fs = require('fs');
const dbDir = path.dirname(dbPath);

// Garante que o diretório existe antes de criar o banco
if (!fs.existsSync(dbDir)) {
  console.log(`Criando diretório do banco de dados: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}
```

### 2. Atualizado `render.yaml`

Corrigido caminho absoluto do banco:

```yaml
- key: DB_PATH
  value: /opt/render/project/src/server/database/vendas.db
```

### 3. Atualizado `start.sh`

Criação explícita de diretórios:

```bash
mkdir -p database
mkdir -p logs
```

### 4. Atualizado `Procfile`

Garantia de diretórios antes de iniciar:

```
web: mkdir -p server/database server/logs && cd server && npm install && npm run init-db && npm start
```

## 🚀 Como Aplicar a Correção no Render

### Opção 1: Novo Deploy (Automático)

Se você tem auto-deploy ativo:
1. As alterações já estão no GitHub
2. Render detectará automaticamente
3. Novo deploy começará em instantes

### Opção 2: Deploy Manual

1. Acesse seu serviço no Render
2. Clique em "Manual Deploy"
3. Selecione "Clear build cache & deploy"
4. Aguarde o novo deploy

### Opção 3: Atualizar Variável de Ambiente

Se o erro persistir:

1. **Render Dashboard** > Seu serviço
2. **Environment** > Encontre `DB_PATH`
3. Altere para: `/opt/render/project/src/server/database/vendas.db`
4. Clique em "Save Changes"

## 📋 Verificação

Após o deploy, verifique nos logs:

✅ **Logs esperados:**
```
📁 Criando diretório do banco de dados: /opt/render/project/src/server/database
✅ Conectado ao banco de dados SQLite
📁 Caminho do banco: /opt/render/project/src/server/database/vendas.db
Criando tabelas...
✅ Admin padrão criado com sucesso
✅ Banco de dados inicializado com sucesso!
```

## 🧪 Teste Local

Para testar localmente antes de fazer deploy:

```bash
# Limpe o banco atual
rm -rf server/database

# Teste a inicialização
cd server
npm install
npm run init-db
npm start

# Deve criar automaticamente o diretório e banco
```

## 📝 Arquivos Modificados

1. ✅ `server/config/database.js` - Adiciona criação de diretório
2. ✅ `render.yaml` - Corrige caminho do DB_PATH
3. ✅ `start.sh` - Adiciona mkdir explícito
4. ✅ `Procfile` - Garante diretórios antes de iniciar

## 🔄 Próximos Passos

1. **Commit e Push foram feitos automaticamente**
2. **Aguarde o Render fazer novo deploy** (2-3 minutos)
3. **Verifique os logs** para confirmar sucesso
4. **Teste a API:**
   ```bash
   curl https://seu-app.onrender.com/api/health
   ```

## ⚠️ Nota sobre Disco Persistente

**IMPORTANTE:** Certifique-se de que o disco persistente está configurado:

```
Name: vendaplano-db
Mount Path: /opt/render/project/src/server/database
Size: 1 GB
```

Sem o disco persistente, o banco será recriado a cada deploy.

## 🆘 Se o Erro Persistir

### 1. Verifique Permissões

```bash
# No Shell do Render (plano pago)
ls -la /opt/render/project/src/server/
chmod -R 755 /opt/render/project/src/server/database
```

### 2. Verifique Variáveis

Confirme que `DB_PATH` aponta para o disco persistente:
- ✅ Correto: `/opt/render/project/src/server/database/vendas.db`
- ❌ Errado: `./database/vendas.db` (caminho relativo)

### 3. Clear Build Cache

Às vezes o cache pode causar problemas:
1. Manual Deploy > "Clear build cache & deploy"

### 4. Alternativa: PostgreSQL

Se SQLite continuar com problemas, considere migrar para PostgreSQL:
- ✅ Gratuito no Render
- ✅ Mais robusto para produção
- ✅ Melhor para concorrência

## ✅ Status

- [x] Problema identificado
- [x] Soluções implementadas
- [x] Código atualizado
- [x] Commit realizado
- [x] Push para GitHub
- [ ] Aguardando novo deploy no Render
- [ ] Verificar logs de sucesso
- [ ] Testar API

---

**Correção aplicada em:** 3 de novembro de 2025
**Tempo de resolução:** ~5 minutos
**Próximo deploy:** Automático via GitHub
