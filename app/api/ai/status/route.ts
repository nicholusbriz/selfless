import { NextResponse } from 'next/server';

type ProviderStatus = {
  provider: string;
  configured: boolean;
  status: 'working' | 'quota_exceeded' | 'error' | 'not_configured';
  model?: string;
  error?: string;
  lastChecked?: string;
};

// Cache status for 5 minutes to avoid excessive API calls
const statusCache = new Map<string, { data: ProviderStatus; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function testOpenAI(): Promise<ProviderStatus> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  
  if (!apiKey) {
    return { provider: 'openai', configured: false, status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'openai', configured: true, status: 'working', model: 'gpt-3.5-turbo' };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('exceeded')) {
        return { provider: 'openai', configured: true, status: 'quota_exceeded', error: errorMessage };
      }
      return { provider: 'openai', configured: true, status: 'error', error: errorMessage };
    }
  } catch (error) {
    return { provider: 'openai', configured: true, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testGemini(): Promise<ProviderStatus> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  if (!apiKey) {
    return { provider: 'gemini', configured: false, status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'gemini', configured: true, status: 'working', model: 'gemini-2.0-flash' };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('exceeded')) {
        return { provider: 'gemini', configured: true, status: 'quota_exceeded', error: errorMessage };
      }
      return { provider: 'gemini', configured: true, status: 'error', error: errorMessage };
    }
  } catch (error) {
    return { provider: 'gemini', configured: true, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testGroq(): Promise<ProviderStatus> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  
  if (!apiKey) {
    return { provider: 'groq', configured: false, status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'groq', configured: true, status: 'working', model: 'llama-3.3-70b-versatile' };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
        return { provider: 'groq', configured: true, status: 'quota_exceeded', error: errorMessage };
      }
      return { provider: 'groq', configured: true, status: 'error', error: errorMessage };
    }
  } catch (error) {
    return { provider: 'groq', configured: true, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = statusCache.get('all');
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedData.data,
        timestamp: new Date(cachedData.timestamp).toISOString()
      });
    }
  }

  // Test all providers
  const results = await Promise.all([
    testOpenAI(),
    testGemini(),
    testGroq()
  ]);

  const workingProviders = results.filter(r => r.status === 'working');
  const quotaExceeded = results.filter(r => r.status === 'quota_exceeded');
  const notConfigured = results.filter(r => r.status === 'not_configured');

  const response = {
    providers: results,
    summary: {
      total: results.length,
      working: workingProviders.length,
      quotaExceeded: quotaExceeded.length,
      notConfigured: notConfigured.length,
      recommended: workingProviders.length > 0 ? workingProviders[0].provider : 'none'
    },
    timestamp: new Date().toISOString()
  };

  // Cache the results
  statusCache.set('all', { data: response as any, timestamp: now });

  return NextResponse.json({
    success: true,
    cached: false,
    data: response
  });
}
