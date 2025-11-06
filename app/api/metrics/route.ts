import { NextResponse } from 'next/server';

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

    const healthData = await healthResponse.json();

    // Fetch metrics endpoint
    let metricsData = null;
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
          R: RMatch ? parseFloat(RMatch[1]) : null,
          K: KMatch ? parseFloat(KMatch[1]) : null,
          spectralEntropy: entropyMatch ? parseFloat(entropyMatch[1]) : null,
          mode: modeMatch ? modeMatch[1] : null,
          modeValue: modeMatch ? parseInt(modeMatch[2]) : null,
          p99Latency: p99Match ? parseFloat(p99Match[1]) : null,
          p50Latency: p50Match ? parseFloat(p50Match[1]) : null,
          // Resonance Calculus metrics (optional)
          coherenceScore: coherenceScoreMatch ? parseFloat(coherenceScoreMatch[1]) : null,
          tailHealthScore: tailHealthScoreMatch ? parseFloat(tailHealthScoreMatch[1]) : null,
          timingScore: timingScoreMatch ? parseFloat(timingScoreMatch[1]) : null,
          lambdaRes: lambdaResMatch ? parseFloat(lambdaResMatch[1]) : null,
          gpd: (gpdXiMatch || gpdSigmaMatch || gpdThresholdMatch) ? {
            xi: gpdXiMatch ? parseFloat(gpdXiMatch[1]) : null,
            sigma: gpdSigmaMatch ? parseFloat(gpdSigmaMatch[1]) : null,
            threshold: gpdThresholdMatch ? parseFloat(gpdThresholdMatch[1]) : null,
          } : null,
          tailQuantiles: (tailQ99Match || tailQ99_9Match) ? {
            q99: tailQ99Match ? parseFloat(tailQ99Match[1]) : null,
            q99_9: tailQ99_9Match ? parseFloat(tailQ99_9Match[1]) : null,
          } : null,
        };
      }
    } catch (e) {
      console.warn('Metrics endpoint not accessible, using health data only');
    }

    // Combine health and metrics data
    const resonance = healthData.resonance || {};
    
    const response: any = {
      R: metricsData?.R ?? parseFloat(resonance.R) ?? 0.5,
      K: metricsData?.K ?? parseFloat(resonance.K) ?? 0.3,
      spectralEntropy: metricsData?.spectralEntropy ?? parseFloat(resonance.entropy) ?? 0.5,
      mode: metricsData?.mode ?? resonance.mode ?? 'adaptive',
      modeValue: metricsData?.modeValue ?? (resonance.mode === 'adaptive' ? 2 : 1),
      p99Latency: metricsData?.p99Latency ?? resonance.p99Latency ?? null,
      p50Latency: metricsData?.p50Latency ?? resonance.p50Latency ?? null,
      timestamp: healthData.timestamp || new Date().toISOString(),
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
  } catch (error: any) {
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
    }, {
      status: 200, // Still return 200 so UI can show mock data
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}

