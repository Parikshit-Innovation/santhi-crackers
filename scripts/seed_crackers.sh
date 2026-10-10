#!/usr/bin/env bash

# ==============================================================================
# Santhi Crackers - 100 Products & 10 Categories Database Seeder
# ==============================================================================
# Sends curl POST requests to:
#   - http://localhost:3007/api/categories (10 categories)
#   - http://localhost:3007/api/product (100 Sivakasi cracker products)
# ==============================================================================

set -u

API_BASE="${API_BASE:-http://localhost:3007/api}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CATEGORIES_FILE="${SCRIPT_DIR}/data/categories.json"
PRODUCTS_FILE="${SCRIPT_DIR}/data/products.json"

# ANSI Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo -e "${BOLD}${CYAN}   🎆 SANTHI CRACKERS - 100 CRACKERS & 10 CATEGORIES SEED SCRIPT 🎆   ${NC}"
echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo -e "Target API Base : ${BOLD}${BLUE}${API_BASE}${NC}"
echo -e "Categories File : ${CATEGORIES_FILE}"
echo -e "Products File   : ${PRODUCTS_FILE}"
echo ""

# Verify files exist
if [ ! -f "$CATEGORIES_FILE" ]; then
  echo -e "${RED}Error: Categories file not found at ${CATEGORIES_FILE}${NC}"
  exit 1
fi

if [ ! -f "$PRODUCTS_FILE" ]; then
  echo -e "${RED}Error: Products file not found at ${PRODUCTS_FILE}${NC}"
  exit 1
fi

# Check API health
echo -e "${CYAN}Checking backend connectivity...${NC}"
HTTP_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/categories" 2>/dev/null || echo "000")
if [ "$HTTP_CHECK" = "000" ]; then
  echo -e "${RED}Error: Cannot connect to ${API_BASE}. Make sure the backend is running on port 3007!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Backend is reachable (HTTP ${HTTP_CHECK})${NC}"
echo ""

# ------------------------------------------------------------------------------
# STEP 1: Seed 10 Categories
# ------------------------------------------------------------------------------
echo -e "${BOLD}${YELLOW}----------------------------------------------------------------------${NC}"
echo -e "${BOLD}${YELLOW} STEP 1: Seeding 10 Categories via POST ${API_BASE}/categories ${NC}"
echo -e "${BOLD}${YELLOW}----------------------------------------------------------------------${NC}"

CAT_TOTAL=$(node -e "console.log(require('${CATEGORIES_FILE}').length)" 2>/dev/null || echo 10)
CAT_CREATED=0
CAT_EXISTS=0
CAT_FAILED=0

for i in $(seq 0 $((CAT_TOTAL - 1))); do
  CAT_PAYLOAD=$(node -e "console.log(JSON.stringify(require('${CATEGORIES_FILE}')[$i]))")
  CAT_NAME=$(node -e "console.log(require('${CATEGORIES_FILE}')[$i].name)")
  CAT_SLUG=$(node -e "console.log(require('${CATEGORIES_FILE}')[$i].slug)")

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE}/categories" \
    -H "Content-Type: application/json" \
    -d "$CAT_PAYLOAD")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  INDEX_PADDED=$(printf "%2d" $((i + 1)))

  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e " [${INDEX_PADDED}/${CAT_TOTAL}] ${GREEN}✓ Created${NC}  : ${BOLD}${CAT_NAME}${NC} (${CAT_SLUG})"
    CAT_CREATED=$((CAT_CREATED + 1))
  elif [ "$HTTP_CODE" = "409" ]; then
    echo -e " [${INDEX_PADDED}/${CAT_TOTAL}] ${YELLOW}• Exists${NC}   : ${BOLD}${CAT_NAME}${NC} (${CAT_SLUG})"
    CAT_EXISTS=$((CAT_EXISTS + 1))
  else
    echo -e " [${INDEX_PADDED}/${CAT_TOTAL}] ${RED}✗ Failed (${HTTP_CODE})${NC}: ${CAT_NAME} - ${BODY}"
    CAT_FAILED=$((CAT_FAILED + 1))
  fi
done

echo ""
echo -e "${CYAN}Categories Summary: ${GREEN}${CAT_CREATED} created${NC}, ${YELLOW}${CAT_EXISTS} already existed${NC}, ${RED}${CAT_FAILED} failed${NC}."
echo ""

# ------------------------------------------------------------------------------
# STEP 2: Seed 100 Crackers
# ------------------------------------------------------------------------------
echo -e "${BOLD}${YELLOW}----------------------------------------------------------------------${NC}"
echo -e "${BOLD}${YELLOW} STEP 2: Seeding 100 Crackers via POST ${API_BASE}/product ${NC}"
echo -e "${BOLD}${YELLOW}----------------------------------------------------------------------${NC}"

PROD_TOTAL=$(node -e "console.log(require('${PRODUCTS_FILE}').length)" 2>/dev/null || echo 100)
PROD_CREATED=0
PROD_EXISTS=0
PROD_FAILED=0

for i in $(seq 0 $((PROD_TOTAL - 1))); do
  PROD_PAYLOAD=$(node -e "console.log(JSON.stringify(require('${PRODUCTS_FILE}')[$i]))")
  PROD_CODE=$(node -e "console.log(require('${PRODUCTS_FILE}')[$i].code)")
  PROD_NAME=$(node -e "console.log(require('${PRODUCTS_FILE}')[$i].name)")
  PROD_PRICE=$(node -e "console.log(require('${PRODUCTS_FILE}')[$i].price)")
  PROD_CAT=$(node -e "console.log(require('${PRODUCTS_FILE}')[$i].categorySlug)")

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE}/product" \
    -H "Content-Type: application/json" \
    -d "$PROD_PAYLOAD")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  INDEX_PADDED=$(printf "%3d" $((i + 1)))

  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e " [${INDEX_PADDED}/${PROD_TOTAL}] ${GREEN}✓ Created${NC}  : ${BOLD}${PROD_CODE}${NC} | ${PROD_NAME} (₹${PROD_PRICE}, ${PROD_CAT})"
    PROD_CREATED=$((PROD_CREATED + 1))
  elif [ "$HTTP_CODE" = "409" ]; then
    echo -e " [${INDEX_PADDED}/${PROD_TOTAL}] ${YELLOW}• Exists${NC}   : ${BOLD}${PROD_CODE}${NC} | ${PROD_NAME}"
    PROD_EXISTS=$((PROD_EXISTS + 1))
  else
    echo -e " [${INDEX_PADDED}/${PROD_TOTAL}] ${RED}✗ Failed (${HTTP_CODE})${NC}: ${PROD_CODE} - ${BODY}"
    PROD_FAILED=$((PROD_FAILED + 1))
  fi
done

echo ""
echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}               🎉 SEEDING COMPLETED SUCCESSFULLY! 🎉                 ${NC}"
echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo -e "  Categories Processed : ${BOLD}${CAT_TOTAL}${NC} (${GREEN}${CAT_CREATED} created${NC}, ${YELLOW}${CAT_EXISTS} already existed${NC})"
echo -e "  Products Processed   : ${BOLD}${PROD_TOTAL}${NC} (${GREEN}${PROD_CREATED} created${NC}, ${YELLOW}${PROD_EXISTS} already existed${NC})"
if [ "$PROD_FAILED" -gt 0 ] || [ "$CAT_FAILED" -gt 0 ]; then
  echo -e "  Errors Encountered   : ${RED}$((CAT_FAILED + PROD_FAILED))${NC}"
fi
echo -e "${BOLD}${CYAN}======================================================================${NC}"
echo ""
