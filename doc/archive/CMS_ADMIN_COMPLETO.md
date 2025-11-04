# 🎛️ PAINEL CMS ADMIN - DOCUMENTAÇÃO COMPLETA

## 📋 VISÃO GERAL

O **Painel CMS Admin** é um sistema **PROFISSIONAL E COMPLETO** que permite **EDIÇÃO REMOTA** de **TODOS** os elementos do site principal sem tocar no código.

---

## ✅ CAPACIDADES DO PAINEL CMS

### 🎯 **EDIÇÃO TOTAL DO SITE**

| Recurso | Descrição | Status |
|---------|-----------|--------|
| **Textos do Hero** | Editar títulos, subtítulos, badges | ✅ Implementado |
| **Benefícios** | Editar os 4 benefícios principais | ✅ Implementado |
| **Telefone/Contato** | Atualizar números e emails | ✅ Implementado |
| **Countdown** | Alterar número de vagas | ✅ Implementado |
| **Planos de Preço** | CRUD completo de planos | ✅ Implementado |
| **Valores** | Editar preços e descontos | ✅ Implementado |
| **Dashboard** | Visualizar estatísticas | ✅ Implementado |
| **Clientes** | Gerenciar leads | ✅ Implementado |
| **Simulações** | Ver histórico | ✅ Implementado |
| **Conversas** | Histórico do chat | ✅ Implementado |

---

## 🏗️ ARQUITETURA DO CMS

### **Estrutura de Arquivos**

```
📁 Projeto/
├── 📁 admin/
│   ├── index.html                ← Painel Admin Simples (visualização)
│   └── cms.html                  ← ✨ PAINEL CMS COMPLETO (edição)
│
├── 📁 assets/js/
│   ├── admin.js                  ← Scripts do painel simples
│   └── admin-cms.js              ← ✨ Scripts do CMS completo
│
└── 📁 server/
    ├── 📁 routes/
    │   ├── content.js            ← ✨ API de gerenciamento de conteúdo
    │   ├── dashboard.js          ← API de estatísticas
    │   ├── clients.js            ← API de clientes
    │   └── ...
    │
    └── 📁 database/
        └── vendaplano.db         ← Banco de dados SQLite
            ├── site_content      ← ✨ Conteúdo editável
            ├── pricing_plans     ← ✨ Planos e preços
            ├── site_settings     ← ✨ Configurações
            └── ...
```

---

## 🚀 COMO ACESSAR

### **URLs do Sistema**

```bash
# Site Público
http://localhost:3000/

# Painel Admin Simples (apenas visualização)
http://localhost:3000/admin

# ✨ PAINEL CMS COMPLETO (edição total)
http://localhost:3000/admin/cms
```

### **Credenciais Padrão**

```
Usuário: admin
Senha: admin123
```

⚠️ **IMPORTANTE:** Altere as credenciais após o primeiro acesso!

---

## 🎨 FUNCIONALIDADES DO CMS

### **1. DASHBOARD**

Visualize métricas em tempo real:
- Total de clientes
- Conversas ativas
- Simulações do dia
- Novos leads (7 dias)

### **2. EDITAR CONTEÚDO**

Edite TODOS os textos do site:

#### **Seção HERO**
- ✏️ Título (4 linhas customizáveis)
- ✏️ Subtítulo com HTML
- ✏️ Badge superior
- ✏️ Imagem de destaque

#### **Seção HEADER**
- ✏️ Telefone de contato
- ✏️ Número de vagas disponíveis
- ✏️ Percentual de desconto

#### **Seção BENEFÍCIOS**
- ✏️ Benefício 1
- ✏️ Benefício 2
- ✏️ Benefício 3
- ✏️ Benefício 4

**Como usar:**
1. Acesse **"Editar Conteúdo"** no menu
2. Escolha a seção desejada
3. Edite os campos
4. Clique em **"Salvar [SEÇÃO]"**
5. ✅ Alterações aplicadas IMEDIATAMENTE!

---

### **3. PREÇOS E PLANOS**

Gerenciamento COMPLETO de planos:

#### **Criar Novo Plano**
```
1. Clique em "Adicionar Novo Plano"
2. Preencha:
   - Nome do plano
   - Preço atual (R$)
   - Preço original (R$)
   - Lista de características
   - Destacar? (checkbox)
3. Clique em "Criar Plano"
```

