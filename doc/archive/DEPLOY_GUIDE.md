# 🚀 GUIA DE DEPLOY PROFISSIONAL

## 📋 PRÉ-REQUISITOS

### 1. Variáveis de Ambiente Configuradas
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=[64 caracteres aleatórios]
CORS_ORIGIN=[seus domínios]
```

### 2. Dependências Instaladas
```bash
cd server
npm ci --production
```

### 3. Banco de Dados Inicializado
```bash
npm run init-db
```

---

## 🎯 DEPLOY NO RENDER

### Passo 1: Criar Web Service
1. Acesse [render.com](https://render.com)
2. New + → Web Service
3. Conecte seu repositório GitHub

### Passo 2: Configurar Build
```yaml
Build Command: npm install && cd server && npm install
Start Command: cd server && node server.js
```

### Passo 3: Variáveis de Ambiente
Adicione no painel do Render:
- `NODE_ENV`: production
- `JWT_SECRET`: [chave gerada]
- `PORT`: 10000
- `CORS_ORIGIN`: https://seu-app.onrender.com

### Passo 4: Validar Deploy
Aguarde o build completar e acesse:
- `https://seu-app.onrender.com/api/health`
- `https://seu-app.onrender.com/admin`

---

## 🐳 DEPLOY COM DOCKER (OPCIONAL)

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --production
RUN cd server && npm ci --production
COPY . .
EXPOSE 10000
CMD ["node", "server/server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "10000:10000"
    environment:
      - NODE_ENV=production
      - PORT=10000
    volumes:
      - ./server/database:/app/server/database
      - ./server/logs:/app/server/logs
```

### Comandos
```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

---

## ☁️ DEPLOY NA AWS/AZURE/GCP

### AWS Elastic Beanstalk
```bash
eb init -p node.js-18 vendaplano
eb create vendaplano-env
eb deploy
```

### Azure App Service
```bash
az webapp up --name vendaplano --runtime "NODE:18-lts"
```

### Google Cloud Run
```bash
gcloud run deploy vendaplano --source . --platform managed
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] Todas as variáveis de ambiente configuradas
- [ ] JWT_SECRET alterado para chave forte
- [ ] CORS configurado com domínios corretos
- [ ] Testes executados com sucesso (`npm test`)
- [ ] Build funcionando (`npm run build`)
- [ ] Health check respondendo
- [ ] Logs configurados
- [ ] Backup do banco configurado

---

## 🔍 MONITORAMENTO PÓS-DEPLOY

### Health Check
```bash
curl https://seu-app.com/api/health
```

### Logs em Tempo Real
```bash
# Render
render logs -f

# Docker
docker-compose logs -f

# PM2
pm2 logs
```

### Métricas
Acesse: `https://seu-app.com/api/health/detailed`

---

## 🆘 TROUBLESHOOTING

### Erro: Porta já em uso
```bash
# Windows
netstat -ano | findstr :10000
taskkill /PID [numero] /F

# Linux/Mac
lsof -i :10000
kill -9 [PID]
```

### Erro: Banco de dados não encontrado
```bash
npm run init-db
```

### Erro: JWT inválido
Verifique se `JWT_SECRET` está configurado corretamente

### Erro: CORS bloqueando
Adicione seu domínio em `CORS_ORIGIN`

---

## 📊 PERFORMANCE

### Otimizações Aplicadas
- ✅ Compressão Gzip
- ✅ Cache de assets estáticos
- ✅ Rate limiting
- ✅ Prepared statements (SQL)
- ✅ Logging assíncrono
- ✅ Health checks otimizados

### Benchmarks Esperados
- Response time: < 100ms
- Throughput: > 1000 req/s
- Memória: < 512MB
- CPU: < 50%

---

## 🔐 SEGURANÇA

### Implementado
- ✅ Helmet (headers seguros)
- ✅ Rate limiting
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CORS configurável
- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Input validation
- ✅ Logging de segurança

---

## 📞 SUPORTE

Em caso de problemas:
1. Verifique os logs: `/server/logs/`
2. Execute diagnóstico: `npm run diagnose`
3. Verifique health check: `/api/health/detailed`
