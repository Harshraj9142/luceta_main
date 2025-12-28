#!/usr/bin/env node

/**
 * Create Luceta Audio Products in Dodo Payments using official SDK
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import DodoPayments from 'dodopayments';

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.log('⚠️  Could not load .env file:', error.message);
  }
}

loadEnvFile();

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const DODO_ENVIRONMENT = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';

// Initialize Dodo Payments client
const client = new DodoPayments({
  bearerToken: DODO_API_KEY,
  environment: DODO_ENVIRONMENT,
});

// Luceta Audio Products
const products = [
  {
    name: 'Starter',
    description: 'Perfect for indie game developers getting started with audio cursor technology. Build locally, sell globally with basic audio experiences.',
    price: {
      currency: 'USD',
      price: 2900, // $29.00 in cents
      type: 'one_time_price',
      discount: 0,
      pay_what_you_want: false,
      purchasing_power_parity: false,
      tax_inclusive: false
    },
    tax_category: 'digital_products',
    metadata: {
      category: 'starter',
      platform: 'luceta-audio',
      features: 'audio-cursor,basic-integration,community-support'
    }
  },
  {
    name: 'Pro',
    description: 'Advanced features for professional game studios. Advanced gesture recognition and multi-platform deployment for audio engineering.',
    price: {
      currency: 'USD',
      price: 9900, // $99.00 in cents
      type: 'one_time_price',
      discount: 0,
      pay_what_you_want: false,
      purchasing_power_parity: false,
      tax_inclusive: false
    },
    tax_category: 'digital_products',
    metadata: {
      category: 'pro',
      platform: 'luceta-audio',
      features: 'advanced-gestures,multi-platform,priority-support'
    }
  },
  {
    name: 'Enterprise',
    description: 'Full-scale solution for large game development teams. Custom audio templates with unlimited experiences and dedicated support.',
    price: {
      currency: 'USD',
      price: 29900, // $299.00 in cents
      type: 'one_time_price',
      discount: 0,
      pay_what_you_want: false,
      purchasing_power_parity: false,
      tax_inclusive: false
    },
    tax_category: 'digital_products',
    metadata: {
      category: 'enterprise',
      platform: 'luceta-audio',
      features: 'custom-templates,unlimited,dedicated-support'
    }
  }
];

async function createProduct(productData) {
  console.log(`\n🎵 Creating product: ${productData.name}...`);
  
  try {
    const product = await client.products.create({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      tax_category: productData.tax_category,
      metadata: productData.metadata
    });
    
    console.log(`✅ Product created successfully`);
    console.log(`   Product ID: ${product.product_id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Price: $${(product.price.price / 100).toFixed(2)}`);
    return { success: true, product };
  } catch (error) {
    console.log(`❌ Failed to create product`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function listExistingProducts() {
  console.log('\n📋 Checking existing products...');
  
  try {
    const response = await client.products.list();
    const productsList = [];
    
    // Handle async iterator
    for await (const product of response) {
      productsList.push(product);
    }
    
    console.log(`✅ Found ${productsList.length} existing products`);
    
    if (productsList.length > 0) {
      productsList.forEach(product => {
        const price = product.price?.price ? (product.price.price / 100).toFixed(2) : 'N/A';
        console.log(`   - ${product.name} (${product.product_id}) - $${price}`);
      });
    }
    
    return productsList;
  } catch (error) {
    console.log(`❌ Error listing products: ${error.message}`);
    return [];
  }
}

async function createAllProducts() {
  console.log('🚀 Luceta Audio Platform - Product Creation');
  console.log('='.repeat(50));
  console.log(`Environment: ${DODO_ENVIRONMENT}`);
  console.log(`API Key: ${DODO_API_KEY ? 'configured' : 'NOT SET'}`);
  
  if (!DODO_API_KEY) {
    console.log('❌ DODO_PAYMENTS_API_KEY not found in environment variables');
    return false;
  }
  
  // List existing products first
  const existingProducts = await listExistingProducts();
  const existingNames = existingProducts.map(p => p.name);
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  const createdProducts = [];
  
  for (const productData of products) {
    if (existingNames.includes(productData.name)) {
      const existing = existingProducts.find(p => p.name === productData.name);
      console.log(`\n⏭️  Product ${productData.name} already exists (${existing.product_id}), skipping...`);
      createdProducts.push({ name: productData.name, id: existing.product_id });
      skipped++;
      continue;
    }
    
    const result = await createProduct(productData);
    if (result.success) {
      created++;
      createdProducts.push({ name: result.product.name, id: result.product.product_id });
    } else {
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Product Creation Results:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  
  if (createdProducts.length > 0) {
    console.log('\n📝 Product IDs for lib/dodo-payments.ts:');
    console.log('Update LUCETA_PRODUCTS with these IDs:\n');
    createdProducts.forEach(p => {
      console.log(`   ${p.name}: '${p.id}'`);
    });
  }
  
  return failed === 0;
}

// Run
createAllProducts()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Product creation error:', error);
    process.exit(1);
  });
