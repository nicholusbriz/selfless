/**
 * Test script to check which AI API providers are working
 * Run with: node scripts/test-ai-apis.js
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('Warning: .env.local file not found');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
      envVars[key.trim()] = value;
    }
  });
  
  return envVars;
}

const envVars = loadEnvFile();

const API_KEYS = {
  openai: envVars.OPENAI_API_KEY?.trim(),
  gemini: envVars.GEMINI_API_KEY?.trim(),
  groq: envVars.GROQ_API_KEY?.trim()
};

async function testOpenAI() {
  if (!API_KEYS.openai) {
    return { provider: 'openai', status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'openai', status: 'working', model: 'gpt-3.5-turbo' };
    } else {
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('billing')) {
        return { provider: 'openai', status: 'quota_exceeded', error: data.error.message };
      }
      return { provider: 'openai', status: 'error', error: data.error?.message || 'Unknown error' };
    }
  } catch (error) {
    return { provider: 'openai', status: 'network_error', error: error.message };
  }
}

async function testGemini() {
  if (!API_KEYS.gemini) {
    return { provider: 'gemini', status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEYS.gemini}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'gemini', status: 'working', model: 'gemini-2.0-flash' };
    } else {
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('limit')) {
        return { provider: 'gemini', status: 'quota_exceeded', error: data.error.message };
      }
      return { provider: 'gemini', status: 'error', error: data.error?.message || 'Unknown error' };
    }
  } catch (error) {
    return { provider: 'gemini', status: 'network_error', error: error.message };
  }
}

async function testGroq() {
  if (!API_KEYS.groq) {
    return { provider: 'groq', status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.groq}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'groq', status: 'working', model: 'llama-3.3-70b-versatile' };
    } else {
      if (data.error?.message?.includes('rate limit') || data.error?.message?.includes('quota')) {
        return { provider: 'groq', status: 'quota_exceeded', error: data.error.message };
      }
      return { provider: 'groq', status: 'error', error: data.error?.message || 'Unknown error' };
    }
  } catch (error) {
    return { provider: 'groq', status: 'network_error', error: error.message };
  }
}

async function main() {
  console.log('🔍 Testing AI API Providers...\n');

  const results = await Promise.all([
    testOpenAI(),
    testGemini(),
    testGroq()
  ]);

  console.log('📊 Results:');
  console.log('─'.repeat(60));

  results.forEach(result => {
    const statusEmoji = {
      working: '✅',
      quota_exceeded: '⚠️',
      error: '❌',
      network_error: '🌐',
      not_configured: '⚙️'
    }[result.status] || '❓';

    console.log(`${statusEmoji} ${result.provider.toUpperCase()}: ${result.status}`);
    
    if (result.model) {
      console.log(`   Model: ${result.model}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log();
  });

  const workingProviders = results.filter(r => r.status === 'working');
  const quotaExceeded = results.filter(r => r.status === 'quota_exceeded');
  
  console.log('─'.repeat(60));
  console.log(`📈 Summary: ${workingProviders.length} working, ${quotaExceeded.length} quota exceeded`);

  if (workingProviders.length === 0) {
    console.log('\n⚠️ No working providers available. Consider:');
    console.log('  • Adding credits to paid accounts');
    console.log('  • Waiting for daily limits to reset');
    console.log('  • Using alternative API keys');
  } else {
    console.log('\n✅ Recommended AI_SERVICE setting:', workingProviders[0].provider);
  }
}

main().catch(console.error);