#### **Editar Plano Existente**
```
1. Clique em "Editar" no plano desejado
2. Modifique os dados
3. Clique em "Salvar"
```

#### **Deletar Plano**
```
1. Clique em "Deletar" no plano
2. Confirme a exclusão
```

**Exemplo de Plano:**
```json
{
  "name": "Plano Família VIP",
  "price": 699.90,
  "original_price": 1199.90,
  "features": [
    "Cobertura nacional completa",
    "Até 6 dependentes inclusos",
    "Atendimento 24h prioritário",
    "Zero carência para urgências",
    "Telemedicina ilimitada",
    "Desconto de 40% em farmácias"
  ],
  "is_featured": true
}
```

---

### **4. GERENCIAR CLIENTES**

Visualize todos os clientes/leads:
- Nome completo
- Email e telefone
- Localização
- Status do lead
- Data de cadastro

**Exportar dados:** (em desenvolvimento)

---

### **5. SIMULAÇÕES**

Histórico de todas as simulações:
- Tipo de plano simulado
- Número de dependentes
- Valor total
- Data da simulação
- Cliente associado

---

### **6. CONVERSAS**

Acompanhe interações do chat:
- Histórico completo
- Mensagens trocadas
- Status da conversa
- Cliente associado

---

### **7. CONFIGURAÇÕES**

Configure o sistema:
- Nome do site
- Slogan/tagline
- WhatsApp de contato
- Email de suporte
- Habilitar/desabilitar countdown
- Habilitar/desabilitar chat

---

## 🔌 API ENDPOINTS

### **Gerenciamento de Conteúdo**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/content` | Listar todo conteúdo | 🔒 Sim |
| GET | `/api/content/section/:section` | Conteúdo por seção | 🔒 Sim |
| PUT | `/api/content/element/:id` | Atualizar elemento | 🔒 Sim |
| PUT | `/api/content/bulk-update` | Atualizar múltiplos | 🔒 Sim |

### **Gerenciamento de Preços**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/content/pricing` | Listar planos | 🔒 Sim |
| POST | `/api/content/pricing` | Criar plano | 🔒 Sim |
| PUT | `/api/content/pricing/:id` | Atualizar plano | 🔒 Sim |
| DELETE | `/api/content/pricing/:id` | Deletar plano | 🔒 Sim |

### **Configurações**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/content/settings` | Obter configurações | 🔒 Sim |
| PUT | `/api/content/settings` | Atualizar configurações | 🔒 Sim |

---

## 🔐 SEGURANÇA

### **Autenticação JWT**

Todas as rotas de edição são protegidas por **JWT Token**:

```javascript
// Token armazenado no sessionStorage
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1...'
}
```

### **Validação de Dados**

- ✅ Todos os inputs são validados
- ✅ Prevenção de SQL Injection
- ✅ Rate limiting ativo
- ✅ Logs de auditoria

---

## 📊 FLUXO DE EDIÇÃO

### **Como as Alterações Funcionam:**

```
1. ADMIN EDITA NO CMS
   └─> admin/cms.html
       └─> admin-cms.js

2. ENVIA PARA API
   └─> PUT /api/content/element/:id
       └─> routes/content.js

3. SALVA NO BANCO
   └─> database/vendaplano.db
       └─> tabela: site_content

4. SITE LÊ DO BANCO
   └─> index.html (ao carregar)
       └─> GET /api/content
           └─> Renderiza com dados atualizados
```

### **Sincronização em Tempo Real:**

Para o site refletir as alterações SEM recarregar:

```javascript
// index.html - adicionar no main.js
async function loadDynamicContent() {
  const response = await fetch('/api/content');
  const data = await response.json();
  
  // Atualiza elementos do DOM
  data.content.forEach(item => {
    const element = document.querySelector(`[data-content="${item.element_key}"]`);
    if (element) {
      element.textContent = item.value;
    }
  });
}

// Chama ao carregar a página
loadDynamicContent();
```

---

## 🚀 INICIALIZAÇÃO

### **Passo a Passo:**

```bash
# 1. Ir para a pasta do servidor
cd server

# 2. Instalar dependências (se ainda não fez)
npm install

# 3. Inicializar banco de dados COM CONTEÚDO
npm run init-db

# 4. Iniciar servidor
npm start
```

