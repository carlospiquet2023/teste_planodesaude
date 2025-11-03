# 🚀 Guia de Deploy para Produção

## ✅ Checklist Pré-Deploy

Antes de fazer o deploy em produção, verifique:

- [ ] Todas as variáveis no `.env` foram configuradas corretamente
- [ ] `JWT_SECRET` foi alterado para uma chave forte e única
- [ ] Senha do admin padrão foi alterada
- [ ] `NODE_ENV=production` está configurado
- [ ] Banco de dados foi inicializado com `npm run init-db`
- [ ] Todas as dependências estão instaladas
- [ ] Testes foram executados com sucesso
- [ ] CORS está configurado apenas para domínios permitidos
- [ ] Certificado SSL está instalado (HTTPS)

---

## 🔐 Segurança em Produção

### 1. Gerar JWT Secret Forte

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado e coloque no `.env`:
```env
JWT_SECRET=seu_hash_gerado_aqui_muito_longo_e_seguro
```

### 2. Alterar Credenciais Padrão

Após o primeiro login, acesse o painel admin e altere:
- Username do admin
- Senha do admin (mínimo 8 caracteres)
- Email de contato

### 3. Configurar CORS

No arquivo `.env`, especifique APENAS os domínios permitidos:

```env
CORS_ORIGIN=https://www.seudominio.com.br,https://seudominio.com.br
```

### 4. Rate Limiting

Ajuste conforme necessário:

```env
RATE_LIMIT_WINDOW_MS=900000        # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100        # máximo de requisições
```

---

## 📦 Deploy em Servidor VPS (Ubuntu)

### 1. Instalar Node.js

```bash
# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 3. Clonar o Projeto

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/vendas_plano.git
cd vendas_plano/server
```

### 4. Configurar o Projeto

```bash
# Instalar dependências
npm install --production

# Criar arquivo .env
cp .env.example .env
nano .env  # Edite com suas configurações

# Inicializar banco
npm run init-db
```

### 5. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start server.js --name vendaplano

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs vendaplano
```

### 6. Configurar Nginx (Reverse Proxy)

```bash
sudo apt install nginx -y
```

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/vendaplano
```

Adicione:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar configuração:

```bash
sudo ln -s /etc/nginx/sites-available/vendaplano /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Instalar Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br

# Testar renovação automática
sudo certbot renew --dry-run
```

---

## ☁️ Deploy em Plataformas Cloud

### Heroku

1. Instale o Heroku CLI
2. Faça login: `heroku login`
3. Crie o app: `heroku create vendaplano-app`
4. Configure variáveis:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_forte
heroku config:set PORT=3000
```
5. Deploy:
```bash
git push heroku main
```

### Vercel

1. Instale Vercel CLI: `npm i -g vercel`
2. Configure `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server/server.js"
    }
  ]
}
```
3. Deploy: `vercel --prod`

### Railway

1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Configure variáveis de ambiente no dashboard
4. Deploy automático a cada push

---

## 🔄 Atualizações e Manutenção

### Atualizar o Código

```bash
cd /var/www/vendas_plano
git pull origin main
cd server
npm install
pm2 restart vendaplano
```

### Backup do Banco de Dados

```bash
# Criar backup
cp server/database/vendas.db server/database/vendas.db.backup_$(date +%Y%m%d)

# Automatizar backup diário (crontab)
crontab -e
# Adicione: 0 2 * * * cp /var/www/vendas_plano/server/database/vendas.db /backups/vendas_$(date +\%Y\%m\%d).db
```

### Monitoramento

```bash
# Ver logs em tempo real
pm2 logs vendaplano

# Monitorar recursos
pm2 monit

# Ver informações detalhadas
pm2 info vendaplano
```

---

## 🐛 Troubleshooting em Produção

### Erro: "Cannot find module"

```bash
cd /var/www/vendas_plano/server
npm install
pm2 restart vendaplano
```

### Erro: "EADDRINUSE: Port already in use"

```bash
# Encontrar processo na porta 3000
sudo lsof -i :3000

# Matar processo
sudo kill -9 [PID]

# Reiniciar PM2
pm2 restart vendaplano
```

### Erro: "Database locked"

```bash
# Verificar permissões
sudo chown -R $USER:$USER /var/www/vendas_plano/server/database
chmod 644 /var/www/vendas_plano/server/database/vendas.db
```

### Site lento

```bash
# Verificar uso de recursos
pm2 monit

# Aumentar limite de memória no PM2
pm2 delete vendaplano
pm2 start server.js --name vendaplano --max-memory-restart 500M
pm2 save
```

---

## 📊 Otimizações de Performance

### 1. Habilitar Compressão Gzip

Instale no `server.js`:

```javascript
const compression = require('compression');
app.use(compression());
```

```bash
npm install compression
```

### 2. Cache de Arquivos Estáticos no Nginx

Adicione ao bloco `location /`:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Otimizar SQLite

No `config/database.js`, adicione:

```javascript
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');
db.run('PRAGMA cache_size = 10000');
db.run('PRAGMA temp_store = MEMORY');
```

### 4. Implementar CDN

Use Cloudflare ou AWS CloudFront para:
- Distribuição global
- Cache automático
- Proteção DDoS
- SSL gratuito

---

## 🔒 Checklist de Segurança Final

- [ ] HTTPS habilitado (certificado SSL válido)
- [ ] Firewall configurado (apenas portas 80 e 443 abertas)
- [ ] Banco de dados com permissões restritas
- [ ] Variáveis sensíveis não expostas no código
- [ ] Rate limiting ativo
- [ ] Logs de acesso e erro habilitados
- [ ] Backup automático configurado
- [ ] Senha do admin alterada
- [ ] CORS restrito a domínios conhecidos
- [ ] Dependências atualizadas (sem vulnerabilidades)

Verifique vulnerabilidades:
```bash
cd server
npm audit
npm audit fix
```

---

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs: `pm2 logs vendaplano`
2. Consulte a documentação: `/doc`
3. Entre em contato: suporte@vendaplano.com.br

---

**Bom deploy! 🚀**
