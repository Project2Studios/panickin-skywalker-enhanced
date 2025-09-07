// Simple API test script
const baseUrl = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing E-commerce API Endpoints...\n');

  try {
    // Test categories endpoint
    console.log('📁 Testing Categories API...');
    const categoriesResponse = await fetch(`${baseUrl}/categories`);
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('✅ Categories API working:', categories.total || 0, 'categories');
    } else {
      console.log('❌ Categories API failed:', categoriesResponse.status);
    }

    // Test products endpoint
    console.log('\n📦 Testing Products API...');
    const productsResponse = await fetch(`${baseUrl}/products?limit=5`);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ Products API working:', products.pagination?.total || 0, 'products');
    } else {
      console.log('❌ Products API failed:', productsResponse.status);
    }

    // Test cart endpoint (should work without auth)
    console.log('\n🛒 Testing Cart API...');
    const cartResponse = await fetch(`${baseUrl}/cart`, {
      headers: {
        'X-Session-ID': 'test-session-123'
      }
    });
    if (cartResponse.ok) {
      const cart = await cartResponse.json();
      console.log('✅ Cart API working:', cart.summary?.itemCount || 0, 'items');
    } else {
      console.log('❌ Cart API failed:', cartResponse.status);
    }

    // Test admin endpoints (should require auth)
    console.log('\n🔐 Testing Admin API (should fail without auth)...');
    const adminResponse = await fetch(`${baseUrl}/admin/products`);
    if (adminResponse.status === 401) {
      console.log('✅ Admin API properly protected (401 Unauthorized)');
    } else {
      console.log('❌ Admin API security issue:', adminResponse.status);
    }

    console.log('\n✨ API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the server is running on http://localhost:5000');
  }
}

// Run the test
testAPI();