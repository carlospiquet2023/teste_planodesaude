# 🔒 GUIA DE TESTES DE SEGURANÇA - VENDAPLANO

## 🎯 Objetivo
Este guia fornece testes práticos para validar as implementações de segurança do sistema VendaPlano.

---

## 🧪 TESTES DE VULNERABILIDADES

### 1. SQL INJECTION TESTS

#### Teste 1.1: Login com SQL Injection
```powershell
# Tentativa de bypass de autenticação
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin'' OR 1=1--","password":"any"}'
```
**Resultado Esperado:** ❌ Erro de validação ou credenciais inválidas

#### Teste 1.2: SQL Injection via Query Parameter
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients?status=novo' OR 1=1--" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```
**Resultado Esperado:** ❌ Sanitização remove caracteres perigosos

---

### 2. XSS (CROSS-SITE SCRIPTING) TESTS

#### Teste 2.1: XSS via Nome do Cliente
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"<script>alert(''XSS'')</script>","email":"test@test.com"}'
```
**Resultado Esperado:** ❌ Caracteres escapados ou bloqueados

#### Teste 2.2: XSS via Event Handler
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"<img src=x onerror=alert(1)>","email":"test@test.com"}'
```
**Resultado Esperado:** ❌ Bloqueado pelo middleware de detecção

---

### 3. BRUTE FORCE & RATE LIMITING TESTS

#### Teste 3.1: Múltiplas Tentativas de Login
```powershell
# Execute este comando várias vezes rapidamente
1..10 | ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
      -Method POST `
      -ContentType "application/json" `
      -Body '{"username":"admin","password":"wrong"}'
}
```
**Resultado Esperado:** ⚠️ Após 5 tentativas: "Rate limit excedido"

#### Teste 3.2: Rate Limiting na API
```powershell
1..150 | ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:3000/api/health"
}
```
**Resultado Esperado:** ⚠️ Após 100 requisições: Rate limit

---

### 4. AUTHENTICATION & AUTHORIZATION TESTS

#### Teste 4.1: Acesso Sem Token
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method GET
```
**Resultado Esperado:** ❌ 401 Unauthorized

#### Teste 4.2: Token Inválido
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method GET `
  -Headers @{"Authorization"="Bearer token_invalido_123"}
```
**Resultado Esperado:** ❌ 401 Token inválido

#### Teste 4.3: Token Expirado
```powershell
# Use um token antigo/expirado
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method GET `
  -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```
**Resultado Esperado:** ❌ 401 Token expirado

---

### 5. INPUT VALIDATION TESTS

#### Teste 5.1: Email Inválido
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"João Silva","email":"email_invalido","phone":"11999999999"}'
```
**Resultado Esperado:** ❌ 400 Email inválido

#### Teste 5.2: Telefone com Caracteres Especiais
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"João Silva","email":"joao@test.com","phone":"ABC!@#$%"}'
```
**Resultado Esperado:** ❌ 400 Telefone inválido

#### Teste 5.3: Senha Fraca
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/change-password" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
  -Body '{"currentPassword":"Admin@123Change","newPassword":"123456"}'
```
**Resultado Esperado:** ❌ 400 Senha não atende requisitos

---

### 6. CORS TESTS

#### Teste 6.1: Origem Não Permitida
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" `
  -Headers @{"Origin"="http://malicious-site.com"}
```
**Resultado Esperado:** ❌ CORS bloqueado

---

### 7. HTTP SECURITY HEADERS TESTS

#### Teste 7.1: Verificar Headers de Segurança
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET | 
  Select-Object -ExpandProperty Headers
```

**Headers Esperados:**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Strict-Transport-Security: max-age=31536000`
- ✅ `Content-Security-Policy: default-src 'self'`
- ❌ `X-Powered-By` (NÃO deve existir)

---

### 8. CONTENT SECURITY POLICY TESTS

#### Teste 8.1: Verificar CSP Header
```powershell
(Invoke-WebRequest -Uri "http://localhost:3000/api/health").Headers["Content-Security-Policy"]
```
**Resultado Esperado:** ✅ CSP configurado com políticas restritivas

---

### 9. LOGGING TESTS

#### Teste 9.1: Verificar Logs de Segurança
```powershell
Get-Content "c:\Users\pique\OneDrive\Área de Trabalho\vendas_plano\server\logs\security.log" -Tail 20
```

#### Teste 9.2: Verificar Logs de Erro
```powershell
Get-Content "c:\Users\pique\OneDrive\Área de Trabalho\vendas_plano\server\logs\error.log" -Tail 20
```

#### Teste 9.3: Monitorar Logs em Tempo Real
```powershell
Get-Content "c:\Users\pique\OneDrive\Área de Trabalho\vendas_plano\server\logs\combined.log" -Wait -Tail 10
```

---

### 10. PASSWORD POLICY TESTS

#### Teste 10.1: Senha Sem Maiúsculas
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/change-password" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
  -Body '{"currentPassword":"Admin@123Change","newPassword":"senha123!"}'
```
**Resultado Esperado:** ❌ 400 Senha deve conter maiúsculas

#### Teste 10.2: Senha Sem Números
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/change-password" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
  -Body '{"currentPassword":"Admin@123Change","newPassword":"SenhaForte!"}'
