# Backend - Sistema de Vendas de Planos

Backend completo com Node.js + Express + SQLite para gerenciamento de clientes, conversas e simulações.

## 🚀 Funcionalidades

- ✅ API RESTful completa
- ✅ Autenticação JWT para admin
- ✅ Banco de dados SQLite
- ✅ Sistema de conversas e mensagens
- ✅ Registro de clientes e leads
- ✅ Simulações de planos
- ✅ Dashboard com estatísticas
- ✅ Rate limiting para segurança
- ✅ CORS configurado

## 📦 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
Copie o arquivo `.env.example` para `.env` e configure:
```bash
copy .env.example .env
```

3. **Inicializar banco de dados:**
```bash
npm run init-db
```

4. **Iniciar servidor:**
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas:

- **admins** - Usuários administradores
- **clients** - Clientes/Leads
- **conversations** - Conversas do chat
- **messages** - Mensagens das conversas
- **simulations** - Simulações de planos
- **chat_config** - Configurações do sistema

## 🔐 Autenticação

### Login Admin
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Credenciais Padrão
- **Username:** admin
- **Password:** admin123

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 📡 Endpoints da API

### Público (sem autenticação)

#### Clientes
- `POST /api/clients` - Criar novo cliente
- `GET /api/conversations/:session_id` - Buscar conversa

#### Conversas
- `POST /api/conversations` - Criar nova conversa
- `GET /api/conversations/:id` - Buscar conversa por ID

#### Mensagens
- `POST /api/messages` - Enviar mensagem
- `GET /api/messages/conversation/:id` - Listar mensagens

#### Simulações
- `POST /api/simulations` - Criar simulação

### Protegido (requer autenticação)

#### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/recent-activity` - Atividade recente

#### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

#### Conversas
- `GET /api/conversations` - Listar conversas
- `PUT /api/conversations/:id/status` - Atualizar status

#### Mensagens
- `POST /api/messages/admin-reply` - Responder como admin

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/vendas.db
JWT_SECRET=sua_chave_secreta
JWT_EXPIRE=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5500
```

## 📊 Status de Clientes

- `novo` - Cliente recém-cadastrado
- `contato` - Em processo de contato
- `interessado` - Demonstrou interesse
- `negociacao` - Em negociação
- `fechado` - Venda fechada
- `perdido` - Lead perdido

## 🛡️ Segurança

- Rate limiting (100 req/15min por IP)
- Senhas com hash bcrypt
- JWT para autenticação
- CORS configurável
- SQL injection protection (prepared statements)

## 🚀 Deploy

### Produção

1. Configure o `.env` para produção:
```env
NODE_ENV=production
JWT_SECRET=chave_super_secreta_aleatoria
```

2. Instale apenas dependências de produção:
```bash
npm install --production
```

3. Inicie com PM2 (recomendado):
```bash
npm install -g pm2
pm2 start server.js --name vendas-api
pm2 save
```

## 📝 Logs

Os logs são exibidos no console. Para produção, recomenda-se usar PM2 para gerenciar logs:

```bash
pm2 logs vendas-api
```

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Resetar banco de dados
```bash
Remove-Item database/vendas.db
npm run init-db
```

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Os logs do servidor
2. Se o banco de dados foi inicializado
3. Se as variáveis de ambiente estão corretas

## 📄 Licença

MIT
