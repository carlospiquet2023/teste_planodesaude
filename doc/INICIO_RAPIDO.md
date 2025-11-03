# ⚡ Guia Rápido de Início - VendaPlano

## 🚀 Primeiros Passos (5 minutos)

### 1️⃣ Instalação

```bash
# Clone o projeto
cd vendas_plano/server

# Instale as dependências
npm install

# Inicialize o banco de dados
npm run init-db

# Inicie o servidor
npm start
```

### 2️⃣ Acesse o Sistema

- **Site Principal**: <http://localhost:3000>
- **Painel Admin**: <http://localhost:3000/admin>

### 3️⃣ Login Admin

```
Usuário: admin
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## 📊 Funcionalidades Principais

### Para Usuários

1. **Simulador de Preços** - Calcule valores personalizados
2. **Chat IARA** - Assistente virtual inteligente
3. **Formulário de Contato** - Solicite orçamentos

### Para Administradores

1. **Dashboard** - Visão geral com estatísticas
2. **Gestão de Leads** - Classificação automática (🔥/🌡️/❄️)
3. **Exportação Excel** - Relatórios completos
4. **Editor de Conteúdo** - Atualize o site sem código
5. **Gestão de Preços** - CRUD completo de planos

---

## 🎯 Classificação de Leads

O sistema classifica automaticamente os leads:

| Temperatura | Score | Critérios |
|-------------|-------|-----------|
| 🔥 **Quente** | ≥ 4 pontos | Alta chance de conversão |
| 🌡️ **Morno** | 2-3 pontos | Necessita acompanhamento |
| ❄️ **Frio** | < 2 pontos | Baixa prioridade |

**Pontuação:**
- Idade 25-55 anos: +2
- Possui dependentes: +2
- Telefone fornecido: +1
- Email fornecido: +1

---

## 📈 Exportar Relatórios

### Exportar Leads

1. Acesse: **Leads & Clientes**
2. Clique em: **Exportar para Excel**
3. Arquivo baixado: `leads_vendaplano_YYYY-MM-DD.xlsx`

### Exportar Relatório Completo

1. Acesse: **Relatórios & Analytics**
2. Clique em: **Exportar Relatório Completo**
3. Contém 3 abas:
   - **Leads** - Todos os leads com classificação
   - **Simulações** - Histórico completo
   - **Resumo** - Métricas consolidadas

---

## ✏️ Editar Conteúdo do Site

1. Acesse: **Editar Site**
2. Selecione a seção desejada
3. Edite os textos nos campos
4. Clique em **Salvar**
5. Atualize o site principal para ver as mudanças

**Seções Editáveis:**
- 🏠 Seção Principal (Hero)
- ✨ Benefícios
- ⚙️ Como Funciona
- 💬 Depoimentos
- ❓ FAQ
- 📄 Rodapé

---

## 💰 Gerenciar Planos

### Adicionar Novo Plano

1. Acesse: **Preços & Planos**
2. Clique em: **Adicionar Novo Plano**
3. Preencha:
   - Nome do plano
   - Preço (ex: R$ 199/mês)
   - Descrição
   - Características (separadas por vírgula)
4. Confirme

### Editar Plano

1. Localize o plano
2. Clique em **Editar**
3. Modifique os campos
4. Salve as alterações

### Excluir Plano

1. Localize o plano
2. Clique em **Excluir**
3. Confirme a ação

---

## 🔧 Comandos Úteis

```bash
# Iniciar servidor em desenvolvimento (com hot-reload)
npm run dev

# Iniciar servidor em produção
npm start

# Reinicializar banco de dados (apaga todos os dados!)
npm run init-db

# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm update
```

---

## 🐛 Problemas Comuns

### "Cannot find module"

```bash
npm install
```

### "Port 3000 already in use"

Mude no arquivo `.env`:

```env
PORT=3001
```

### Esqueci a senha do admin

```bash
# Reinicialize o banco (perde todos os dados!)
npm run init-db
```

### Banco não inicializa

```bash
# Delete o banco antigo
rm database/vendas.db

# Recrie
npm run init-db
```

---

## 📚 Documentação Completa

- **README.md** - Documentação principal
- **doc/GUIA_DEPLOY.md** - Deploy em produção
- **doc/DASHBOARD_PRO.md** - Recursos do dashboard
- **doc/GUIA_BACKEND.md** - Documentação da API

---

## 🆘 Suporte

- 📧 Email: suporte@vendaplano.com.br
- 💬 Chat: Disponível no site
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/vendas_plano/issues)

---

## ✅ Checklist de Primeira Configuração

- [ ] Banco de dados inicializado
- [ ] Servidor rodando em localhost:3000
- [ ] Login admin testado e funcionando
- [ ] Senha do admin alterada
- [ ] Conteúdo do site revisado e personalizado
- [ ] Planos de saúde cadastrados corretamente
- [ ] Teste de envio de formulário realizado
- [ ] Chat IARA testado e respondendo
- [ ] Simulador calculando valores corretamente
- [ ] Exportação Excel funcionando

---

**Pronto! Seu sistema está configurado e funcionando! 🎉**

Acesse <http://localhost:3000> e comece a usar!
