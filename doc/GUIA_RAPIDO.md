# 🚀 GUIA RÁPIDO - Dashboard Admin PRO

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Inicializar o Sistema
```bash
cd server
npm install
npm run init-db
npm start
```

✅ Servidor rodando em: **http://localhost:3000**

### 2️⃣ Acessar o Admin
```
URL: http://localhost:3000/admin
Usuário: admin
Senha: admin123
```

### 3️⃣ Pronto! 🎉
Você já tem acesso a:
- 📊 Dashboard com gráficos
- 🔥 Classificação automática de leads
- 📤 Exportação para Excel
- 📈 Análises e relatórios

---

## 🎯 Principais Funcionalidades

### Para GESTORES
1. **Ver Dashboard** → Visão geral do negócio
2. **Exportar Relatório Completo** → Botão no header
3. **Analisar gráficos** → Tendências de 7 dias

### Para VENDEDORES/CORRETORES
1. **Ir em "Leads & Clientes"**
2. **Focar nos 🔥 Quentes** → Topo da lista
3. **Clicar WhatsApp** → Contato direto
4. **Exportar Excel** → Enviar para equipe

### Para MARKETING
1. **Ir em "Análises & Relatórios"**
2. **Ver Top 5 Cidades** → Campanhas regionais
3. **Analisar taxas** → Ajustar estratégias

---

## 🔥 Sistema de Classificação

### Como funciona?
O sistema analisa automaticamente cada lead e atribui uma **temperatura**:

**🔥 QUENTE (70-100 pontos)**
- ✅ Dados completos (nome, tel, email, cidade)
- ✅ Plano de interesse definido
- ✅ Lead recente (menos de 24h)
- **AÇÃO**: Ligar/WhatsApp AGORA!

**🌡️ MORNO (40-69 pontos)**
- ⚠️ Dados parciais
- ⚠️ Algum interesse
- **AÇÃO**: Follow-up em 24-48h

**❄️ FRIO (0-39 pontos)**
- ℹ️ Poucos dados
- ℹ️ Interesse não confirmado
- **AÇÃO**: Nutrição de lead

---

## 📤 Exportar para Excel

### Opção 1: Exportação Simples
**Onde**: Seção "Leads & Clientes"  
**Botão**: "Exportar Excel"  
**Contém**: Lista completa de leads com classificação

### Opção 2: Relatório Completo
**Onde**: Header principal (qualquer tela)  
**Botão**: "Exportar Relatório"  
**Contém**: 
- Sheet 1: Resumo geral
- Sheet 2: Todos os leads
- Sheet 3: Apenas leads quentes (para corretores!)

💡 **Dica**: Use o relatório completo para enviar aos corretores diariamente!

---

## 📊 Entendendo os Números

### Score Médio
- **> 70%** = Excelente! Leads de alta qualidade
- **50-70%** = Bom, mas pode melhorar captação
- **< 50%** = Foco em melhorar qualidade dos leads

### Taxa de Leads Quentes
- **> 30%** = Ótima taxa de conversão
- **15-30%** = Taxa normal
- **< 15%** = Melhorar qualificação no site

---

## ⚙️ Navegação

### Menu Lateral
- 📊 **Dashboard** → Visão geral e gráficos
- 👥 **Leads & Clientes** → Tabela completa com WhatsApp
- 📈 **Análises & Relatórios** → Insights e Top Cidades
- ✏️ **Editar Site** → Gerenciar conteúdo
- 💰 **Gerenciar Planos** → Criar/editar planos
- ⚙️ **Configurações** → Ajustes do sistema

---

## 🔧 Manutenção Diária

### Checklist do Gestor (10min/dia)
- [ ] Acessar dashboard
- [ ] Ver número de leads novos
- [ ] Exportar relatório completo
- [ ] Enviar leads quentes para corretores
- [ ] Verificar gráfico de simulações

### Checklist do Vendedor (contínuo)
- [ ] Verificar leads quentes novos
- [ ] Contatar via WhatsApp
- [ ] Marcar status do contato
- [ ] Follow-up leads mornos do dia anterior

---

## 🆘 Problemas Comuns

### "Não consigo fazer login"
✅ Verifique se o servidor está rodando (`npm start`)  
✅ Use: `admin` / `admin123`  
✅ Limpe o cache do navegador

### "Não vejo dados"
✅ Execute `npm run init-db` novamente  
✅ Aguarde leads entrarem pelo site  
✅ Clique em "Atualizar"

### "Gráficos não aparecem"
✅ Verifique a conexão com internet (Chart.js é CDN)  
✅ Atualize a página (F5)  
✅ Teste em outro navegador

### "Excel não baixa"
✅ Verifique se há leads para exportar  
✅ Permita downloads no navegador  
✅ Teste com "Exportar Excel" simples primeiro

---

## 💡 Dicas PRO

### Para Maximizar Vendas
1. **Priorize leads quentes** → Maior taxa de conversão
2. **Follow-up mornos em 24h** → Não deixe esfriar
3. **Contato via WhatsApp** → Melhor canal de conversão
4. **Use o nome do lead** → Personalização aumenta conversão

### Para Melhorar Captação
1. **Analise Top Cidades** → Invista em Google Ads nessas regiões
2. **Veja horários de pico** → Nos gráficos de 7 dias
3. **Taxa de leads quentes baixa?** → Melhore formulário do site

### Para Reportar ao Gestor
1. **Exporte relatório completo** → Envie diariamente
2. **Screenshot dos gráficos** → Visual facilita decisões
3. **Destaque números importantes** → Total, quentes, conversão

---

## 📱 WhatsApp Integration

### Como funciona?
Ao clicar no botão WhatsApp na tabela:
```
Abre: https://wa.me/55[TELEFONE]
Mensagem pré-pronta: "Olá [NOME], vi que você se interessou por nossos planos!"
```

💡 **Dica**: Personalize a mensagem conforme o plano de interesse do lead!

---

## 🔒 Segurança

### Produção
Antes de colocar em produção:
1. **Mude a senha padrão** → No banco de dados
2. **Configure HTTPS** → Certificado SSL
3. **Ative backups** → Banco de dados diário
4. **Limite acessos** → IP whitelist se possível

### Senhas Fortes
```
❌ Ruim: admin123
✅ Bom: V3nd@Plan0#2024!
```

---

## 📞 Contatos Rápidos

### URLs do Sistema
- **Site Principal**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Admin CMS**: http://localhost:3000/admin/cms
- **Admin Simples**: http://localhost:3000/admin/simple

### Comandos Úteis
```bash
# Iniciar servidor
npm start

# Reiniciar banco
npm run init-db

# Instalar dependências
npm install
```

---

## ✅ Status de Produção

**Sistema**: ✅ PRONTO PARA USO  
**Segurança**: ✅ JWT + Bcrypt  
**Performance**: ✅ Otimizado  
**Responsivo**: ✅ Mobile-friendly  
**Excel Export**: ✅ Funcionando  
**Gráficos**: ✅ Chart.js integrado  
**Classificação**: ✅ Algoritmo inteligente  

---

## 🎯 Próximos Passos

### Agora você pode:
1. ✅ Gerenciar leads profissionalmente
2. ✅ Classificar automaticamente por temperatura
3. ✅ Exportar relatórios para Excel
4. ✅ Visualizar tendências em gráficos
5. ✅ Contatar leads via WhatsApp
6. ✅ Tomar decisões baseadas em dados

---

**🚀 Boas vendas!**

Sistema desenvolvido para **uso real em produção**.  
Questões? Consulte a documentação completa em `doc/DASHBOARD_PRO.md`
