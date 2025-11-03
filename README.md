# 🏥 VendaPlano - Sistema de Vendas de Planos de Saúde

Sistema completo de vendas com chat inteligente (IARA) para consultoria de planos de saúde.

## 🚀 Deploy no Render

### Pré-requisitos

- Conta no [Render](https://render.com/)
- Conta no GitHub

### Passo a Passo

1. **Fork ou Clone este repositório**

2. **Acesse o Render**
   - Faça login em https://render.com/
   - Clique em "New +" > "Web Service"
   - Conecte seu repositório GitHub

3. **Configure o Serviço**
   
   Configurações básicas:
   ```
   Name: vendaplano-backend
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: cd server && npm install && npm run init-db
   Start Command: cd server && npm start
   ```

4. **Configure as Variáveis de Ambiente**
   
   No Render, adicione as seguintes variáveis:
   
   ```bash
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=SUA_CHAVE_SECRETA_AQUI_64_CARACTERES
   JWT_EXPIRE=24h
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=SuaSenhaSegura123!
   ADMIN_EMAIL=seu-email@exemplo.com
   CORS_ORIGIN=https://seu-app.onrender.com
   DB_PATH=./database/vendas.db
   ```

   ⚠️ **IMPORTANTE**: Gere uma chave JWT forte usando:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Configure Disco Persistente**
   - Em "Disks", clique "Add Disk"
   - Name: `vendaplano-db`
   - Mount Path: `/opt/render/project/src/server/database`
   - Size: 1 GB

6. **Deploy Automático**
   - Clique em "Create Web Service"
   - O Render iniciará o deploy automaticamente
   - Aguarde a conclusão (3-5 minutos)

7. **Acesse sua Aplicação**
   - O Render fornecerá uma URL pública
   - Formato: `https://seu-app.onrender.com`

## 📁 Estrutura do Projeto

```
vendas_plano/
├── index.html              # Landing page principal
├── admin/
│   └── index.html          # Painel administrativo
├── assets/
│   ├── css/               # Estilos
│   ├── js/                # Scripts frontend
│   └── data/              # Base de conhecimento IARA
├── server/                # Backend Node.js
│   ├── server.js          # Servidor Express
│   ├── config/            # Configurações
│   ├── middleware/        # Middlewares de segurança
│   ├── routes/            # Rotas da API
│   └── database/          # Banco SQLite
└── doc/                   # Documentação
```

## 🛠️ Tecnologias

### Frontend
- HTML5, CSS3, JavaScript
- Design Responsivo
- Chat Inteligente (IARA)
- Simulador de Planos

### Backend
- Node.js + Express
- SQLite (banco de dados)
- JWT (autenticação)
- Helmet, CORS (segurança)
- Winston (logs)

## 🔐 Segurança

O sistema implementa:
- ✅ Autenticação JWT
- ✅ Rate Limiting
- ✅ Sanitização de dados
- ✅ Proteção XSS
- ✅ CORS configurado
- ✅ Helmet headers
- ✅ Logs de auditoria

## 📱 Funcionalidades

### Para Clientes
- Chat inteligente com IARA
- Simulação de planos
- Comparação de coberturas
- Solicitação de propostas

### Para Administradores
- Dashboard completo
- Gestão de conteúdo
- Análise de conversas
- Relatórios em tempo real

## 🚀 Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vendas_plano.git

# Entre na pasta do servidor
cd vendas_plano/server

# Instale as dependências
npm install

# Configure o .env
cp .env.example .env

# Inicialize o banco de dados
npm run init-db

# Inicie o servidor
npm run dev
```

Acesse: `http://localhost:3000`

## 📚 Documentação

Consulte a pasta `doc/` para documentação completa:
- `INICIO_RAPIDO.md` - Guia de início rápido
- `GUIA_BACKEND.md` - Documentação da API
- `GUIA_DEPLOY.md` - Deploy detalhado
- `SEGURANCA_RESUMO.md` - Segurança e boas práticas

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `/doc`
2. Verifique os logs no Railway
3. Abra uma issue no GitHub

## 📄 Licença

MIT License - Veja LICENSE para detalhes

---

Desenvolvido com ❤️ para transformar vendas de planos de saúde
