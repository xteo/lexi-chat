#!/usr/bin/env node

/**
 * Test script for JWT authentication with Lexi API endpoints
 * Usage: node test-jwt-auth.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ENVIRONMENT = process.env.ENVIRONMENT || 'production';

// Get endpoint based on environment
const getEndpoint = () => {
  if (ENVIRONMENT === 'staging') {
    return process.env.LEXI_OPENBRAIN_STAGING_URL || 
           'https://lexi-open-brain-staging-484322485773.us-central1.run.app';
  }
  return process.env.LEXI_OPENBRAIN_API_URL || 
         'https://lexi-open-brain-service-484322485773.us-central1.run.app';
};

// Test user credentials (you'll need to provide these)
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'test123456';

async function testJWTAuthentication() {
  console.log('🔐 Testing JWT Authentication Flow');
  console.log('===================================');
  console.log(`Environment: ${ENVIRONMENT}`);
  console.log(`Endpoint: ${getEndpoint()}`);
  console.log('');

  try {
    // Step 1: Initialize Supabase client
    console.log('1️⃣  Initializing Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Step 2: Sign in to get JWT token
    console.log('2️⃣  Signing in to get JWT token...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.log('\n💡 Tip: Make sure you have a test user created in Supabase');
      console.log('   You can set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local');
      return;
    }

    const jwtToken = authData.session.access_token;
    console.log('✅ JWT token obtained successfully');
    console.log(`   Token (first 50 chars): ${jwtToken.substring(0, 50)}...`);
    console.log('');

    // Step 3: Test Lexi API endpoint with JWT
    console.log('3️⃣  Testing Lexi API with JWT token...');
    const endpoint = getEndpoint();
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        model: 'lexi',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message with JWT authentication.',
          },
        ],
        stream: false,
      }),
    });

    console.log(`   Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      const errorText = await response.text();
      console.error('❌ API call failed:', errorText);
      
      if (response.status === 401) {
        console.log('\n💡 Tip: The backend service might not be configured to accept JWT tokens');
        console.log('   Make sure the Lexi OpenBrain service is running and configured properly');
      }
    }

    // Step 4: Test Memory API endpoint (if configured)
    const memoryEndpoint = ENVIRONMENT === 'staging' 
      ? process.env.LEXI_MEMORY_STAGING_URL 
      : process.env.LEXI_MEMORY_API_URL;
      
    if (memoryEndpoint) {
      console.log('\n4️⃣  Testing Memory API with JWT token...');
      const memoryResponse = await fetch(`${memoryEndpoint}/health`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      
      console.log(`   Memory API Health Check: ${memoryResponse.status} ${memoryResponse.statusText}`);
    }

    // Step 5: Sign out
    console.log('\n5️⃣  Signing out...');
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');

    console.log('\n✨ JWT Authentication test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    console.log('   2. Ensure you have a valid test user in Supabase');
    console.log('   3. Verify the Lexi API endpoints are accessible');
    console.log('   4. Check network connectivity and firewall settings');
  }
}

// Run the test
testJWTAuthentication();