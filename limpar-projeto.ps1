# ============================================
# 🧹 SCRIPT DE LIMPEZA AUTOMATIZADA
# ============================================
# Descrição: Remove arquivos obsoletos e duplicados
# Uso: .\limpar-projeto.ps1
# Autor: GitHub Copilot
# Data: 4 de novembro de 2025
# ============================================

# Configurar cores para melhor visualização
$host.UI.RawUI.ForegroundColor = "White"

# Obter caminho base do projeto
$basePath = $PSScriptRoot

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  🧹 LIMPEZA AUTOMATIZADA DO PROJETO" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

# Confirmar antes de executar
Write-Host "⚠️  Este script irá:" -ForegroundColor Yellow
Write-Host "   • Arquivar 19 arquivos de documentação obsoletos" -ForegroundColor White
Write-Host "   • Deletar 1 arquivo de código obsoleto (start-server.js)" -ForegroundColor White
Write-Host "   • Limpar todos os logs em server/logs/" -ForegroundColor White
Write-Host "`n📍 Pasta do projeto: $basePath`n" -ForegroundColor Cyan

$confirmacao = Read-Host "Deseja continuar? (S/N)"
if ($confirmacao -ne 'S' -and $confirmacao -ne 's') {
    Write-Host "`n❌ Operação cancelada pelo usuário.`n" -ForegroundColor Red
    exit
}

Write-Host "`n🚀 Iniciando limpeza...`n" -ForegroundColor Green

# ============================================
# ETAPA 1: Criar pasta de arquivo
# ============================================
Write-Host "📁 ETAPA 1/5: Criando pasta archive..." -ForegroundColor Cyan
$archivePath = Join-Path $basePath "doc\archive"
if (-not (Test-Path $archivePath)) {
    New-Item -ItemType Directory -Path $archivePath -Force | Out-Null
    Write-Host "   ✓ Pasta criada: doc\archive\" -ForegroundColor Green
} else {
    Write-Host "   ℹ Pasta já existe: doc\archive\" -ForegroundColor Yellow
}

# ============================================
# ETAPA 2: Arquivar documentação obsoleta
# ============================================
Write-Host "`n📦 ETAPA 2/5: Arquivando documentação obsoleta..." -ForegroundColor Cyan

$arquivosParaArquivar = @(
    "INICIO_RAPIDO_OLD.md",
    "README_OLD.md",
    "DEPLOY_GUIDE.md",
    "DEPLOY_PRODUCAO.md",
    "GUIA_DEPLOY.md",
    "DEPLOY_RENDER_FIX.md",
    "GUIA_DEFINITIVO_RENDER.md",
    "SOLUCAO_EMERGENCIAL_RENDER.md",
    "SOLUCAO_RAPIDA.md",
    "RELATORIO_QA.md",
    "QA_FINAL_REPORT.md",
    "ARQUITETURA_QA.md",
    "CORRECAO_LOGIN_ADMIN.md",
    "CORRECAO_SQLITE.md",
    "CORRECOES_APLICADAS.md",
    "MIGRACAO_CONCLUIDA.md",
    "CMS_ADMIN_COMPLETO.md",
    "PAINEL_ADMIN_COMPLETO.md",
    "DASHBOARD_PRO.md"
)

$arquivadosCount = 0
foreach ($file in $arquivosParaArquivar) {
    $source = Join-Path $basePath "doc\$file"
    if (Test-Path $source) {
        try {
            Move-Item $source $archivePath -Force
            Write-Host "   ✓ $file" -ForegroundColor Green
            $arquivadosCount++
        } catch {
            Write-Host "   ✗ Erro ao arquivar: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⊘ Não encontrado: $file" -ForegroundColor Gray
    }
}

Write-Host "`n   📊 Total arquivado: $arquivadosCount arquivos" -ForegroundColor Yellow

# ============================================
# ETAPA 3: Deletar código obsoleto
# ============================================
Write-Host "`n🗑️  ETAPA 3/5: Removendo código obsoleto..." -ForegroundColor Cyan

$arquivosParaDeletar = @(
    "server\start-server.js"
)

$deletadosCount = 0
foreach ($file in $arquivosParaDeletar) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "   ✓ $(Split-Path $file -Leaf) deletado" -ForegroundColor Green
            $deletadosCount++
        } catch {
            Write-Host "   ✗ Erro ao deletar: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⊘ Não encontrado: $file" -ForegroundColor Gray
    }
}

