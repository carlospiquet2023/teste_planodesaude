# 🏗️ ARQUITETURA DO SISTEMA - VENDAPLANO

## 📋 VISÃO GERAL

**VendaPlano** é um sistema completo de vendas de planos de saúde com chat inteligente, desenvolvido com arquitetura modular e escalável.

### Stack Tecnológico
- **Backend**: Node.js 18+ | Express.js 4.x
- **Database**: SQLite 3 (migração para PostgreSQL recomendada para produção)
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: Helmet, Rate Limiting, SQL Injection Protection
- **Logging**: Winston
- **Testes**: Jest + Supertest

---

## 🗂️ ESTRUTURA DE DIRETÓRIOS

```
vendas_plano/
├── server/                      # Backend Node.js
│   ├── config/                  # Configurações
│   │   └── database.js          # Conexão SQLite
│   ├── middleware/              # Middlewares Express
│   │   ├── auth.js              # Autenticação JWT
│   │   ├── logger.js            # Winston logger
│   │   ├── security.js          # Helmet, Rate Limit
│   │   └── validation.js        # Validação de entrada
│   ├── routes/                  # Rotas da API
│   │   ├── auth.js              # Login/Logout
│   │   ├── clients.js           # CRUD Clientes
│   │   ├── conversations.js     # Conversas chat
│   │   ├── messages.js          # Mensagens
│   │   ├── simulations.js       # Simulações
│   │   ├── dashboard.js         # Métricas admin
│   │   └── content.js           # CMS conteúdo
│   ├── utils/                   # Utilitários
│   │   ├── helpers.js           # Funções reutilizáveis
│   │   ├── response-handler.js  # Respostas padronizadas
│   │   ├── env-validator.js     # Validação de .env
│   │   └── health-check.js      # Health checks
│   ├── tests/                   # Testes automatizados
│   │   ├── unit/                # Testes unitários
│   │   └── integration/         # Testes de integração
│   ├── database/                # SQLite database
│   ├── logs/                    # Logs da aplicação
│   └── server.js                # Entry point
├── assets/                      # Frontend assets
│   ├── js/                      # JavaScript
│   ├── css/                     # Estilos
│   └── data/                    # JSON data
├── admin/                       # Painel admin
└── index.html                   # Landing page

```

---

## 🔄 FLUXO DE DADOS

### 1. Cliente Acessa Landing Page
```
Cliente → index.html → Chat Widget → backend-integration.js
```

### 2. Conversa no Chat
```
Cliente digita → main.js → chat-smart.js → API /conversations → Database
                                         ↓
                                   API /messages
                                         ↓
                                   Resposta Iara IA
```

### 3. Admin Login
```
Admin → /admin → admin-pro.js → API /auth/login → JWT Token → Dashboard
```

### 4. CRUD Operations
```
Admin → Dashboard → API Request → Middleware → Route Handler → Database
         ↑                            ↓
         └──────── Response ←─────────┘
```

---

## 🛡️ CAMADAS DE SEGURANÇA

### Camada 1: Headers HTTP (Helmet)
```javascript
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ X-XSS-Protection: 1; mode=block
✅ Content-Security-Policy
✅ Strict-Transport-Security (HSTS)
```

### Camada 2: Rate Limiting
```javascript
Login: 5 tentativas / 15 min
API Geral: 100 requisições / 15 min
Create: 50 criações / hora
```

### Camada 3: Validação de Entrada
```javascript
✅ Express Validator
✅ Sanitização de dados
✅ XSS Protection
✅ SQL Injection Protection (Prepared Statements)
```

### Camada 4: Autenticação
```javascript
✅ JWT com expiração
✅ Bcrypt hash (salt rounds: 10)
✅ Middleware de autenticação
```

### Camada 5: Logging & Monitoramento
```javascript
✅ Winston structured logging
✅ Security logger
✅ Audit trail
✅ Health checks
```

---

## 🗄️ MODELO DE DADOS

### Tabelas Principais

#### `admins`
```sql
- id: INTEGER PRIMARY KEY
- username: TEXT UNIQUE
- email: TEXT
- password: TEXT (bcrypt hash)
- created_at: TIMESTAMP
- last_login: TIMESTAMP
```

#### `clients`
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT NOT NULL
- email: TEXT
- phone: TEXT
- city: TEXT
- state: TEXT
- interested_plan: TEXT
- source: TEXT (chat, form, direct)
- status: TEXT (novo, em_atendimento, convertido, perdido)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `conversations`
```sql
- id: INTEGER PRIMARY KEY
- client_id: INTEGER FK → clients
- session_id: TEXT UNIQUE
- status: TEXT (active, closed)
- started_at: TIMESTAMP
- ended_at: TIMESTAMP
```

#### `messages`
```sql
- id: INTEGER PRIMARY KEY
- conversation_id: INTEGER FK → conversations
- sender: TEXT (client, admin, bot)
- message: TEXT
- timestamp: TIMESTAMP
```

#### `simulations`
```sql
- id: INTEGER PRIMARY KEY
- client_id: INTEGER FK → clients
- plan_type: TEXT
- monthly_value: REAL
- total_value: REAL
- discount: REAL
- created_at: TIMESTAMP
```

#### `chat_content`
```sql
- id: INTEGER PRIMARY KEY
- section: TEXT (knowledge_base, responses, plans)
- content: TEXT (JSON)
- updated_at: TIMESTAMP
```

---

## 🔌 API ENDPOINTS

