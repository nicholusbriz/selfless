import { NextResponse } from 'next/server';
import { isRAGAvailable } from '@/lib/services/rag-service';
import { requireAuth, hasRole } from '@/lib/auth/server';

type ProviderStatus = {
  provider: string;
  configured: boolean;
  status: 'working' | 'quota_exceeded' | 'error' | 'not_configured';
  model?: string;
  error?: string;
  lastChecked?: string;
};

type StatusResponse = {
  providers: ProviderStatus[];
  summary: {
    total: number;
    working: number;
    quotaExceeded: number;
    notConfigured: number;
    recommended: string;
  };
  ragAvailable: boolean;
  timestamp: string;
};

// Cache status for 5 minutes to avoid excessive API calls
const statusCache = new Map<string, { data: StatusResponse; timestamp: number }>();
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
 * Authentication: Dev role required
 */
async function testOpenAI(): Promise<ProviderStatus> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  
  if (!apiKey) {
    return { provider: 'openrouter', configured: false, status: 'not_configured', error: 'API key not set' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Selfless CE'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4.1-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_completion_tokens: 5
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { provider: 'openrouter', configured: true, status: 'working', model: process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4.1-mini' };
    } else {
      const errorMessage = data.error?.message || 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('exceeded')) {
        return { provider: 'openrouter', configured: true, status: 'quota_exceeded', error: errorMessage };
      }
      return { provider: 'openrouter', configured: true, status: 'error', error: errorMessage };
    }
  } catch (error) {
    return { provider: 'openrouter', configured: true, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function GET(request: Request) {
  // Verify user is authenticated and is dev
  const user = await requireAuth();
  
  if (!hasRole(user, 'dev')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Dev role access required.' },
      { status: 403 }
    );
  }
  
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

  const results = await Promise.all([testOpenAI()]);

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
