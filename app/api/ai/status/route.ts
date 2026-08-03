import { NextResponse } from 'next/server';
import { isRAGAvailable } from '@/lib/services/rag-service';

type ProviderStatus = {
  provider: string;
  configured: boolean;
  status: 'working' | 'quota_exceeded' | 'error' | 'not_configured';
  model?: string;
  error?: string;
  lastChecked?: string;
};

// Cache status for 5 minutes to avoid excessive API calls
const statusCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/ai/status
 * 
 * Check the status of all AI providers and RAG system
 * 
 * Query Parameters:
 * - refresh: boolean (optional) - Force refresh of cache (default: false)
 * 
 * Returns:
 * - success: boolean
 * - cached: boolean - Whether result was from cache
 * - data.providers: array - Status of each provider
 * - data.summary: object - Summary of provider status
 * - data.ragAvailable: boolean - Whether RAG is available
 * - data.timestamp: string - When the status was checked
 * 
 * Authentication: Not required (public endpoint)
 */
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
      console.log('[StatusRoute] Returning cached status');
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedData.data,
        timestamp: new Date(cachedData.timestamp).toISOString()
      });
    }
  }

  console.log('[StatusRoute] Refreshing provider status');

  // Test all providers
  const results = await Promise.all([
    testOpenAI(),
    testGemini(),
    testGroq()
  ]);

  const workingProviders = results.filter(r => r.status === 'working');
  const quotaExceeded = results.filter(r => r.status === 'quota_exceeded');
  const notConfigured = results.filter(r => r.status === 'not_configured');

  // Check RAG availability
  let ragAvailable = false;
  try {
    ragAvailable = await isRAGAvailable();
    console.log(`[StatusRoute] RAG available: ${ragAvailable}`);
  } catch (ragError) {
    console.error('[StatusRoute] Failed to check RAG availability:', ragError);
  }

  const response = {
    providers: results,
    summary: {
      total: results.length,
      working: workingProviders.length,
      quotaExceeded: quotaExceeded.length,
      notConfigured: notConfigured.length,
      recommended: workingProviders.length > 0 ? workingProviders[0].provider : 'none'
    },
    ragAvailable,
    timestamp: new Date().toISOString()
  };

  // Cache the results
  statusCache.set('all', { data: response, timestamp: now });

  return NextResponse.json({
    success: true,
    cached: false,
    data: response
  });
}
