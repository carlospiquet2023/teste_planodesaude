# 🚀 GUIA DE DEPLOY NO RAILWAY

## Deploy Rápido

### 1️⃣ Preparação

Certifique-se de que você tem:
- ✅ Conta no GitHub
- ✅ Conta no Railway ([railway.app](https://railway.app))
- ✅ Código do projeto no GitHub

### 2️⃣ Deploy no Railway

#### Opção A: Deploy via GitHub (Recomendado)

1. **Acesse o Railway**
   - Vá para https://railway.app
   - Clique em "Login" e autentique com GitHub

2. **Novo Projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório `teste_planodesaude`

3. **Configuração Automática**
   - O Railway detectará automaticamente o Node.js
   - Os arquivos `railway.json` e `nixpacks.toml` serão usados

4. **Variáveis de Ambiente**
   
   Clique em "Variables" e adicione:

   ```bash
   NODE_ENV=production
   PORT=3000
   
   # Gere uma chave segura com:
   # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_SECRET=sua_chave_secreta_muito_forte_aqui_64_caracteres
   JWT_EXPIRE=24h
   
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@2024!Strong
   ADMIN_EMAIL=admin@seudominio.com
   
   # Será preenchido automaticamente após o deploy
   CORS_ORIGIN=https://seu-projeto.railway.app
   
   DB_PATH=./database/vendas.db
   ```

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Seu app estará disponível em `https://seu-projeto.railway.app`

#### Opção B: Deploy via CLI do Railway

```bash
# Instale o Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicie o projeto
railway init

# Configure variáveis
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=sua_chave_forte

# Deploy
railway up
```

### 3️⃣ Configurações Pós-Deploy

1. **Configure o Domínio Customizado** (Opcional)
   - No Railway, vá em "Settings" > "Domains"
   - Adicione seu domínio personalizado
   - Configure DNS conforme instruções

2. **Atualize CORS_ORIGIN**
   - Após obter a URL do Railway
   - Atualize a variável `CORS_ORIGIN` com sua URL

3. **Teste a Aplicação**
   ```bash
   # Teste a API
   curl https://seu-projeto.railway.app/api/health
   
   # Login admin
   curl -X POST https://seu-projeto.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin@2024!Strong"}'
   ```

### 4️⃣ Banco de Dados

O Railway usa volume persistente automaticamente:
- ✅ SQLite rodando em volume persistente
- ✅ Dados preservados entre deploys
- ✅ Backup automático do Railway

**Para backup manual:**
```bash
# Via Railway CLI
railway run sqlite3 ./database/vendas.db .dump > backup.sql
```

### 5️⃣ Monitoramento

1. **Logs em Tempo Real**
   ```bash
   railway logs
   ```

2. **Dashboard do Railway**
   - Uso de CPU e memória
   - Logs de requisições
   - Métricas de performance

### 6️⃣ Configurações de Segurança

**Variáveis Obrigatórias para Produção:**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta (auto) | `3000` |
| `JWT_SECRET` | Chave JWT (64 chars) | Gerar com crypto |
| `JWT_EXPIRE` | Expiração token | `24h` |
| `ADMIN_PASSWORD` | Senha forte | Min 8 chars, maiúsc, números |
| `CORS_ORIGIN` | Domínio permitido | URL do Railway |

**⚠️ IMPORTANTE:**
- Nunca commite `.env` no Git
- Use senhas fortes para admin
- Gere JWT_SECRET único para produção
- Configure CORS apenas para seu domínio

### 7️⃣ Atualizações e CI/CD

O Railway faz deploy automático a cada push:

```bash
# Faça suas alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Railway detecta e faz deploy automaticamente
```

**Para desabilitar auto-deploy:**
- Settings > General > Desmarque "Auto Deploy"

### 8️⃣ Custos

**Plano Gratuito Railway:**
- ✅ $5 de crédito grátis/mês
- ✅ Suficiente para testes e projetos pequenos
- ✅ Upgrade conforme necessário

**Estimativa de uso:**
- Aplicação básica: ~$3-5/mês
- Com tráfego moderado: ~$10-15/mês

### 9️⃣ Troubleshooting

**Erro: "Build failed"**
```bash
# Verifique logs
railway logs

# Teste localmente
cd server && npm install && npm start
```

**Erro: "Database locked"**
- Reinicie o serviço no Railway
- Verifique se há múltiplas instâncias

**Erro: "JWT invalid"**
- Verifique se JWT_SECRET está configurado
- Regenere tokens se mudou a chave

### 🔟 Checklist Final

Antes de usar em produção:

- [ ] JWT_SECRET gerado e configurado
- [ ] Senha admin alterada
- [ ] CORS_ORIGIN configurado com domínio correto
- [ ] SSL/HTTPS habilitado (Railway faz automaticamente)
- [ ] Backup do banco configurado
- [ ] Logs sendo monitorados
- [ ] Rate limiting ativo
- [ ] Teste todos os endpoints
- [ ] Documentação atualizada

## 📞 Suporte

**Problemas comuns:**
1. Consulte logs: `railway logs`
2. Verifique variáveis: `railway variables`
3. Restart: `railway restart`

**Links Úteis:**
- [Documentação Railway](https://docs.railway.app)
- [Comunidade Railway](https://discord.gg/railway)
- [Status Page](https://status.railway.app)

---

✅ **Projeto pronto para produção no Railway!**