Write-Host "`n   📊 Total deletado: $deletadosCount arquivos" -ForegroundColor Yellow

# ============================================
# ETAPA 4: Limpar logs
# ============================================
Write-Host "`n🧽 ETAPA 4/5: Limpando logs..." -ForegroundColor Cyan

$logsPath = Join-Path $basePath "server\logs"
if (Test-Path $logsPath) {
    $logFiles = Get-ChildItem "$logsPath\*.log"
    $limpezaCount = 0
    
    foreach ($log in $logFiles) {
        try {
            Clear-Content $log.FullName
            $tamanho = (Get-Item $log.FullName).Length
            Write-Host "   ✓ $($log.Name) limpo (0 bytes)" -ForegroundColor Green
            $limpezaCount++
        } catch {
            Write-Host "   ✗ Erro ao limpar: $($log.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n   📊 Total de logs limpos: $limpezaCount arquivos" -ForegroundColor Yellow
} else {
    Write-Host "   ⊘ Pasta de logs não encontrada" -ForegroundColor Gray
}

# ============================================
# ETAPA 5: Atualizar .gitignore
# ============================================
Write-Host "`n📝 ETAPA 5/5: Atualizando .gitignore..." -ForegroundColor Cyan

$gitignorePath = Join-Path $basePath "server\.gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    
    # Verificar se já contém as regras de logs
    if (-not ($gitignoreContent -match "logs/\*\.log")) {
        $novasRegras = @"

# ============================================
# Logs (adicionado automaticamente)
# ============================================
logs/*.log
!logs/.gitkeep

# ============================================
# Database
# ============================================
database/*.db
database/*.db-shm
database/*.db-wal
!database/.gitkeep

# ============================================
# Cache
# ============================================
node_modules/.cache
.cache

"@
        Add-Content $gitignorePath $novasRegras
        Write-Host "   ✓ .gitignore atualizado com novas regras" -ForegroundColor Green
    } else {
        Write-Host "   ℹ .gitignore já contém as regras necessárias" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⊘ .gitignore não encontrado" -ForegroundColor Gray
}

# ============================================
# RELATÓRIO FINAL
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  ✅ LIMPEZA CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📊 RESUMO DA OPERAÇÃO:" -ForegroundColor Yellow
Write-Host "   • Arquivos arquivados:  $arquivadosCount" -ForegroundColor White
Write-Host "   • Arquivos deletados:   $deletadosCount" -ForegroundColor White
Write-Host "   • Logs limpos:          $limpezaCount" -ForegroundColor White
Write-Host "   • .gitignore:           Atualizado" -ForegroundColor White

Write-Host "`n📁 LOCALIZAÇÃO DOS ARQUIVOS:" -ForegroundColor Yellow
Write-Host "   • Arquivados em: $archivePath" -ForegroundColor Cyan
Write-Host "   • Documentação atual: $basePath\doc" -ForegroundColor Cyan

Write-Host "`n🎯 PRÓXIMOS PASSOS RECOMENDADOS:" -ForegroundColor Yellow
Write-Host "   1. Revisar arquivos em doc\archive\" -ForegroundColor White
Write-Host "   2. Testar o servidor: cd server && npm start" -ForegroundColor White
Write-Host "   3. Fazer commit: git add . && git commit -m 'chore: limpeza de arquivos obsoletos'" -ForegroundColor White
Write-Host "   4. Push para GitHub: git push" -ForegroundColor White

Write-Host "`n💡 DICA:" -ForegroundColor Yellow
Write-Host "   Você pode deletar permanentemente doc\archive\ após validar" -ForegroundColor White
Write-Host "   que não precisa mais dos arquivos arquivados.`n" -ForegroundColor White

# Perguntar se deseja abrir a pasta de documentação
$abrirDoc = Read-Host "Deseja abrir a pasta doc/ para revisar? (S/N)"
if ($abrirDoc -eq 'S' -or $abrirDoc -eq 's') {
    Start-Process explorer.exe (Join-Path $basePath "doc")
}

Write-Host "`n✨ Script finalizado com sucesso!`n" -ForegroundColor Green
