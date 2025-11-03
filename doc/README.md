# 🏥 VendaPlano - Sistema Completo de Gestão de Planos de Saúde

[![Node.js](https://img.shields.io/badge/Node.js-22.18.0-green)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue)](https://www.sqlite.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Sistema profissional de vendas e gestão de planos de saúde com chat inteligente, simulador de preços e painel administrativo completo.

---

## 🎯 Principais Funcionalidades

### 👥 **Para Usuários (Site Principal)**
- 🤖 **Chat IARA**: Assistente virtual inteligente 24/7
- 💰 **Simulador de Preços**: Cálculo instantâneo de valores
- 📱 **Design Responsivo**: Funciona perfeitamente em qualquer dispositivo
- ✨ **Animações Suaves**: Experiência de usuário premium
- 🔒 **Seguro**: Proteção de dados e privacidade

### 📊 **Para Administradores (Dashboard Pro)**
- 📈 **Dashboard Completo**: Estatísticas em tempo real
- 🔥 **Classificação de Leads**: Sistema automático (Quente/Morno/Frio)
- 📊 **Gráficos Interativos**: Visualização com Chart.js
- 📤 **Exportação Excel**: Relatórios completos via SheetJS
- ✏️ **Editor de Conteúdo**: Atualize o site remotamente
- 💰 **Gestão de Preços**: CRUD completo de planos
- 🔐 **Autenticação JWT**: Segurança robusta

---

## 📁 Estrutura do Projeto

```
vendas_plano/
│
├── 📄 index.html                    # Página principal do site
├── 📄 README.md                     # Este arquivo
├── 📄 .gitignore                    # Arquivos ignorados pelo Git
│
├── 📁 admin/                        # Painel Administrativo
│   └── 📄 index.html                # Dashboard Pro (unificado)
│
├── 📁 assets/                       # Recursos do frontend
│   ├── 📁 css/
│   │   ├── style.css                # Estilos principais
│   │   └── animations.css           # Animações
│   │
│   ├── 📁 js/
│   │   ├── main.js                  # JavaScript principal
│   │   ├── simulator.js             # Simulador de preços
│   │   ├── chat-smart.js            # Chat IARA inteligente
│   │   ├── backend-integration.js   # Integração com API
│   │   └── admin-pro.js             # Dashboard administrativo
│   │
│   └── 📁 data/
│       └── iara-knowledge.json      # Base de conhecimento da IARA
│
├── 📁 server/                       # Backend Node.js
│   ├── 📄 server.js                 # Servidor Express
│   ├── 📄 package.json              # Dependências
│   ├── 📄 .env.example              # Exemplo de configuração
│   │
│   ├── 📁 config/
│   │   └── database.js              # Configuração SQLite
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                  # Autenticação JWT
│   │
│   ├── 📁 routes/                   # Rotas da API
│   │   ├── auth.js                  # Autenticação
│   │   ├── clients.js               # Clientes/Leads
│   │   ├── conversations.js         # Conversas do chat
│   │   ├── messages.js              # Mensagens
│   │   ├── simulations.js           # Simulações
│   │   ├── dashboard.js             # Estatísticas
│   │   └── content.js               # Gestão de conteúdo
│   │
│   ├── 📁 scripts/
│   │   └── init-db.js               # Inicialização do banco
│   │
│   └── 📁 database/
│       └── vendas.db                # Banco SQLite (criado automaticamente)
│
└── 📁 doc/                          # Documentação adicional
    ├── INICIO_RAPIDO.md
    ├── GUIA_BACKEND.md
    ├── DASHBOARD_PRO.md
    └── DEPLOY_PRODUCAO.md
```

---

## 🚀 Guia de Instalação

### 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18+ instalado
- npm (vem com Node.js)
- Git (opcional)

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/vendas_plano.git
cd vendas_plano
```

### 2️⃣ Instale as Dependências

```bash
cd server
npm install
```

### 3️⃣ Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env e configure suas credenciais
# IMPORTANTE: Mude o JWT_SECRET em produção!
```

### 4️⃣ Inicialize o Banco de Dados

```bash
npm run init-db
```

**Saída esperada:**
```
✅ Tabelas criadas com sucesso!
✅ Admin padrão criado: admin / admin123
✅ Conteúdo inicial inserido!
✅ Banco de dados inicializado!
```

### 5️⃣ Inicie o Servidor

```bash
npm start
```

**Servidor rodando em:**
- 🌐 Site: http://localhost:3000
- 📊 Admin: http://localhost:3000/admin

### 6️⃣ Acesse o Painel Admin

1. Acesse: http://localhost:3000/admin
2. **Login padrão:**
   - Usuário: `admin`
   - Senha: `admin123`
3. ⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## 📖 Como Usar

### 🌐 Site Principal (Usuário Final)

1. **Página Inicial**: Apresentação dos planos e benefícios
2. **Simulador**: Calcule o valor do plano baseado em dependentes
3. **Chat IARA**: Converse com a assistente virtual para tirar dúvidas
4. **Formulário de Contato**: Solicite orçamento personalizado

### 📊 Painel Administrativo

#### Dashboard
- Visualize estatísticas em tempo real
- Veja leads classificados por temperatura (🔥 Quente, 🌡️ Morno, ❄️ Frio)
- Acompanhe simulações e conversas

#### Gestão de Leads
- Lista completa de todos os leads
- Classificação automática baseada em:
  - Idade (25-55 anos = +2 pontos)
  - Dependentes (>0 = +2 pontos)
  - Contato fornecido (telefone = +1, email = +1)
- Exportação para Excel com 1 clique

#### Relatórios & Analytics
- Gráficos de distribuição de leads
- Métricas de conversão
- Lista de leads prioritários (score ≥ 4)
- Exportação de relatórios completos

#### Editor de Conteúdo
- Edite textos do site sem tocar no código
- Seções disponíveis:
  - 🏠 Seção Principal (Hero)
  - ✨ Benefícios
  - ⚙️ Como Funciona
  - 💬 Depoimentos
  - ❓ FAQ
  - 📄 Rodapé

#### Gestão de Preços
- Adicionar novos planos
- Editar planos existentes
- Excluir planos desatualizados
- Interface intuitiva com modals

---

## 🔐 Segurança

- ✅ **JWT Tokens**: Autenticação segura com tokens de 24h
- ✅ **Bcrypt**: Senhas criptografadas com hash
- ✅ **Rate Limiting**: Proteção contra força bruta (100 req/15min)
- ✅ **CORS Configurável**: Apenas origens permitidas
- ✅ **Validação de Entrada**: Todos os dados são validados
- ✅ **SQL Injection**: Proteção via prepared statements

---

## 🎨 Tecnologias Utilizadas

### Backend
- **Node.js** v22.18.0 - Runtime JavaScript
- **Express.js** v4.18.2 - Framework web
- **SQLite3** v5.1.6 - Banco de dados
- **JWT** v9.0.2 - Autenticação
- **Bcrypt** v2.4.3 - Criptografia de senhas
- **CORS** v2.8.5 - Controle de acesso
- **Express Rate Limit** v7.1.5 - Proteção contra abuso

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com Flexbox/Grid
- **JavaScript ES6+** - Funcionalidades interativas
- **Chart.js** v4.4.0 - Gráficos interativos
- **SheetJS** v0.20.1 - Exportação para Excel
- **Font Awesome** v6.5.1 - Ícones

---

## 📊 API Endpoints

### Autenticação
```http
POST /api/auth/login
POST /api/auth/change-password
GET  /api/auth/verify
```

### Clientes/Leads
```http
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Conversas
```http
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/:id
```

### Mensagens
```http
GET    /api/messages/:conversationId
POST   /api/messages
```

### Simulações
```http
GET    /api/simulations
POST   /api/simulations
GET    /api/simulations/:id
```

### Dashboard
```http
GET /api/dashboard/stats
```

### Gestão de Conteúdo
```http
GET    /api/content
PUT    /api/content
GET    /api/content/pricing
POST   /api/content/pricing
GET    /api/content/pricing/:id
PUT    /api/content/pricing/:id
DELETE /api/content/pricing/:id
```

---

## 🧪 Scripts Disponíveis

```bash
# Iniciar servidor em produção
npm start

# Iniciar com hot-reload (desenvolvimento)
npm run dev

# Inicializar/resetar banco de dados
npm run init-db
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
cd server
npm install
```

### Erro: "Port 3000 already in use"
```bash
# Mude a porta no arquivo .env
PORT=3001
```

### Banco de dados não inicializa
```bash
# Delete o banco antigo e recrie
rm server/database/vendas.db
npm run init-db
```

### Erro ao fazer login no admin
```bash
# Verifique se o banco foi inicializado
npm run init-db

# Credenciais padrão:
# Usuário: admin
# Senha: admin123
```

---

## 📈 Roadmap

- [ ] Integração com WhatsApp Business API
- [ ] Sistema de email marketing automatizado
- [ ] Dashboard de métricas avançadas (Google Analytics)
- [ ] Sistema de notificações em tempo real
- [ ] App mobile (React Native)
- [ ] Integração com CRM externo
- [ ] Sistema de agendamento de consultas
- [ ] Portal do cliente

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**VendaPlano Team**

- Website: [vendaplano.com.br](https://vendaplano.com.br)
- Email: contato@vendaplano.com.br

---

## 🙏 Agradecimentos

- Chart.js pela biblioteca de gráficos
- SheetJS pela funcionalidade de Excel
- Font Awesome pelos ícones
- Node.js e Express.js pela infraestrutura

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- 📧 Email: suporte@vendaplano.com.br
- 💬 Chat: Disponível no site
- 📚 Documentação: Ver pasta `/doc`

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

Feito com ❤️ por VendaPlano Team

</div>