### Públicos (sem autenticação)

#### Health Check
```
GET /api/health
GET /api/health/detailed
```

#### Clientes
```
POST /api/clients          # Criar cliente (rate limited)
```

#### Conversas
```
POST /api/conversations    # Iniciar conversa
```

#### Mensagens
```
POST /api/messages         # Enviar mensagem
```

### Protegidos (requer JWT)

#### Autenticação
```
POST /api/auth/login       # Login admin
GET  /api/auth/me          # Dados do usuário
POST /api/auth/change-password
```

#### Clientes
```
GET    /api/clients        # Listar (paginado)
GET    /api/clients/:id    # Buscar por ID
PUT    /api/clients/:id    # Atualizar
DELETE /api/clients/:id    # Deletar
```

#### Conversas
```
GET /api/conversations     # Listar todas
GET /api/conversations/:id # Buscar por ID
PUT /api/conversations/:id # Atualizar status
```

#### Dashboard
```
GET /api/dashboard/stats          # Estatísticas gerais
GET /api/dashboard/activity       # Atividade recente
GET /api/dashboard/analytics      # Análises avançadas
```

#### Conteúdo (CMS)
```
GET  /api/content/:section  # Buscar conteúdo
POST /api/content/:section  # Atualizar conteúdo
```

---

## ⚡ PERFORMANCE

### Otimizações Implementadas

1. **Database**
   - Índices em campos frequentes (email, session_id)
   - Prepared statements
   - Connection pooling

2. **Caching**
   - Static assets: 1 dia
   - ETag habilitado
   - Compression (Gzip)

3. **Queries**
   - Paginação padrão
   - Limit/Offset otimizados
   - Lazy loading de relacionamentos

4. **Logging**
   - Winston async
   - Log rotation automático
   - Níveis configuráveis

### Benchmarks Esperados
```
Response Time: < 100ms (p95)
Throughput: > 1000 req/s
Memory: < 512MB
CPU: < 50% (carga normal)
```

---

## 🧪 ESTRATÉGIA DE TESTES

### Pirâmide de Testes

```
        ┌─────────────┐
        │  E2E Tests  │  ← 10% (poucos, críticos)
        └─────────────┘
       ┌───────────────┐
       │ Integration   │  ← 20% (APIs completas)
       └───────────────┘
      ┌─────────────────┐
      │  Unit Tests     │  ← 70% (funções, helpers)
      └─────────────────┘
```

### Cobertura Mínima
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

### Executar Testes
```bash
npm test                  # Todos
npm run test:unit         # Unitários
npm run test:integration  # Integração
npm run test:coverage     # Com cobertura
```

---

## 🚀 DEPLOY

### Ambientes

#### Development
```bash
NODE_ENV=development
npm run dev
```

#### Testing
```bash
NODE_ENV=test
npm test
```

#### Production
```bash
NODE_ENV=production
npm start
```

### CI/CD Pipeline

```yaml
1. Push/PR → GitHub
2. GitHub Actions:
   - Install dependencies
   - Run tests
   - Check coverage
   - Lint code
3. Deploy → Render/AWS/Azure
4. Health check
5. Notify team
```

---

## 📊 MONITORAMENTO

### Métricas Coletadas
- Request rate
- Response time (p50, p95, p99)
- Error rate
- CPU usage
- Memory usage
- Database connections
- Uptime

### Logs Estruturados
```json
{
  "timestamp": "2024-11-03T10:30:00Z",
  "level": "info",
  "message": "Request processed",
  "meta": {
    "method": "POST",
    "path": "/api/clients",
    "statusCode": 201,
    "responseTime": "45ms",
    "ip": "192.168.1.1"
  }
}
```

---

## 🔮 ROADMAP TÉCNICO

### Fase 2 (Próximos 3 meses)
- [ ] Migração SQLite → PostgreSQL
- [ ] Redis para cache
- [ ] WebSocket para chat real-time
- [ ] Elasticsearch para busca
- [ ] Docker orchestration (K8s)

### Fase 3 (6-12 meses)
- [ ] Microserviços
- [ ] GraphQL API
- [ ] Message queue (RabbitMQ)
- [ ] CDN para assets
- [ ] Multi-tenancy

---

## 👥 EQUIPE & RESPONSABILIDADES

| Papel | Responsável por |
|-------|-----------------|
| **Arquiteto** | Decisões técnicas, estrutura, padrões |
| **Senior Dev** | Code review, refatoração, otimização |
| **QA** | Testes, qualidade, automação |
| **DevOps** | Deploy, CI/CD, infraestrutura |
| **Security** | Vulnerabilidades, compliance, auditoria |

---

## 📚 PADRÕES DE CÓDIGO

### Nomenclatura
```javascript
// Arquivos: kebab-case
response-handler.js

// Classes: PascalCase
class ResponseHandler {}

// Funções: camelCase
function validateInput() {}

// Constantes: SCREAMING_SNAKE_CASE
const JWT_SECRET = '...';
```

### Estrutura de Rota
```javascript
router.method('/', middleware1, middleware2, asyncRoute(async (req, res) => {
  // Validar entrada
  // Processar lógica
  // Retornar resposta padronizada
  return ResponseHandler.success(res, data);
}));
```

---

## 🔗 REFERÊNCIAS

- [Express.js Docs](https://expressjs.com/)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [JWT.io](https://jwt.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Última atualização**: 03/11/2025
**Versão**: 2.0.0
**Mantido por**: Equipe VendaPlano
