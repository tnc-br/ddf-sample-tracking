#!/bin/bash

# Script para verificar configuração do Firebase + GitHub Actions
# Uso: bash check-config.sh

echo "🔍 Verificando Configuração Firebase + GitHub Actions"
echo "=================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Função para verificar se secret existe
check_secret() {
  local secret_name=$1
  echo -n "Verificando $secret_name... "
  # Nota: Não é possível verificar secrets do GitHub via script
  # Este é apenas um checklist visual
  echo -e "${YELLOW}[MANUAL]${NC} - Verifique manualmente no GitHub"
}

# Função para verificar arquivo
check_file() {
  local file=$1
  echo -n "Verificando $file... "
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓ OK${NC}"
    ((SUCCESS++))
    return 0
  else
    echo -e "${RED}✗ NÃO ENCONTRADO${NC}"
    ((ERRORS++))
    return 1
  fi
}

# Função para verificar comando
check_command() {
  local cmd=$1
  echo -n "Verificando $cmd... "
  if command -v $cmd &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
    ((SUCCESS++))
    return 0
  else
    echo -e "${RED}✗ NÃO INSTALADO${NC}"
    ((ERRORS++))
    return 1
  fi
}

echo "📦 1. Verificando Dependências"
echo "----------------------------"
check_command "node"
check_command "npm"
check_command "firebase"
check_command "git"
echo ""

echo "📁 2. Verificando Arquivos do Projeto"
echo "----------------------------"
check_file "sample_tracking/package.json"
check_file "sample_tracking/firebase.json"
check_file "sample_tracking/.firebaserc"
check_file "sample_tracking/next.config.js"
check_file ".github/workflows/firebase-hosting-merge.yml"
check_file ".github/workflows/firebase-hosting-prd-merge.yml"
check_file ".github/workflows/firebase-hosting-pull-request.yml"
echo ""

echo "🔧 3. Verificando Configuração do Firebase"
echo "----------------------------"
cd sample_tracking 2>/dev/null || {
  echo -e "${RED}✗ Diretório sample_tracking não encontrado${NC}"
  ((ERRORS++))
  exit 1
}

# Verificar projetos configurados
echo "Projetos Firebase configurados:"
if [ -f ".firebaserc" ]; then
  cat .firebaserc | grep -A 5 "projects"
  echo ""
else
  echo -e "${RED}✗ .firebaserc não encontrado${NC}"
  ((ERRORS++))
fi

# Verificar firebase.json
echo "Configuração do Hosting:"
if [ -f "firebase.json" ]; then
  echo "✓ firebase.json encontrado"
  echo "  - Public: $(cat firebase.json | grep -o '"public": "[^"]*"' | cut -d'"' -f4)"
  echo ""
else
  echo -e "${RED}✗ firebase.json não encontrado${NC}"
  ((ERRORS++))
fi

cd ..

echo "🔐 4. Secrets do GitHub (Verificação Manual)"
echo "----------------------------"
echo "Por favor, verifique manualmente em:"
echo "https://github.com/tnc-br/ddf-sample-tracking/settings/secrets/actions"
echo ""
echo "Secrets necessários para DEV:"
check_secret "NEXT_PUBLIC_API_KEY"
check_secret "NEXT_PUBLIC_AUTH_DOMAIN"
check_secret "NEXT_PUBLIC_PROJECT_ID"
check_secret "NEXT_PUBLIC_STORAGE_BUCKET"
check_secret "NEXT_PUBLIC_MESSAGING_SENDER_ID"
check_secret "NEXT_PUBLIC_APP_ID"
check_secret "NEXT_PUBLIC_MEASUREMENT_ID"
check_secret "FIREBASE_SERVICE_ACCOUNT_RIVER_SKY_386919"
echo ""

echo "Secrets necessários para PRD:"
check_secret "NEXT_PUBLIC_API_KEY_PROD"
check_secret "NEXT_PUBLIC_AUTH_DOMAIN_PROD"
check_secret "NEXT_PUBLIC_PROJECT_ID_PROD"
check_secret "NEXT_PUBLIC_STORAGE_BUCKET_PROD"
check_secret "NEXT_PUBLIC_MESSAGING_SENDER_ID_PROD"
check_secret "NEXT_PUBLIC_APP_ID_PROD"
check_secret "NEXT_PUBLIC_MEASUREMENT_ID_PROD"
check_secret "FIREBASE_SERVICE_ACCOUNT_TIMBERID_PRD"
echo ""

echo "🧪 5. Teste de Build Local"
echo "----------------------------"
echo "Executando: cd sample_tracking && npm run build"
cd sample_tracking
if npm run build &> /dev/null; then
  echo -e "${GREEN}✓ Build bem-sucedido${NC}"
  ((SUCCESS++))
else
  echo -e "${RED}✗ Build falhou${NC}"
  echo "Execute 'npm run build' manualmente para ver os erros"
  ((ERRORS++))
fi
cd ..
echo ""

echo "=================================================="
echo "📊 Resumo da Verificação"
echo "=================================================="
echo -e "Sucessos: ${GREEN}$SUCCESS${NC}"
echo -e "Erros: ${RED}$ERRORS${NC}"
echo -e "Avisos: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Configuração parece OK!${NC}"
  echo ""
  echo "Próximos passos:"
  echo "1. Verifique os secrets no GitHub (verificação manual)"
  echo "2. Crie uma PR de teste para verificar o preview"
  echo "3. Faça merge para main e verifique deploy em DEV"
  echo "4. Faça merge para prd e verifique deploy em PRD"
else
  echo -e "${RED}❌ Foram encontrados $ERRORS erros${NC}"
  echo "Por favor, corrija os erros acima antes de continuar"
fi

echo ""
echo "📚 Para mais informações, consulte:"
echo "   .github/workflows/GUIA-CONFIGURACAO-COMPLETO.md"