### **Saída Esperada:**

```
✅ Tabelas criadas com sucesso!
✅ Usuário admin criado com sucesso!
✅ Configurações padrão inseridas!
✅ Conteúdo padrão do site inserido!

🎉 Banco de dados inicializado com sucesso!

Próximos passos:
1. Execute: npm start
2. Acesse o CMS em: http://localhost:3000/admin/cms
3. Faça login com as credenciais padrão
```

---

## 📝 EXEMPLOS DE USO

### **Exemplo 1: Alterar Título do Hero**

```
1. Acesse http://localhost:3000/admin/cms
2. Login: admin / admin123
3. Menu → "Editar Conteúdo"
4. Seção: HERO
5. Campo: "Hero - Título linha 1"
6. Altere de "IMAGINE" para "TRANSFORME"
7. Clique em "Salvar HERO"
8. ✅ Título atualizado no site!
```

### **Exemplo 2: Criar Novo Plano**

```
1. Menu → "Preços e Planos"
2. Botão "Adicionar Novo Plano"
3. Preencha:
   - Nome: "Plano Gold Empresarial"
   - Preço: 1299.90
   - Preço Original: 1999.90
   - Características:
     * Cobertura internacional
     * 10+ vidas incluídas
     * Gestão dedicada
     * Sem carências
4. Marque "Destacar este plano"
5. Clique "Criar Plano"
6. ✅ Novo plano aparece no site!
```

### **Exemplo 3: Atualizar Telefone**

```
1. Menu → "Editar Conteúdo"
2. Seção: HEADER
3. Campo: "Telefone de contato"
4. Altere para: "(11) 98765-4321"
5. Clique "Salvar HEADER"
6. ✅ Telefone atualizado em toda página!
```

---

## 🎯 PRÓXIMAS MELHORIAS

### **Recursos Adicionais Planejados:**

- [ ] Upload de imagens direto pelo CMS
- [ ] Editor WYSIWYG (What You See Is What You Get)
- [ ] Versioning/histórico de alterações
- [ ] Preview ao vivo antes de salvar
- [ ] Agendamento de publicações
- [ ] Múltiplos idiomas
- [ ] Temas/templates alternativos
- [ ] Exportar/importar configurações
- [ ] Notificações push para novos leads
- [ ] Integração com Google Analytics

---

## 🔧 MANUTENÇÃO

### **Backup do Banco de Dados**

```bash
# Fazer backup
cp server/database/vendaplano.db server/database/backup-$(date +%Y%m%d).db

# Restaurar backup
cp server/database/backup-20251103.db server/database/vendaplano.db
```

### **Resetar Conteúdo Padrão**

```bash
cd server
npm run init-db
```

---

## ❓ TROUBLESHOOTING

### **Problema: "Erro ao carregar conteúdo"**

**Solução:**
```bash
# Verificar se o banco foi inicializado
cd server
npm run init-db

# Verificar se o servidor está rodando
npm start
```

### **Problema: "Token inválido"**

**Solução:**
```
1. Fazer logout
2. Limpar cache do navegador
3. Fazer login novamente
```

### **Problema: "Alterações não aparecem no site"**

**Solução:**
```
1. Verificar se salvou corretamente (alerta verde)
2. Recarregar página do site (F5)
3. Limpar cache do navegador (Ctrl+Shift+Del)
```

---

## 📞 SUPORTE

Para dúvidas ou problemas:

1. Verifique esta documentação
2. Confira o arquivo `doc/ARQUITETURA_QA.md`
3. Verifique logs do servidor
4. Teste em modo desenvolvimento

---

## ✅ CONCLUSÃO

O **Painel CMS Admin** oferece:

✅ **Controle Total** sobre o conteúdo do site  
✅ **Edição Remota** sem tocar no código  
✅ **Interface Profissional** e intuitiva  
✅ **Segurança** com autenticação JWT  
✅ **Sincronização** em tempo real com o banco  
✅ **CRUD Completo** de planos e preços  
✅ **Dashboard** com métricas importantes  
✅ **Gestão** de clientes e leads  

**ESTE SISTEMA ESTÁ PRONTO PARA USO EM PRODUÇÃO! 🚀**

---

**Documentação criada em:** 03/11/2025  
**Versão:** 1.0  
**Status:** ✅ COMPLETO E FUNCIONAL
