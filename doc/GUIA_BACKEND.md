# 🚀 GUIA DE INSTALAÇÃO E USO - BACKEND

## ✅ Sistema Completo Instalado!

Seu backend está pronto com:
- ✅ API RESTful completa
- ✅ Banco de dados SQLite configurado
- ✅ Autenticação JWT
- ✅ Painel Admin funcional
- ✅ Todas as tabelas criadas

---

## 📋 COMO USAR

### 1️⃣ Iniciar o Servidor

Abra o terminal na pasta `server` e execute:

```powershell
cd server
npm start
```

Ou para desenvolvimento com auto-reload:
```powershell
npm run dev
```

O servidor estará rodando em: **http://localhost:3000**

---

### 2️⃣ Acessar o Painel Admin

Abra seu navegador e acesse:
- **URL:** http://localhost:3000/admin/dashboard.html

**Credenciais padrão:**
- **Usuário:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

---

### 3️⃣ Integrar com o Chat Frontend

Adicione esta linha no seu `index.html` ANTES do `chat.js`:

```html
<script src="assets/js/backend-integration.js"></script>
<script src="assets/js/chat.js"></script>
```

O sistema automaticamente:
- ✅ Salvará todas as mensagens do chat
- ✅ Registrará novos clientes
- ✅ Armazenará simulações de planos
- ✅ Criará conversas únicas por sessão

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas Criadas:

1. **admins** - Usuários administradores
2. **clients** - Clientes/Leads
3. **conversations** - Conversas do chat
4. **messages** - Mensagens das conversas
5. **simulations** - Simulações de planos
6. **chat_config** - Configurações do sistema

---

## 📡 ENDPOINTS DA API

### Públicos (sem autenticação):

#### Clientes
- `POST /api/clients` - Criar cliente
- `GET /api/conversations/:session_id` - Buscar conversa

#### Mensagens
- `POST /api/messages` - Enviar mensagem
- `GET /api/messages/conversation/:id` - Listar mensagens

#### Simulações
- `POST /api/simulations` - Salvar simulação

### Protegidos (requer token JWT):

#### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/recent-activity` - Atividade recente

#### Gerenciamento
- `GET /api/clients` - Listar todos os clientes
- `GET /api/conversations` - Listar conversas
- `GET /api/simulations` - Listar simulações
- `POST /api/messages/admin-reply` - Responder como admin

---

## 🔧 CONFIGURAÇÕES

Arquivo `.env` na pasta `server`:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/vendas.db
JWT_SECRET=mude_esta_chave_secreta_em_producao_2024
JWT_EXPIRE=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

---

## 🎯 FUNCIONALIDADES DO PAINEL ADMIN

### Dashboard:
- 📊 Estatísticas em tempo real
- 👥 Total de clientes e novos leads
- 💬 Conversas ativas
- 📈 Total de simulações

### Clientes:
- Visualizar todos os clientes cadastrados
- Ver status (novo, contato, interessado, fechado)
- Informações completas (nome, email, telefone, cidade)
- Data de cadastro

### Conversas:
- Listar todas as conversas
- Ver histórico completo de mensagens
- Status das conversas (ativa, fechada, arquivada)
- Identificar cliente de cada conversa

### Simulações:
- Ver todas as simulações realizadas
- Tipo de plano simulado
- Número de dependentes
- Valor total calculado
- Cliente relacionado

---

## 🔒 SEGURANÇA

- ✅ Senhas com hash bcrypt
- ✅ JWT para autenticação
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configurável
- ✅ SQL injection protection

---

## 🐛 TROUBLESHOOTING

### Porta 3000 já em uso:
```powershell
# Parar processo na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Resetar banco de dados:
```powershell
cd server
Remove-Item database/vendas.db
npm run init-db
```

### Erro de CORS:
Verifique se a URL do frontend está em `CORS_ORIGIN` no arquivo `.env`

### Backend não conecta:
1. Certifique-se de que o servidor está rodando
2. Verifique se a porta 3000 está livre
3. Confirme que o arquivo `.env` existe na pasta `server`

---

## 📝 EXEMPLO DE USO NO CÓDIGO

### Salvar cliente do chat:

```javascript
// Automático quando o usuário fornece os dados
await chatIntegration.saveClientInfo({
  name: "João Silva",
  email: "joao@email.com",
  phone: "(11) 99999-9999",
  city: "São Paulo",
  state: "SP",
  interested_plan: "Vida Essencial"
});
```

### Salvar simulação:

```javascript
// Automático quando o usuário faz uma simulação
await chatIntegration.saveSimulation(
  "Vida Essencial", // tipo de plano
  2,                // dependentes
  299.90            // valor total
);
```

### Salvar mensagens:

```javascript
// Automático - todas as mensagens são salvas
await chatIntegration.saveUserMessage("Olá!");
await chatIntegration.saveBotMessage("Oi! Como posso ajudar?");
```

---

## 🚀 DEPLOY PARA PRODUÇÃO

1. Configure variáveis de ambiente para produção
2. Altere `JWT_SECRET` para uma chave forte
3. Configure `NODE_ENV=production`
4. Use PM2 para gerenciar o processo:

```bash
npm install -g pm2
pm2 start server/server.js --name vendas-api
pm2 save
pm2 startup
```

---

## 📞 SUPORTE

Para problemas:
1. Verifique os logs do servidor no terminal
2. Inspecione o console do navegador (F12)
3. Confirme que o banco de dados foi inicializado
4. Teste os endpoints com Postman ou similar

---

## ✨ PRÓXIMOS PASSOS

1. ✅ Inicie o servidor: `npm start`
2. ✅ Acesse o painel: http://localhost:3000/admin/dashboard.html
3. ✅ Faça login com admin/admin123
4. ✅ Teste o chat no frontend
5. ✅ Veja os dados sendo salvos no painel admin!

---

**🎉 Pronto! Seu sistema está 100% funcional!**
