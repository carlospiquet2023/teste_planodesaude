# ✅ PROJETO CONFIGURADO PARA RENDER

## 📦 O que foi feito:

### 1. ✅ Preparação para Render

- Criado `render.yaml` - Configuração Blueprint do Render
- Criado `start.sh` - Script de inicialização
- Atualizado `Procfile` - Start command
- Atualizado `package.json` - Scripts de build
- Criado `README.md` - Documentação atualizada para Render
- Criado `RENDER_DEPLOY.md` - Guia completo de deploy no Render

### 2. ✅ Repositório GitHub

- Projeto: https://github.com/carlospiquet2023/teste_planodesaude.git
- Branch: `main`
- Configurado para deploy automático no Render

## 🚀 PRÓXIMOS PASSOS - DEPLOY NO RENDER:

### 1️⃣ Acesse o Render (2 minutos)

1. **Crie sua conta:**
   - Vá para: https://render.com
   - Clique em "Get Started"
   - Faça login com GitHub (recomendado)

### 2️⃣ Crie o Web Service (3 minutos)

1. **No Dashboard:**
   - Clique em "New +" > "Web Service"
   - Conecte: `carlospiquet2023/teste_planodesaude`

2. **Configure:**
   ```
   Name: vendaplano-backend
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: cd server && npm install && npm run init-db
   Start Command: cd server && npm start
   Instance Type: Free
   ```

### 3️⃣ Variáveis de Ambiente (2 minutos)

**Gere JWT_SECRET primeiro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Adicione no Render:**
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=cole_resultado_aqui
JWT_EXPIRE=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2024!Strong
ADMIN_EMAIL=seu@email.com
CORS_ORIGIN=https://vendaplano-backend.onrender.com
DB_PATH=./database/vendas.db
```

### 4️⃣ Disco Persistente (1 minuto)

**IMPORTANTE** para banco de dados:
```
Name: vendaplano-db
Mount Path: /opt/render/project/src/server/database
Size: 1 GB
```

### 5️⃣ Deploy! (3-5 minutos)

- Clique em "Create Web Service"
- Aguarde o deploy
- Obtenha URL: `https://vendaplano-backend.onrender.com`

### 6️⃣ Atualize CORS

- Environment > CORS_ORIGIN
- Cole a URL gerada
- Save Changes

### 7️⃣ Teste

```bash
# Health check
curl https://vendaplano-backend.onrender.com/api/health

# Login admin
curl -X POST https://vendaplano-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024!Strong"}'
```

## 📋 Checklist

- [ ] Conta Render criada
- [ ] Web Service criado
- [ ] Variáveis configuradas
- [ ] JWT_SECRET gerado
- [ ] Disco persistente adicionado
- [ ] Deploy concluído
- [ ] CORS_ORIGIN atualizado
- [ ] Testes passando

## 🎯 Links

- **GitHub:** https://github.com/carlospiquet2023/teste_planodesaude
- **Render:** https://render.com
- **Docs:** Ver `RENDER_DEPLOY.md` para guia completo

## 💡 Dicas

**Plano Free:**
- 750h/mês grátis
- Hiberna após 15 min
- Use UptimeRobot para manter ativo

**Próximos deploys:**
```bash
git add .
git commit -m "update"
git push origin main
# Deploy automático!
```

## 🆘 Suporte

Ver `RENDER_DEPLOY.md` para troubleshooting completo.

---

🚀 **Pronto para produção no Render!**
