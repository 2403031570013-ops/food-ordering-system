#!/bin/bash

# FoodHub - Production Build Verification Script
# This script checks if the application is ready for production deployment

echo "🔍 FoodHub Production Build Verification"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print check results
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        ((CHECKS_FAILED++))
    fi
}

# 1. Check Node.js version
echo "🔷 Environment Checks"
echo "--------------------"
node_version=$(node -v)
check_result $? "Node.js installed ($node_version)"

npm_version=$(npm -v)
check_result $? "npm installed ($npm_version)"

# 2. Check if .env files exist
echo ""
echo "🔷 Environment Configuration"
echo "-------- -------- -----"
[ -f "server/.env" ]
check_result $? "server/.env exists"

[ -f ".env" ]
check_result $? ".env exists"

# 3. Check dependencies
echo ""
echo "🔷 Dependencies"
echo "---------------"
[ -d "server/node_modules" ]
check_result $? "Backend node_modules installed"

[ -d "node_modules" ]
check_result $? "Frontend node_modules installed"

# 4. Check critical files
echo ""
echo "🔷 Project Structure"
echo "-------------------"
[ -f "server/package.json" ]
check_result $? "server/package.json exists"

[ -f "package.json" ]
check_result $? "package.json exists"

[ -d "src" ]
check_result $? "src directory exists"

[ -d "server" ]
check_result $? "server directory exists"

# 5. Check database models
echo ""
echo "🔷 Database Models"
echo "------------------"
[ -f "server/models/Hotel.js" ]
check_result $? "Hotel model exists"

[ -f "server/models/Food.js" ]
check_result $? "Food model exists"

[ -f "server/models/User.js" ]
check_result $? "User model exists"

[ -f "server/models/Order.js" ]
check_result $? "Order model exists"

# 6. Check API routes
echo ""
echo "🔷 API Routes"
echo "-------------"
[ -f "server/routes/authRoutes.js" ]
check_result $? "Auth routes exist"

[ -f "server/routes/hotelRoutes.js" ]
check_result $? "Hotel routes exist"

[ -f "server/routes/foodRoutes.js" ]
check_result $? "Food routes exist"

[ -f "server/routes/orderRoutes.js" ]
check_result $? "Order routes exist"

# 7. Check React components
echo ""
echo "🔷 React Components"
echo "-------------------"
[ -f "src/components/Navbar.jsx" ]
check_result $? "Navbar component exists"

[ -f "src/components/RestaurantCard.jsx" ]
check_result $? "RestaurantCard component exists"

[ -f "src/pages/Home.jsx" ]
check_result $? "Home page exists"

# 8. Check configuration files
echo ""
echo "🔷 Configuration Files"
echo "---------------------"
[ -f "vite.config.js" ]
check_result $? "vite.config.js exists"

[ -f "tailwind.config.js" ]
check_result $? "tailwind.config.js exists"

[ -f "postcss.config.js" ]
check_result $? "postcss.config.js exists"

# 9. Summary
echo ""
echo "========================================"
echo "📊 Verification Summary"
echo "========================================"
TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED))
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
else
    echo -e "${GREEN}Failed: 0${NC}"
fi

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. cd server && npm run dev      # Start backend"
    echo "2. npm run dev                   # Start frontend (in new terminal)"
    echo "3. Visit http://localhost:5173"
    echo ""
    echo "To build for production:"
    echo "1. npm run build                 # Build frontend"
    echo "2. cd server && npm start        # Start backend"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. npm install                   # Install frontend dependencies"
    echo "2. cd server && npm install      # Install backend dependencies"
    echo "3. Check that .env files exist and are configured"
    exit 1
fi
