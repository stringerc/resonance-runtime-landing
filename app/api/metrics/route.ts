import { NextResponse } from 'next/server';

interface ParsedMetrics {
  R: number | null;
  K: number | null;
  spectralEntropy: number | null;
  mode: string | null;
  modeValue: number | null;
  p99Latency: number | null;
  p50Latency: number | null;
  coherenceScore: number | null;
  tailHealthScore: number | null;
  timingScore: number | null;
  lambdaRes: number | null;
  gpd: {
    xi: number | null;
    sigma: number | null;
    threshold: number | null;
  } | null;
  tailQuantiles: {
    q99: number | null;
    q99_9: number | null;
  } | null;
  version?: string | null;
  releaseChannel?: string | null;
}

interface MetricsResponsePayload extends ParsedMetrics {
  R: number;
  K: number;
  spectralEntropy: number;
  mode: string;
  modeValue: number | null;
  p99Latency: number | null;
  p50Latency: number | null;
  timestamp: string;
  agentUrl: string;
  agentConnected: boolean;
  environment: 'production' | 'development';
  latencyImprovement?: number | null;
  error?: string;
  mock?: boolean;
  agentVersion?: string | null;
  releaseChannel?: string | null;
  buildCommit?: string | null;
}

type HealthResponse = {
  resonance?: Record<string, unknown>;
  timestamp?: string;
  [key: string]: unknown;
};

