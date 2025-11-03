# ⚡ AÇÃO RÁPIDA - Se o Deploy Falhar Novamente

## 🎯 Configuração Manual no Render

Se após o novo deploy o erro persistir, siga estes passos:

### 1️⃣ Verifique a Variável DB_PATH

**Render Dashboard** > Seu Serviço > **Environment**

Procure por `DB_PATH` e certifique-se que está:

```
DB_PATH=/opt/render/project/src/server/database/vendas.db
```

**NÃO use:**
- ❌ `./database/vendas.db` (caminho relativo)
- ❌ `/database/vendas.db` (caminho absoluto errado)

### 2️⃣ Verifique o Disco Persistente

**Render Dashboard** > Seu Serviço > **Disks**

Deve ter um disco configurado:

```
Name: vendaplano-db
Mount Path: /opt/render/project/src/server/database
Size: 1 GB
Status: Mounted
```

**Se não tiver disco:**
1. Clique em "Add Disk"
2. Preencha os campos acima
3. Save
4. Aguarde remount (~1 minuto)

### 3️⃣ Ajuste o Build Command (se necessário)

**Render Dashboard** > Seu Serviço > **Settings** > **Build & Deploy**

**Build Command:**
```bash
cd server && mkdir -p database logs && npm install && npm run init-db
```

**Start Command:**
```bash
cd server && npm start
```

### 4️⃣ Force um Deploy Limpo

1. **Manual Deploy** > **Clear build cache & deploy**
2. Aguarde 3-5 minutos
3. Acompanhe os logs em tempo real

### 5️⃣ Logs de Debug

Procure por estas mensagens nos logs:

✅ **Sucesso:**
```
📁 Criando diretório do banco de dados: /opt/render/project/src/server/database
✅ Conectado ao banco de dados SQLite
📁 Caminho do banco: /opt/render/project/src/server/database/vendas.db
Criando tabelas...
✅ Banco de dados inicializado com sucesso!
```

❌ **Falha:**
```
Error: SQLITE_CANTOPEN: unable to open database file
```

## 🔄 Alternativa: PostgreSQL

Se SQLite continuar problemático, migre para PostgreSQL (gratuito no Render):

### Vantagens:
- ✅ Gratuito no Render
- ✅ Mais robusto
- ✅ Melhor para produção
- ✅ Sem problemas de permissão
- ✅ Melhor para concorrência

### Como migrar:

1. **Criar PostgreSQL Database:**
   - New + > PostgreSQL
   - Nome: vendaplano-db
   - Free tier

2. **Atualizar código:**
   ```bash
   npm install pg
   # Trocar sqlite3 por pg no código
   ```

3. **Variável de ambiente:**
   - Render fornece `DATABASE_URL` automaticamente

## 📞 Precisa de Ajuda?

**Opção 1: Verifique os logs**
- Dashboard > Logs
- Filtro: "error"

**Opção 2: Documentação Render**
- https://render.com/docs/troubleshooting-deploys
- https://render.com/docs/disks

**Opção 3: Shell Access (plano pago)**
```bash
# Conecte via shell e verifique:
ls -la /opt/render/project/src/server/
mkdir -p /opt/render/project/src/server/database
chmod 755 /opt/render/project/src/server/database
```

## ⚡ Quick Fixes

### Fix 1: Permissões
```bash
# Via Shell do Render
chmod -R 755 /opt/render/project/src/server/database
```

### Fix 2: Caminho do Node
```bash
# Adicione em Environment:
NODE_OPTIONS=--max-old-space-size=512
```

### Fix 3: Force Node 18
```bash
# Adicione em Environment:
NODE_VERSION=18.17.0
```

## ✅ Checklist de Verificação

- [ ] DB_PATH com caminho absoluto correto
- [ ] Disco persistente montado em `/opt/render/project/src/server/database`
- [ ] Build command cria diretórios com `mkdir -p`
- [ ] Logs mostram "Criando diretório do banco de dados"
- [ ] Não há erros de permissão nos logs
- [ ] Service está usando Node 18+
- [ ] Auto-deploy está ativo

## 🎯 Teste Rápido

Após deploy bem-sucedido:

```bash
# Health check
curl https://seu-app.onrender.com/api/health

# Deve retornar:
{"status":"ok"}
```

Se funcionar, o banco está OK! ✅

---

**Tempo médio de resolução:** 5-10 minutos
**Dificuldade:** ⭐⭐ Médio
**Suporte Render:** support@render.com
