# 🎯 SISTEMA DE EDIÇÃO DINÂMICA - ADMIN ↔ SITE

## 📋 Como Funciona

Este sistema permite que o **Painel Admin** edite cada bloco do site de forma remota, e as alterações aparecem **automaticamente** no site principal.

---

## 🏗️ Arquitetura

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  PAINEL ADMIN   │ ──────► │   BACKEND    │ ◄────── │  SITE PRINCIPAL │
│                 │  SALVA  │  (API REST)  │  CARREGA│                 │
│  admin-pro.js   │         │  SQLite DB   │         │ content-loader  │
└─────────────────┘         └──────────────┘         └─────────────────┘
```

---

## 📊 Tabelas do Banco de Dados

### 1. `site_content` - Conteúdo Editável
Armazena todo o conteúdo editável do site (textos, títulos, etc.)

```sql
CREATE TABLE site_content (
  id INTEGER PRIMARY KEY,
  section TEXT,          -- hero, header, benefits, etc
  element_key TEXT,      -- hero_title_line1, benefit_1, etc
  element_type TEXT,     -- text, html, number
  value TEXT,            -- valor atual
  description TEXT       -- descrição do campo
)
```

### 2. `site_settings` - Configurações Gerais
```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE,       -- company_name, phone, email, etc
  value TEXT             -- valor da configuração
)
```

### 3. `pricing_plans` - Planos de Preços
```sql
CREATE TABLE pricing_plans (
  id INTEGER PRIMARY KEY,
  name TEXT,             -- Nome do plano
  price REAL,            -- Preço atual
  original_price REAL,   -- Preço original (para mostrar desconto)
  features TEXT,         -- JSON com lista de recursos
  is_featured INTEGER,   -- 1 = plano em destaque
  display_order INTEGER  -- ordem de exibição
)
```

---

## 🔌 Rotas da API

### Rotas Públicas (sem autenticação)
```
GET  /api/content/public    → Conteúdo do site
GET  /api/settings/public   → Configurações
GET  /api/pricing/public    → Planos de preços
```

### Rotas Admin (com autenticação)
```
GET  /api/content           → Listar todo conteúdo
PUT  /api/content/element/:id → Atualizar item

GET  /api/settings          → Listar configurações
PUT  /api/settings/:key     → Atualizar configuração
POST /api/settings/bulk     → Atualizar múltiplas

GET  /api/pricing           → Listar planos
PUT  /api/pricing/:id       → Atualizar plano
```

---

## 🎨 No Site Principal (index.html)

### Atributos Data para Conteúdo Dinâmico

**Elementos com `data-content`** são preenchidos pela tabela `site_content`:
```html
<span data-content="hero_title_line1">IMAGINE</span>
<span data-content="hero_title_line2">Sua Família</span>
<span data-content="benefit_1">✅ Aprovação em 24h</span>
```

**Elementos com `data-setting`** são preenchidos pela tabela `site_settings`:
```html
<span data-setting="phone">(11) 9999-9999</span>
<a data-setting="whatsapp" href="#">WhatsApp</a>
<span data-setting="email">contato@site.com</span>
```

### Script content-loader.js

Carrega automaticamente ao abrir a página:
```javascript
// 1. Busca dados do backend
fetch('/api/content/public')
fetch('/api/settings/public')
fetch('/api/pricing/public')

// 2. Aplica nos elementos com data-*
applyContentToPage(content)
applySettingsToPage(settings)
applyPlansToPage(plans)
```

---

## 🎛️ No Painel Admin

### Páginas de Edição

#### 1. **Editor de Conteúdo** (`/admin#content`)
- Edita todos os textos do site organizados por seção
- Campos carregados diretamente do banco
- Botão "Salvar" atualiza no site instantaneamente

#### 2. **Editor de Planos** (`/admin#pricing`)
- Edita nome, preço, recursos de cada plano
- Define qual plano é "destaque"
- Controla ordem de exibição

#### 3. **Configurações** (`/admin#settings`)
- Informações da empresa (nome, CNPJ, razão social)
- Contatos (email, telefone, WhatsApp)
- Endereço completo
- Configurações do sistema (modo manutenção, chat online)
- Redes sociais

---

## 🔄 Fluxo de Edição

### Passo a Passo de Como Funciona:

1. **Admin abre** `http://localhost:3000/admin`
2. **Faz login** com credenciais
3. **Navega** para "Editor de Conteúdo"
4. **Campos são carregados** automaticamente do banco
5. **Admin edita** um texto (ex: título do hero)
6. **Clica em "Salvar"**
7. **JavaScript envia** PUT para `/api/content/element/{id}`
8. **Backend atualiza** na tabela `site_content`
9. **Retorna sucesso**
10. **Usuário abre** `http://localhost:3000` (site)
11. **content-loader.js executa** automaticamente
12. **Busca dados** de `/api/content/public`
13. **Atualiza elementos** com novos valores
14. **Site mostra** conteúdo atualizado! ✅

---

## 💡 Exemplos de Uso

### Editar Título Principal
```javascript
// No Admin
document.querySelector('#content_1').value = "NOVO TÍTULO INCRÍVEL";
// Salvar → Backend atualiza DB → Site carrega automaticamente
```

### Editar Telefone
```javascript
// No Admin - Configurações
document.querySelector('#settings_phone').value = "(21) 98888-8888";
// Salvar → Aparece em todos os lugares do site com data-setting="phone"
```

### Editar Preço de Plano
```javascript
// No Admin - Planos
document.querySelector('#price_1').value = "199.90";
// Salvar → Plano atualizado na página de preços
```

---

## 🚀 Iniciar o Sistema

```bash
cd server
npm install
npm start
```

Acessar:
- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

**Login padrão:**
- Usuário: `admin`
- Senha: `admin123`

---

## ✅ Status de Implementação

- ✅ Tabelas do banco criadas
- ✅ Rotas públicas funcionando
- ✅ Rotas admin com autenticação
- ✅ content-loader.js carregando dados
- ✅ Atributos data-* adicionados no HTML
- ✅ Editor do admin salvando no banco
- ✅ Sistema totalmente integrado

---

## 🎯 Próximos Recursos

- [ ] Preview em tempo real no admin
- [ ] Upload de imagens
- [ ] Editor visual (arrastar e soltar)
- [ ] Histórico de alterações
- [ ] Multi-idioma

---

**Sistema criado com ❤️ - 100% funcional e integrado!**