const toNumber = (value: string | number | null | undefined): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toInteger = (value: string | number | null | undefined): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Proxy to Prometheus/Agent metrics
export async function GET() {
  // Determine if we're in production (Vercel) or local development
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  
  // In production, agent URLs need to be publicly accessible
  // For local development, use localhost
  const agentHealthUrl = process.env.RESONANCE_AGENT_URL || 
    (isProduction ? null : 'http://localhost:18080/health');
  const agentMetricsUrl = process.env.RESONANCE_METRICS_URL || 
    (isProduction ? null : 'http://localhost:19090/metrics');
  
  try {
    
    // If no agent URL configured in production, return mock data
    if (isProduction && !agentHealthUrl) {
      return NextResponse.json({
        R: 0.5,
        K: 0.3,
        spectralEntropy: 0.5,
        mode: 'adaptive',
        modeValue: 2,
        timestamp: new Date().toISOString(),
        error: 'Agent URL not configured. Set RESONANCE_AGENT_URL in Vercel environment variables.',
        agentUrl: 'Not configured',
        agentConnected: false,
        environment: 'production',
        mock: true,
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    // Fetch health endpoint (skip if no URL)
    if (!agentHealthUrl) {
      throw new Error('Agent URL not configured');
    }
    
    // Build headers with API key if configured
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    // Add API key if configured (for protected endpoints)
    const apiKey = process.env.RESONANCE_API_KEY;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const healthResponse = await fetch(agentHealthUrl, {
      cache: 'no-store',
      headers,
    });

    if (!healthResponse.ok) {
      throw new Error('Agent health endpoint not accessible');
    }

    const healthData = (await healthResponse.json()) as HealthResponse;

    // Fetch metrics endpoint
    let metricsData: ParsedMetrics | null = null;
    try {
      if (!agentMetricsUrl) {
        throw new Error('Metrics URL not configured');
      }
      
      // Metrics endpoint requires API key
      const metricsHeaders: HeadersInit = {};
      const apiKey = process.env.RESONANCE_API_KEY;
      if (apiKey) {
        metricsHeaders['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const metricsResponse = await fetch(agentMetricsUrl, {
        cache: 'no-store',
        headers: metricsHeaders,
      });

      if (metricsResponse.ok) {
        const metricsText = await metricsResponse.text();
        
        // Parse Prometheus metrics
        const RMatch = metricsText.match(/resonance_R\s+([\d.]+)/);
        const KMatch = metricsText.match(/resonance_K\s+([\d.]+)/);
        const entropyMatch = metricsText.match(/resonance_spectral_entropy\s+([\d.]+)/);
        const modeMatch = metricsText.match(/resonance_mode\{value="(\w+)"\}\s+(\d+)/);
        // Try to parse latency metrics (common Prometheus patterns)
        const p99Match = metricsText.match(/resonance_p99_latency_ms\s+([\d.]+)/) || 
                         metricsText.match(/latency_p99\s+([\d.]+)/) ||
                         metricsText.match(/p99_latency_ms\s+([\d.]+)/);
        const p50Match = metricsText.match(/resonance_p50_latency_ms\s+([\d.]+)/) ||
                         metricsText.match(/latency_p50\s+([\d.]+)/) ||
                         metricsText.match(/p50_latency_ms\s+([\d.]+)/);
        
        // Parse Resonance Calculus metrics
        const coherenceScoreMatch = metricsText.match(/resonance_coherence_score\s+([\d.]+)/);
        const tailHealthScoreMatch = metricsText.match(/resonance_tail_health_score\s+([\d.]+)/);
        const timingScoreMatch = metricsText.match(/resonance_timing_score\s+([\d.]+)/);
        const lambdaResMatch = metricsText.match(/resonance_lambda_res\s+([\d.\-]+)/);
        const gpdXiMatch = metricsText.match(/resonance_gpd_xi\s+([\d.\-]+)/);
        const gpdSigmaMatch = metricsText.match(/resonance_gpd_sigma\s+([\d.]+)/);
        const gpdThresholdMatch = metricsText.match(/resonance_gpd_threshold\s+([\d.]+)/);
        const tailQ99Match = metricsText.match(/resonance_tail_q99\s+([\d.]+)/);
        const tailQ99_9Match = metricsText.match(/resonance_tail_q99_9\s+([\d.]+)/);

        metricsData = {
          R: toNumber(RMatch?.[1]),
          K: toNumber(KMatch?.[1]),
          spectralEntropy: toNumber(entropyMatch?.[1]),
          mode: modeMatch ? modeMatch[1] : null,
          modeValue: toInteger(modeMatch?.[2]),
          p99Latency: toNumber(p99Match?.[1]),
          p50Latency: toNumber(p50Match?.[1]),
          // Resonance Calculus metrics (optional)
          coherenceScore: toNumber(coherenceScoreMatch?.[1]),
          tailHealthScore: toNumber(tailHealthScoreMatch?.[1]),
          timingScore: toNumber(timingScoreMatch?.[1]),
          lambdaRes: toNumber(lambdaResMatch?.[1]),
          gpd: (gpdXiMatch || gpdSigmaMatch || gpdThresholdMatch) ? {
            xi: toNumber(gpdXiMatch?.[1]),
            sigma: toNumber(gpdSigmaMatch?.[1]),
            threshold: toNumber(gpdThresholdMatch?.[1]),
          } : null,
          tailQuantiles: (tailQ99Match || tailQ99_9Match) ? {
            q99: toNumber(tailQ99Match?.[1]),
            q99_9: toNumber(tailQ99_9Match?.[1]),
          } : null,
          version: null,
          releaseChannel: null,
        };
      }
    } catch {
      console.warn('Metrics endpoint not accessible, using health data only');
    }

    // Combine health and metrics data
    const resonanceData = (healthData.resonance ?? {}) as Record<string, unknown>;

    const derivedMode =
      metricsData?.mode ??
      (typeof resonanceData.mode === 'string' ? (resonanceData.mode as string) : 'adaptive');

    const derivedModeValue =
      metricsData?.modeValue ??
      toInteger(resonanceData.modeValue as string | number | null | undefined) ??
      (derivedMode === 'adaptive' ? 2 : 1);

    const inferredVersion =
      (typeof (resonanceData.version ?? resonanceData.agentVersion) === 'string'
        ? (resonanceData.version ?? resonanceData.agentVersion)
        : null) ??
      metricsData?.version ??
      process.env.RESONANCE_AGENT_VERSION ??
      null;

    const inferredChannel =
      (typeof (resonanceData.releaseChannel ?? resonanceData.channel ?? resonanceData.mode) === 'string'
        ? (resonanceData.releaseChannel ?? resonanceData.channel ?? (resonanceData.mode as string))
        : null) ??
      metricsData?.releaseChannel ??
      process.env.RESONANCE_RELEASE_CHANNEL ??
      derivedMode;

    const inferredCommit =
      typeof (resonanceData.commit ?? resonanceData.gitCommit ?? resonanceData.gitHash) === 'string'
        ? ((resonanceData.commit ?? resonanceData.gitCommit ?? resonanceData.gitHash) as string)
        : process.env.RESONANCE_AGENT_COMMIT ?? null;

    const response: MetricsResponsePayload = {
      R: metricsData?.R ?? toNumber(resonanceData.R as string | number | null | undefined) ?? 0.5,
      K: metricsData?.K ?? toNumber(resonanceData.K as string | number | null | undefined) ?? 0.3,
      spectralEntropy:
        metricsData?.spectralEntropy ??
        toNumber(resonanceData.entropy as string | number | null | undefined) ??
        0.5,
      mode: derivedMode,
      modeValue: derivedModeValue,
      p99Latency:
        metricsData?.p99Latency ??
        toNumber(resonanceData.p99Latency as string | number | null | undefined),
      p50Latency:
        metricsData?.p50Latency ??
        toNumber(resonanceData.p50Latency as string | number | null | undefined),
      timestamp:
        (typeof healthData.timestamp === 'string' ? healthData.timestamp : null) ??
        new Date().toISOString(),
      agentUrl: agentHealthUrl,
      agentConnected: true,
      environment: isProduction ? 'production' : 'development',
      // Resonance Calculus metrics (optional, for backward compatibility)
      coherenceScore: metricsData?.coherenceScore ?? null,
      tailHealthScore: metricsData?.tailHealthScore ?? null,
      timingScore: metricsData?.timingScore ?? null,
      lambdaRes: metricsData?.lambdaRes ?? null,
      gpd: metricsData?.gpd ?? null,
      tailQuantiles: metricsData?.tailQuantiles ?? null,
      agentVersion: inferredVersion,
      releaseChannel: inferredChannel,
      buildCommit: inferredCommit,
    };

    // Calculate latency improvement if we have latency data
    if (response.p99Latency && response.p99Latency > 0) {
      // This would ideally compare against baseline, for now show a placeholder
      response.latencyImprovement = response.R >= 0.35 && response.R <= 0.65 ? 12 : null;
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching metrics:', error);
    
    // Return default/mock data if agent is not accessible
    return NextResponse.json({
      R: 0.5,
      K: 0.3,
      spectralEntropy: 0.5,
      mode: 'adaptive',
      modeValue: 2,
      timestamp: new Date().toISOString(),
      error: 'Agent not accessible, showing mock data',
      agentUrl: agentHealthUrl || 'Not configured',
      agentConnected: false,
      environment: isProduction ? 'production' : 'development',
      mock: true,
      agentVersion: process.env.RESONANCE_AGENT_VERSION ?? null,
      releaseChannel: process.env.RESONANCE_RELEASE_CHANNEL ?? 'adaptive',
      buildCommit: process.env.RESONANCE_AGENT_COMMIT ?? null,
    }, {
      status: 200, // Still return 200 so UI can show mock data
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}

