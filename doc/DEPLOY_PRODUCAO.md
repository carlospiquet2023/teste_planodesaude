# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO

## ⚠️ CHECKLIST PRÉ-DEPLOY

### 1. Variáveis de Ambiente
- [ ] Criar novo `.env` com credenciais de produção
- [ ] Alterar `JWT_SECRET` para chave forte e única
- [ ] Mudar senha do admin padrão
- [ ] Configurar CORS para domínio real
- [ ] Definir `NODE_ENV=production`

### 2. Banco de Dados
- [ ] Fazer backup do banco de dados local
- [ ] Configurar backup automático em produção
- [ ] Testar restore de backup

### 3. Segurança
- [ ] SSL/HTTPS configurado
- [ ] Rate limiting ajustado
- [ ] Senhas fortes definidas
- [ ] Firewall configurado
- [ ] CORS restritivo

### 4. Performance
- [ ] Minificar JavaScript
- [ ] Otimizar imagens
- [ ] Configurar cache
- [ ] CDN para assets estáticos

### 5. Monitoramento
- [ ] Logs configurados
- [ ] Alertas de erro
- [ ] Métricas de performance
- [ ] Backup automático

---

## 📝 PASSOS PARA DEPLOY

### Opção 1: Deploy Manual (VPS/Servidor)

```bash
# 1. No servidor, clonar projeto
git clone <seu-repositorio>
cd vendas_plano

# 2. Instalar dependências do servidor
cd server
npm install --production

# 3. Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com credenciais de produção

# 4. Inicializar banco de dados
npm run init-db

# 5. Instalar PM2 globalmente
npm install -g pm2

# 6. Iniciar aplicação
pm2 start server.js --name vendas-api
pm2 save
pm2 startup

# 7. Configurar Nginx como proxy reverso
sudo nano /etc/nginx/sites-available/vendas
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        root /var/www/vendas_plano;
        index index.html;
        try_files $uri $uri/ =404;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin {
        root /var/www/vendas_plano;
        try_files $uri $uri/ /admin/index.html;
    }
}
```

```bash
# 8. Ativar site e reiniciar Nginx
sudo ln -s /etc/nginx/sites-available/vendas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Configurar SSL com Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

---

### Opção 2: Deploy no Heroku

```bash
# 1. Criar Procfile
echo "web: cd server && npm start" > Procfile

# 2. Criar heroku app
heroku create vendas-plano-app

# 3. Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_super_secreta
heroku config:set PORT=3000

# 4. Deploy
git add .
git commit -m "Preparar para deploy"
git push heroku main

# 5. Ver logs
heroku logs --tail
```

---

### Opção 3: Deploy no Vercel (Frontend) + Railway (Backend)

**Frontend no Vercel:**
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

**Backend no Railway:**
1. Acesse railway.app
2. New Project → Deploy from GitHub
3. Selecione o repositório
4. Configure variáveis de ambiente
5. Deploy automático

---

## 🔐 VARIÁVEIS DE AMBIENTE DE PRODUÇÃO

Crie arquivo `.env` no servidor com:

```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados
DB_PATH=./database/vendas.db

# Segurança
JWT_SECRET=SuaChaveSuperSecretaAleatoria123456789
JWT_EXPIRE=24h

# Admin (MUDAR APÓS PRIMEIRO LOGIN!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SenhaForteProducao2024!

# CORS
CORS_ORIGIN=https://seudominio.com

# Email (opcional - para futuro)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_app
```

---

## 📊 MONITORAMENTO

### Logs com PM2
```bash
pm2 logs vendas-api
pm2 monit
```

### Verificar Status
```bash
pm2 status
pm2 restart vendas-api
pm2 stop vendas-api
```

### Backup do Banco de Dados
```bash
# Criar script de backup
nano /home/user/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/vendas_plano/server/database/vendas.db /var/backups/vendas_$DATE.db
find /var/backups/ -name "vendas_*.db" -mtime +7 -delete
```

```bash
# Tornar executável
chmod +x /home/user/backup-db.sh

# Adicionar ao cron (diariamente às 3h)
crontab -e
# Adicionar linha:
0 3 * * * /home/user/backup-db.sh
```

---

## 🧪 TESTAR EM PRODUÇÃO

1. **Homepage:** https://seudominio.com
2. **Admin:** https://seudominio.com/admin
3. **API Health:** https://seudominio.com/api/health
4. **Teste do chat:** Enviar mensagem e verificar no admin
5. **Teste de login:** Acessar painel admin
6. **Verificar logs:** Sem erros críticos

---

## 🚨 ROLLBACK DE EMERGÊNCIA

Se algo der errado:

```bash
# 1. Parar aplicação
pm2 stop vendas-api

# 2. Restaurar backup do banco
cp /var/backups/vendas_BACKUP.db /var/www/vendas_plano/server/database/vendas.db

# 3. Reverter código
git reset --hard HEAD~1

# 4. Reinstalar dependências
cd server && npm install

# 5. Reiniciar
pm2 restart vendas-api
```

---

## 📞 PÓS-DEPLOY

- [ ] Testar todas as funcionalidades
- [ ] Verificar logs por 24h
- [ ] Monitorar performance
- [ ] Configurar alertas
- [ ] Documentar mudanças
- [ ] Backup funcionando

---

## 🎯 OTIMIZAÇÕES FUTURAS

1. **Cache Redis** para sessões
2. **CDN** para assets estáticos
3. **Load Balancer** se tráfego aumentar
4. **Banco PostgreSQL** para escala
5. **Elasticsearch** para busca avançada
6. **Grafana** para dashboards
7. **Sentry** para monitoramento de erros

---

**Projeto pronto para produção! 🚀**
