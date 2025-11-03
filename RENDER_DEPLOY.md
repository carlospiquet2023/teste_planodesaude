# 🚀 GUIA DE DEPLOY NO RENDER

## Deploy Rápido no Render

### 1️⃣ Preparação

Certifique-se de que você tem:
- ✅ Conta no GitHub
- ✅ Conta no Render ([render.com](https://render.com))
- ✅ Código do projeto no GitHub

### 2️⃣ Deploy no Render

#### Método 1: Deploy Automático via GitHub (Recomendado)

1. **Acesse o Render**
   - Vá para: https://render.com
   - Clique em "Get Started" ou "Sign In"
   - Faça login com GitHub

2. **Novo Web Service**
   - No dashboard, clique em "New +"
   - Selecione "Web Service"
   - Conecte seu repositório GitHub
   - Escolha: `carlospiquet2023/teste_planodesaude`

3. **Configuração do Serviço**

   **Configurações Básicas:**
   ```
   Name: vendaplano-backend
   Region: Oregon (US West) ou escolha mais próximo
   Branch: main
   Root Directory: (deixe vazio)
   Runtime: Node
   Build Command: cd server && npm install && npm run init-db
   Start Command: cd server && npm start
   ```

4. **Plano**
   - Selecione "Free" para começar
   - Free tier: 750 horas/mês gratuitas
   - Upgrade depois se necessário

5. **Variáveis de Ambiente**
   
   Clique em "Advanced" > "Add Environment Variable" e adicione:

   ```bash
   NODE_ENV=production
   PORT=10000
   
   # Gere uma chave forte com:
   # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_SECRET=sua_chave_secreta_muito_forte_aqui_64_caracteres_minimo
   JWT_EXPIRE=24h
   
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@2024!Strong
   ADMIN_EMAIL=admin@seudominio.com
   
   # Será preenchido após deploy
   CORS_ORIGIN=https://vendaplano-backend.onrender.com
   
   DB_PATH=./database/vendas.db
   ```

   ⚠️ **IMPORTANTE**: 
   - O Render usa porta 10000 por padrão
   - Gere JWT_SECRET forte usando o comando acima

6. **Disco Persistente (Importante!)**
   
   Para manter o banco de dados SQLite:
   - Role até "Disks"
   - Clique em "Add Disk"
   - Configure:
     ```
     Name: vendaplano-db
     Mount Path: /opt/render/project/src/server/database
     Size: 1 GB (suficiente para começar)
     ```

7. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde 3-5 minutos para o deploy
   - Acompanhe os logs em tempo real

8. **Obtenha a URL**
   - Após deploy: `https://vendaplano-backend.onrender.com`
   - Copie e atualize `CORS_ORIGIN` com essa URL

#### Método 2: Deploy via render.yaml (Infraestrutura como Código)

O projeto já inclui `render.yaml` configurado:

1. **No Render Dashboard:**
   - Clique em "New +" > "Blueprint"
   - Conecte o repositório
   - O Render detectará o `render.yaml`
   - Configure as variáveis de ambiente
   - Clique em "Apply"

### 3️⃣ Configurações Pós-Deploy

1. **Atualize CORS_ORIGIN**
   - Vá em "Environment"
   - Edite `CORS_ORIGIN`
   - Coloque a URL fornecida pelo Render
   - Exemplo: `https://vendaplano-backend.onrender.com`

2. **Teste a API**
   ```bash
   # Health check
   curl https://vendaplano-backend.onrender.com/api/health
   
   # Deve retornar: {"status":"ok"}
   ```

3. **Primeiro Login Admin**
   ```bash
   curl -X POST https://vendaplano-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin@2024!Strong"}'
   ```

### 4️⃣ Domínio Personalizado (Opcional)

1. **Adicione Custom Domain**
   - Em Settings > "Custom Domains"
   - Clique em "Add Custom Domain"
   - Digite seu domínio: `api.seudominio.com`

2. **Configure DNS**
   - Adicione um registro CNAME no seu provedor DNS
   - Aponte para: `vendaplano-backend.onrender.com`

3. **SSL Automático**
   - Render provisiona SSL Let's Encrypt automaticamente
   - Aguarde 5-10 minutos

4. **Atualize CORS**
   - Mude `CORS_ORIGIN` para seu domínio customizado

### 5️⃣ Banco de Dados SQLite

**Persistência:**
- ✅ Disco persistente configurado em `/opt/render/project/src/server/database`
- ✅ Dados mantidos entre deploys
- ✅ 1 GB de espaço gratuito

**Backup Manual:**
```bash
# Via shell no Render
# Dashboard > Shell
cd /opt/render/project/src/server/database
sqlite3 vendas.db .dump > backup-$(date +%Y%m%d).sql
```

**Inicialização:**
- Banco criado automaticamente no primeiro deploy
- Script `init-db.js` executa na build
- Admin padrão criado com credenciais do `.env`

### 6️⃣ Monitoramento

**Logs em Tempo Real:**
- Dashboard > Logs
- Filtros disponíveis
- Últimas 7 dias no plano gratuito

**Métricas:**
- CPU e Memória
- Requests/segundo
- Tempo de resposta
- Disponível em "Metrics"

**Alertas:**
- Configure em Settings > "Notifications"
- Email quando serviço cai
- Deploy success/failure

### 7️⃣ Auto Deploy e CI/CD

**Deploy Automático:**
- ✅ Ativado por padrão
- Qualquer push na branch `main` = novo deploy
- Aguarda ~3-5 minutos

**Desabilitar Auto Deploy:**
- Settings > Build & Deploy
- Desmarque "Auto-Deploy"

**Branch Específica:**
- Settings > Build & Deploy
- Configure "Branch" para outra branch

**Deploy Manual:**
- Clique em "Manual Deploy" > "Deploy latest commit"

### 8️⃣ Configurações de Segurança

**Headers de Segurança:**
- ✅ HTTPS forçado automaticamente
- ✅ Helmet configurado no Express
- ✅ CORS restrito
- ✅ Rate limiting ativo

**Variáveis Sensíveis:**
- ✅ Nunca commite `.env` no Git
- ✅ Use Environment Variables no Render
- ✅ JWT_SECRET único e forte (64+ caracteres)

**Checklist de Segurança:**
- [ ] JWT_SECRET gerado e forte
- [ ] ADMIN_PASSWORD alterado do padrão
- [ ] CORS_ORIGIN configurado corretamente
- [ ] SSL ativo (automático no Render)
- [ ] Rate limiting testado
- [ ] Logs monitorados

### 9️⃣ Planos e Custos

**Free Tier:**
- ✅ 750 horas/mês (suficiente para 1 serviço 24/7)
- ✅ 100 GB bandwidth
- ✅ SSL grátis
- ✅ Deploy automático
- ⚠️ Serviço hiberna após 15 min inatividade
- ⚠️ Cold start: 30-60 segundos

**Starter ($7/mês):**
- ✅ Sem hibernação
- ✅ 100 GB bandwidth
- ✅ Melhor performance

**Para Produção Recomenda-se:**
- Plano pago para evitar hibernação
- Disco maior se muitos dados
- Custom domain profissional

### 🔟 Troubleshooting

**Erro: "Build failed"**
```bash
# Verifique os logs de build
# Common issues:
- Node version incompatível
- npm install falhou
- Caminho errado no build command
```

**Solução:**
```bash
# Force Node 18
# Em Environment Variables adicione:
NODE_VERSION=18.17.0
```

**Erro: "Database is locked"**
- SQLite não suporta alta concorrência
- Considere migrar para PostgreSQL se necessário
- Render oferece PostgreSQL gratuito

**Erro: "Port already in use"**
- Sempre use `process.env.PORT`
- Render define a porta automaticamente

**Serviço Hibernando:**
- Upgrade para plano pago
- Ou use serviço de ping (UptimeRobot)

**CORS Error:**
```javascript
// Verifique CORS_ORIGIN no .env
// Deve ser exatamente a URL do frontend
CORS_ORIGIN=https://seusite.com
// SEM barra final!
```

### 1️⃣1️⃣ Scripts Úteis

**Conectar via SSH:**
```bash
# Não disponível no free tier
# Upgrade para usar Shell
```

**Ver Logs:**
```bash
# Via Dashboard > Logs
# Ou via CLI (instale render-cli):
render logs -s vendaplano-backend
```

**Restart Manual:**
```bash
# Dashboard > Manual Deploy > "Clear build cache & deploy"
```

### 1️⃣2️⃣ Migração de Railway para Render

Se estava usando Railway:

1. **Exporte variáveis:**
   ```bash
   railway variables > vars.txt
   ```

2. **Importe no Render:**
   - Copie e cole cada variável

3. **Ajuste PORT:**
   - Railway: 3000
   - Render: 10000 (automático)

4. **Ajuste CORS:**
   - Atualize para novo domínio do Render

### 1️⃣3️⃣ Próximos Passos

Após deploy bem-sucedido:

1. **Teste Completo:**
   - ✅ Landing page
   - ✅ Chat IARA
   - ✅ Simulador
   - ✅ Admin login
   - ✅ Dashboard

2. **Segurança:**
   - ✅ Troque senha admin
   - ✅ Verifique JWT_SECRET
   - ✅ Configure alertas

3. **Monitoramento:**
   - Configure UptimeRobot (gratuito)
   - Monitora downtime
   - Pinga a cada 5 minutos

4. **Backup:**
   - Configure backup automático
   - Download periódico do banco

### 1️⃣4️⃣ Checklist Final

Antes de usar em produção:

- [ ] Deploy concluído com sucesso
- [ ] URL obtida e funcionando
- [ ] CORS_ORIGIN atualizado
- [ ] JWT_SECRET forte configurado
- [ ] Senha admin alterada
- [ ] Disco persistente configurado
- [ ] SSL ativo (verificar https)
- [ ] Health check respondendo
- [ ] Login admin testado
- [ ] Dashboard carregando
- [ ] Chat IARA funcionando
- [ ] Logs sendo gerados
- [ ] Backup configurado

### 📞 Suporte

**Links Úteis:**
- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Community Forum](https://community.render.com)
- [Deploy Guides](https://render.com/docs/deploy-node-express-app)

**Suporte Render:**
- Email: support@render.com
- Chat (planos pagos)
- Community forum (gratuito)

---

## 🎯 Comandos Rápidos

```bash
# Gerar JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Testar API
curl https://seu-app.onrender.com/api/health

# Login admin
curl -X POST https://seu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sua-senha"}'

# Ver logs (via render-cli)
render logs -s vendaplano-backend --tail

# Deploy manual (via render-cli)
render deploy -s vendaplano-backend
```

---

✅ **Projeto pronto para produção no Render!**

🚀 **Deploy mais rápido que Railway, com free tier generoso!**
