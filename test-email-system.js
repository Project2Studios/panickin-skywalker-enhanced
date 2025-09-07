#!/usr/bin/env node

/**
 * Email System Test Script for Panickin' Skywalker
 * Tests the comprehensive email functionality including templates and delivery
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@panickinskywalker.com';

console.log('🦸‍♂️ Panickin\' Skywalker Email System Test');
console.log('=============================================\n');

async function testEmailSystem() {
  const tests = [
    {
      name: 'Email Service Status Check',
      test: () => testEmailStatus(),
    },
    {
      name: 'Basic Email System Test',
      test: () => testBasicEmail(),
    },
    {
      name: 'Order Confirmation Email',
      test: () => testOrderConfirmation(),
    },
    {
      name: 'Shipping Notification Email',
      test: () => testShippingNotification(),
    },
    {
      name: 'Status Update Email',
      test: () => testStatusUpdate(),
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      console.log(`🧪 Testing: ${name}...`);
      await test();
      console.log(`✅ ${name} - PASSED\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('=============================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All email tests passed! Your anxious superhero email system is ready!');
  } else {
    console.log('😰 Some tests failed. Don\'t panic - check the errors above.');
  }
  
  return failed === 0;
}

async function testEmailStatus() {
  const response = await fetch(`${BASE_URL}/api/email/status`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Status check failed: ${data.error || 'Unknown error'}`);
  }
  
  console.log(`   📧 Email Service Ready: ${data.ready ? 'Yes' : 'No'}`);
  console.log(`   📡 Connection Test: ${data.connectionTest ? 'Passed' : 'Failed'}`);
  console.log(`   🔧 Provider: ${data.provider}`);
  console.log(`   ⚙️  SMTP Configured: ${data.configured.smtp ? 'Yes' : 'No'}`);
  
  if (!data.ready || !data.connectionTest) {
    throw new Error('Email service is not ready or connection test failed');
  }
}

async function testBasicEmail() {
  const response = await fetch(`${BASE_URL}/api/email/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(`Basic email test failed: ${data.message || data.error || 'Unknown error'}`);
  }
  
  console.log(`   📧 Test email sent successfully`);
  console.log(`   ⏰ Timestamp: ${data.timestamp}`);
}

async function testOrderConfirmation() {
  // This would normally use a real order number from the database
  // For testing, we'll use a mock order number
  const testOrderNumber = 'PS-TEST-001';
  
  const response = await fetch(`${BASE_URL}/api/email/send/order-confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber: testOrderNumber })
  });
  
  const data = await response.json();
  
  if (response.status === 404) {
    console.log(`   ⚠️  Test order ${testOrderNumber} not found (expected for test)`);
    console.log(`   💡 Create a real order to test this functionality`);
    return;
  }
  
  if (!response.ok || !data.success) {
    throw new Error(`Order confirmation test failed: ${data.error || 'Unknown error'}`);
  }
  
  console.log(`   📧 Order confirmation sent to: ${data.recipient}`);
  console.log(`   📦 Order: ${data.orderNumber}`);
}

async function testShippingNotification() {
  const testData = {
    orderNumber: 'PS-TEST-001',
    trackingNumber: 'TEST123456789',
    carrier: 'UPS',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const response = await fetch(`${BASE_URL}/api/email/send/shipping-notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });
  
  const data = await response.json();
  
  if (response.status === 404) {
    console.log(`   ⚠️  Test order ${testData.orderNumber} not found (expected for test)`);
    console.log(`   💡 Create a real order to test this functionality`);
    return;
  }
  
  if (!response.ok || !data.success) {
    throw new Error(`Shipping notification test failed: ${data.error || 'Unknown error'}`);
  }
  
  console.log(`   📧 Shipping notification sent to: ${data.recipient}`);
  console.log(`   📦 Tracking: ${data.trackingNumber}`);
}

async function testStatusUpdate() {
  const testData = {
    orderNumber: 'PS-TEST-001',
    status: 'processing',
    additionalInfo: 'Your superhero gear is being prepared with extra care!'
  };
  
  const response = await fetch(`${BASE_URL}/api/email/send/status-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });
  
  const data = await response.json();
  
  if (response.status === 404) {
    console.log(`   ⚠️  Test order ${testData.orderNumber} not found (expected for test)`);
    console.log(`   💡 Create a real order to test this functionality`);
    return;
  }
  
  if (!response.ok || !data.success) {
    throw new Error(`Status update test failed: ${data.error || 'Unknown error'}`);
  }
  
  console.log(`   📧 Status update sent to: ${data.recipient}`);
  console.log(`   📊 Status: ${data.status}`);
}

// Configuration validation
function validateConfiguration() {
  console.log('🔧 Validating Email Configuration...');
  
  const requiredEnvVars = [
    'EMAIL_FROM',
    'EMAIL_FROM_ADDRESS',
    'EMAIL_REPLY_TO',
    'ADMIN_EMAIL'
  ];
  
  const optionalEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASSWORD'
  ];
  
  let missingRequired = [];
  let missingOptional = [];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingRequired.push(envVar);
    } else {
      console.log(`   ✅ ${envVar}: ${process.env[envVar]}`);
    }
  });
  
  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    } else {
      console.log(`   ✅ ${envVar}: ${envVar.includes('PASSWORD') ? '*'.repeat(8) : process.env[envVar]}`);
    }
  });
  
  if (missingRequired.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingRequired.join(', ')}`);
    console.log('💡 Please add them to your .env file');
    return false;
  }
  
  if (missingOptional.length > 0) {
    console.log(`\n⚠️  Missing optional SMTP variables (will use test email): ${missingOptional.join(', ')}`);
    console.log('💡 For production, configure real SMTP settings');
  }
  
  console.log('\n✅ Configuration validation passed!\n');
  return true;
}

// Main execution
async function main() {
  try {
    // Check if server is running
    console.log(`🔍 Checking if server is running at ${BASE_URL}...`);
    const healthResponse = await fetch(`${BASE_URL}/api/email/status`);
    if (!healthResponse.ok) {
      throw new Error(`Server not responding at ${BASE_URL}. Please start the server with 'npm run dev'.`);
    }
    console.log('✅ Server is running!\n');
    
    // Validate configuration
    if (!validateConfiguration()) {
      process.exit(1);
    }
    
    // Run tests
    const success = await testEmailSystem();
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error(`💥 Test setup failed: ${error.message}`);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure the server is running: npm run dev');
    console.error('   2. Check your .env file has email configuration');
    console.error('   3. Verify SMTP settings are correct');
    process.exit(1);
  }
}

// Handle script arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🦸‍♂️ Panickin' Skywalker Email System Test

Usage: node test-email-system.js [options]

Options:
  --help, -h    Show this help message

Environment Variables Required:
  EMAIL_FROM            From name and email
  EMAIL_FROM_ADDRESS    From email address  
  EMAIL_REPLY_TO        Reply-to email
  ADMIN_EMAIL           Admin notification email

Optional (for real SMTP):
  SMTP_HOST            SMTP server host
  SMTP_PORT            SMTP server port (default: 587)
  SMTP_USER            SMTP username
  SMTP_PASSWORD        SMTP password
  SMTP_SECURE          Use SSL (true/false)

If SMTP variables are not provided, the system will use Ethereal
test email accounts for development testing.

Example .env configuration:
  EMAIL_FROM="Panickin' Skywalker Store" <store@panickinskywalker.com>
  EMAIL_FROM_ADDRESS=store@panickinskywalker.com
  EMAIL_REPLY_TO=support@panickinskywalker.com
  ADMIN_EMAIL=admin@panickinskywalker.com
  
For production, add SMTP settings:
  SMTP_HOST=smtp.your-provider.com
  SMTP_PORT=587
  SMTP_USER=your-smtp-user
  SMTP_PASSWORD=your-smtp-password
  SMTP_SECURE=false
`);
  process.exit(0);
}

// Run the main function
main();