```
**Resultado Esperado:** ❌ 400 Senha deve conter números

#### Teste 10.3: Senha Sem Caracteres Especiais
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/change-password" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
  -Body '{"currentPassword":"Admin@123Change","newPassword":"SenhaForte123"}'
```
**Resultado Esperado:** ❌ 400 Senha deve conter caracteres especiais

---

## 🔍 TESTES AUTOMATIZADOS

### Script de Teste Completo
```powershell
# Salve como: test-security.ps1

Write-Host "🛡️ INICIANDO TESTES DE SEGURANÇA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$passed = 0
$failed = 0

# Teste 1: SQL Injection Protection
Write-Host "`n[TEST 1] SQL Injection Protection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"username":"admin'' OR 1=1--","password":"any"}' `
        -ErrorAction Stop
    Write-Host "❌ FAILED: SQL Injection não bloqueado" -ForegroundColor Red
    $failed++
} catch {
    Write-Host "✅ PASSED: SQL Injection bloqueado" -ForegroundColor Green
    $passed++
}

# Teste 2: XSS Protection
Write-Host "`n[TEST 2] XSS Protection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/clients" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"name":"<script>alert(1)</script>","email":"test@test.com"}' `
        -ErrorAction Stop
    Write-Host "❌ FAILED: XSS não bloqueado" -ForegroundColor Red
    $failed++
} catch {
    Write-Host "✅ PASSED: XSS bloqueado" -ForegroundColor Green
    $passed++
}

# Teste 3: Rate Limiting
Write-Host "`n[TEST 3] Rate Limiting..." -ForegroundColor Yellow
$rateLimitHit = $false
1..10 | ForEach-Object {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"username":"test","password":"test"}' `
            -ErrorAction Stop | Out-Null
    } catch {
        if ($_.Exception.Message -like "*429*") {
            $rateLimitHit = $true
        }
    }
}

if ($rateLimitHit) {
    Write-Host "✅ PASSED: Rate limiting ativo" -ForegroundColor Green
    $passed++
} else {
    Write-Host "❌ FAILED: Rate limiting não funcionou" -ForegroundColor Red
    $failed++
}

# Teste 4: Authentication Required
Write-Host "`n[TEST 4] Authentication Required..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/clients" `
        -Method GET `
        -ErrorAction Stop
    Write-Host "❌ FAILED: Endpoint acessível sem autenticação" -ForegroundColor Red
    $failed++
} catch {
    Write-Host "✅ PASSED: Autenticação obrigatória" -ForegroundColor Green
    $passed++
}

# Teste 5: Security Headers
Write-Host "`n[TEST 5] Security Headers..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET
$headers = $response.Headers

$requiredHeaders = @(
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Strict-Transport-Security"
)

$headersOk = $true
foreach ($header in $requiredHeaders) {
    if (-not $headers.ContainsKey($header)) {
        Write-Host "❌ Missing header: $header" -ForegroundColor Red
        $headersOk = $false
    }
}

if ($headersOk) {
    Write-Host "✅ PASSED: Headers de segurança presentes" -ForegroundColor Green
    $passed++
} else {
    Write-Host "❌ FAILED: Headers de segurança faltando" -ForegroundColor Red
    $failed++
}

# Resultados Finais
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "📊 RESULTADOS DOS TESTES" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Passou: $passed" -ForegroundColor Green
Write-Host "❌ Falhou: $failed" -ForegroundColor Red
Write-Host "📈 Taxa de Sucesso: $([math]::Round(($passed/($passed+$failed))*100, 2))%" -ForegroundColor Cyan
```

### Como Executar
```powershell
# Dar permissão de execução (primeira vez)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Executar testes
.\test-security.ps1
```

---

## 📊 FERRAMENTAS DE TESTE RECOMENDADAS

### 1. OWASP ZAP (Zed Attack Proxy)
```
- Download: https://www.zaproxy.org/
- Uso: Scan automático de vulnerabilidades
- Gratuito e Open Source
```

### 2. Burp Suite Community
```
- Download: https://portswigger.net/burp/communitydownload
- Uso: Interceptação e análise de requisições
- Versão gratuita disponível
```

### 3. Postman
```
- Download: https://www.postman.com/
- Uso: Testes de API e collections
- Gratuito
```

### 4. NPM Audit
```powershell
cd server
npm audit
npm audit fix
```

---

## ✅ CHECKLIST DE SEGURANÇA

Antes de colocar em produção, verifique:

- [ ] Todos os testes passam
- [ ] Logs estão funcionando
- [ ] HTTPS configurado
- [ ] Certificado SSL válido
- [ ] JWT_SECRET alterado
- [ ] Senha admin alterada
- [ ] CORS configurado para domínios específicos
- [ ] Rate limiting testado
- [ ] Backup automático configurado
- [ ] Firewall configurado
- [ ] Dependências atualizadas (npm audit)
- [ ] Testes de penetração realizados

---

## 🚨 RESPOSTA A INCIDENTES

Se detectar uma tentativa de ataque:

1. **Identificar:** Verificar logs de segurança
2. **Conter:** Bloquear IP atacante no firewall
3. **Erradicar:** Corrigir vulnerabilidade explorada
4. **Recuperar:** Restaurar sistema se necessário
5. **Lições:** Documentar e melhorar defesas

---

## 📞 CONTATO

Para reportar vulnerabilidades:
- Email: security@vendaplano.com
- Telefone: +55 11 9999-9999

---

**Última Atualização:** 03 de Novembro de 2025
