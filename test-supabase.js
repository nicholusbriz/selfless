// Simple test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: List buckets (should work with anon key if bucket is public)
    console.log('\n📦 Testing: List storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message);
    } else {
      console.log('✅ Buckets found:', buckets.map(b => b.name).join(', '));
      
      // Check if profile-images bucket exists
      const hasProfileBucket = buckets.some(b => b.name === 'profile-images');
      if (hasProfileBucket) {
        console.log('✅ profile-images bucket exists');
      } else {
        console.log('⚠️  profile-images bucket not found - please create it in Supabase dashboard');
      }
    }

    // Test 2: Try to access the profile-images bucket
    console.log('\n📁 Testing: Access profile-images bucket...');
    const { data: files, error: filesError } = await supabase
      .storage
      .from('profile-images')
      .list('', { limit: 1 });

    if (filesError) {
      console.error('❌ Failed to access profile-images bucket:', filesError.message);
      console.log('   Make sure the bucket exists and has proper permissions');
    } else {
      console.log('✅ Successfully accessed profile-images bucket');
      console.log('   Files in bucket:', files.length);
    }

    console.log('\n✅ Supabase connection test completed');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
