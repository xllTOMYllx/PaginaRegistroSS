#!/bin/bash
# Test script for the advanced search functionality

echo "=========================================="
echo "Testing Advanced Search Functionality"
echo "=========================================="
echo ""

# Check if backend files exist
echo "1. Checking backend implementation..."
if [ -f "backend/routes/users.js" ]; then
    echo "   ✓ Backend route file exists"
    
    # Check for the new endpoint
    if grep -q "buscar-avanzado" backend/routes/users.js; then
        echo "   ✓ Advanced search endpoint found"
    else
        echo "   ✗ Advanced search endpoint NOT found"
        exit 1
    fi
    
    # Check for the new middleware
    if grep -q "isJefeOAdmin" backend/routes/users.js; then
        echo "   ✓ Authorization middleware found"
    else
        echo "   ✗ Authorization middleware NOT found"
        exit 1
    fi
else
    echo "   ✗ Backend route file NOT found"
    exit 1
fi

echo ""
echo "2. Checking frontend implementation..."

# Check if frontend component exists
if [ -f "frontend/src/components/BusquedaAvanzada.jsx" ]; then
    echo "   ✓ Search component exists"
else
    echo "   ✗ Search component NOT found"
    exit 1
fi

# Check if CSS exists
if [ -f "frontend/src/css/BusquedaAvanzada.css" ]; then
    echo "   ✓ Component CSS exists"
else
    echo "   ✗ Component CSS NOT found"
    exit 1
fi

# Check if route is added to App.jsx
if grep -q "busqueda-avanzada" frontend/src/App.jsx; then
    echo "   ✓ Route added to App.jsx"
else
    echo "   ✗ Route NOT added to App.jsx"
    exit 1
fi

# Check if navigation button is added to Sidebar
if grep -q "Búsqueda Avanzada" frontend/src/components/Sidebar.jsx; then
    echo "   ✓ Navigation button added to Sidebar"
else
    echo "   ✗ Navigation button NOT added to Sidebar"
    exit 1
fi

# Check if config file exists
if [ -f "frontend/src/utils/config.js" ]; then
    echo "   ✓ API configuration file exists"
else
    echo "   ✗ API configuration file NOT found"
    exit 1
fi

echo ""
echo "3. Checking documentation..."

# Check if documentation exists
if [ -f "BUSQUEDA_AVANZADA.md" ]; then
    echo "   ✓ Feature documentation exists"
else
    echo "   ✗ Feature documentation NOT found"
    exit 1
fi

if [ -f "SECURITY_SUMMARY.md" ]; then
    echo "   ✓ Security summary exists"
else
    echo "   ✗ Security summary NOT found"
    exit 1
fi

echo ""
echo "4. Testing build process..."

# Test backend syntax
cd backend
if node -c routes/users.js 2>/dev/null; then
    echo "   ✓ Backend code has no syntax errors"
else
    echo "   ✗ Backend code has syntax errors"
    cd ..
    exit 1
fi
cd ..

# Test frontend build
cd frontend
echo "   Building frontend (this may take a moment)..."
if npm run build > /dev/null 2>&1; then
    echo "   ✓ Frontend builds successfully"
else
    echo "   ✗ Frontend build failed"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "=========================================="
echo "All tests passed! ✓"
echo "=========================================="
echo ""
echo "The advanced search functionality has been successfully implemented."
echo ""
echo "Key Features:"
echo "  - Backend endpoint: GET /api/users/buscar-avanzado"
echo "  - Access restricted to rol 3 and 4"
echo "  - Search filters: name, document type, certificates, verified docs"
echo "  - Frontend component: BusquedaAvanzada.jsx"
echo "  - Navigation: Sidebar → 🔍 Búsqueda Avanzada"
echo ""
echo "To use:"
echo "  1. Log in as a user with rol 3 or 4"
echo "  2. Click on 'Búsqueda Avanzada' in the sidebar"
echo "  3. Use the filters to search for candidates"
echo ""
