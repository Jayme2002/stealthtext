#!/usr/bin/env node

/**
 * Environment Variable Security Check
 * 
 * This script verifies that sensitive environment variables are properly configured
 * to prevent accidental exposure in client-side code.
 */

// List of environment variables that are safe to expose to the client
const SAFE_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_APP_URL'
];

// List of sensitive environment variables that should never be exposed
const SENSITIVE_ENV_VARS = [
  'VITE_STRIPE_SECRET_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_STRIPE_WEBHOOK_SECRET',
  'VITE_STRIPE_TEST_WEBHOOK_SECRET',
  'VITE_OPENAI_API_KEY',
  'VITE_HUMANIZED_AI_API_KEY'
];

// Check that all required safe variables are defined
console.log('\n🔍 Checking required client-side environment variables...');
let missingRequiredVars = false;
for (const envVar of SAFE_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    missingRequiredVars = true;
  } else {
    console.log(`✅ ${envVar} is defined`);
  }
}

if (missingRequiredVars) {
  console.error('\n❌ Missing required environment variables. Aborting build.');
  process.exit(1);
}

// Check vite.config.ts to ensure it doesn't leak sensitive variables
console.log('\n🔍 Checking vite.config.ts structure...');
const fs = require('fs');
const path = require('path');

try {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check for define statements that might expose sensitive variables
  let potentialLeaks = false;
  for (const sensitiveVar of SENSITIVE_ENV_VARS) {
    if (viteConfig.includes(`'process.env.${sensitiveVar}'`) || viteConfig.includes(`"process.env.${sensitiveVar}"`)) {
      console.error(`❌ SECURITY ISSUE: ${sensitiveVar} might be exposed in vite.config.ts`);
      potentialLeaks = true;
    }
  }
  
  if (!viteConfig.includes("'process.env': {")) {
    console.warn(`⚠️ WARNING: Consider using the safer 'process.env' object format for environment variable definition`);
  }
  
  if (potentialLeaks) {
    console.error('\n❌ SECURITY RISK: Environment variables may be exposed to the client!');
    console.error('   Please fix the vite.config.ts file to protect sensitive data.');
    process.exit(1);
  } else {
    console.log('✅ vite.config.ts structure looks secure');
  }
} catch (error) {
  console.error('❌ Error checking vite.config.ts:', error.message);
  process.exit(1);
}

console.log('\n✅ Environment security check passed!');
console.log('🔒 Building application with secure environment configuration...\n'); 