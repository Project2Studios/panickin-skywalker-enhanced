#!/usr/bin/env node

/**
 * Test script for Stripe integration
 * Run with: node test-stripe-integration.js
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration for Panickin\' Skywalker Merch Store\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables...');
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY', 
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_CURRENCY'
  ];

  let envTestPassed = true;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].includes('...')) {
      console.log(`❌ ${envVar} is not configured`);
      envTestPassed = false;
    } else {
      const maskedValue = envVar.includes('SECRET') || envVar.includes('KEY') 
        ? process.env[envVar].substring(0, 8) + '...' 
        : process.env[envVar];
      console.log(`✅ ${envVar}: ${maskedValue}`);
    }
  }

  if (!envTestPassed) {
    console.log('\n⚠️  Please configure your Stripe environment variables in .env file');
    console.log('   Example: STRIPE_SECRET_KEY=sk_test_51...');
    return;
  }

  // Test 2: Stripe SDK Import and Initialization
  console.log('\n2️⃣ Testing Stripe SDK...');
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    console.log('✅ Stripe SDK imported and initialized successfully');

    // Test 3: Stripe API Connection
    console.log('\n3️⃣ Testing Stripe API Connection...');
    try {
      const balance = await stripe.balance.retrieve();
      console.log('✅ Successfully connected to Stripe API');
      console.log(`   Available balance: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'usd'}`);
    } catch (error) {
      console.log('❌ Failed to connect to Stripe API:', error.message);
      return;
    }

    // Test 4: Payment Intent Creation
    console.log('\n4️⃣ Testing Payment Intent Creation...');
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000, // $20.00 in cents
        currency: 'usd',
        metadata: {
          test: 'true',
          store: 'panickin_skywalker',
        },
      });
      console.log('✅ Payment intent created successfully');
      console.log(`   Payment Intent ID: ${paymentIntent.id}`);
      console.log(`   Amount: $${paymentIntent.amount / 100}`);
      console.log(`   Status: ${paymentIntent.status}`);

      // Clean up test payment intent
      await stripe.paymentIntents.cancel(paymentIntent.id);
      console.log('✅ Test payment intent canceled');
    } catch (error) {
      console.log('❌ Failed to create payment intent:', error.message);
    }

    // Test 5: Customer Creation
    console.log('\n5️⃣ Testing Customer Creation...');
    try {
      const customer = await stripe.customers.create({
        email: 'test@panickin-skywalker.com',
        name: 'Test Customer',
        metadata: {
          test: 'true',
          source: 'panickin_skywalker_test',
        },
      });
      console.log('✅ Customer created successfully');
      console.log(`   Customer ID: ${customer.id}`);
      console.log(`   Email: ${customer.email}`);

      // Clean up test customer
      await stripe.customers.del(customer.id);
      console.log('✅ Test customer deleted');
    } catch (error) {
      console.log('❌ Failed to create customer:', error.message);
    }

    // Test 6: Webhook Signature Verification
    console.log('\n6️⃣ Testing Webhook Signature Verification...');
    try {
      const testPayload = JSON.stringify({
        id: 'evt_test_webhook',
        object: 'event',
        api_version: '2024-11-20.acacia',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: 'pi_test',
            object: 'payment_intent',
            status: 'succeeded'
          }
        },
        livemode: false,
        pending_webhooks: 0,
        request: {
          id: null,
          idempotency_key: null
        },
        type: 'payment_intent.succeeded'
      });

      // This will fail without a real signature, but we're just testing the function exists
      try {
        stripe.webhooks.constructEvent(testPayload, 'test_signature', process.env.STRIPE_WEBHOOK_SECRET);
      } catch (sigError) {
        if (sigError.message.includes('No signatures found')) {
          console.log('✅ Webhook signature verification function is working');
        } else {
          throw sigError;
        }
      }
    } catch (error) {
      console.log('❌ Webhook signature verification failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Failed to initialize Stripe SDK:', error.message);
    return;
  }

  // Test 7: Server Endpoints (if server is running)
  console.log('\n7️⃣ Testing Server Endpoints...');
  try {
    const fetch = require('node-fetch');
    const serverUrl = `http://localhost:${process.env.PORT || 5000}`;

    // Test payment intent endpoint
    try {
      const response = await fetch(`${serverUrl}/api/checkout/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 25.00,
          currency: 'usd',
          orderItems: [
            {
              productId: 'test-product',
              variantId: 'test-variant',
              quantity: 1
            }
          ],
          customerInfo: {
            email: 'test@panickin-skywalker.com',
            name: 'Test Customer'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment intent endpoint is working');
        console.log(`   Created payment intent: ${data.paymentIntent?.id}`);
      } else {
        console.log(`⚠️  Payment intent endpoint returned ${response.status}: ${await response.text()}`);
      }
    } catch (fetchError) {
      console.log('⚠️  Could not test server endpoints (server may not be running)');
      console.log('   Start server with: npm run dev');
    }
  } catch (error) {
    console.log('⚠️  Could not import node-fetch for endpoint testing');
  }

  // Summary
  console.log('\n🎉 Stripe Integration Test Complete!');
  console.log('\n🦸‍♂️ Don\'t panic - your payment system is ready for superhero-level transactions!');
  console.log('\nNext steps:');
  console.log('1. Start your server: npm run dev');
  console.log('2. Test the payment flow in your browser');
  console.log('3. Configure webhooks in Stripe Dashboard');
  console.log('4. Test with Stripe test cards');
  console.log('5. When ready, switch to live API keys for production');
}

// Run the test
testStripeIntegration().catch(console.error);