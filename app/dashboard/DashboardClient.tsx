'use client';

import { useState, useEffect } from 'react';

export default function DashboardClient() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/metrics', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // If we get data (even if it's mock data), consider it online
          if (data && !data.error) {
            setStatus('online');
            setError(null);
          } else {
            // If there's an error in the response, still show online but with note
            setStatus('online');
            setError(data.error || 'Agent not configured');
          }
        } else {
          setStatus('offline');
          setError(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        setStatus('offline');
        setError(error.message || 'Connection failed');
        console.error('Agent status check failed:', error);
      }
    };

    // Check immediately
    checkStatus();
    // Then check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'loading') {
    return (
      <span className="text-gray-400 flex items-center gap-2">
        <span className="animate-spin w-2 h-2 border border-gray-400 border-t-transparent rounded-full"></span>
        Checking...
      </span>
    );
  }

  if (status === 'online') {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-green-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Online
        </span>
        {error && (
          <span className="text-xs text-yellow-600">({error})</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 flex items-center gap-2">
        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        Offline
      </span>
      {error && (
        <span className="text-xs text-red-600">({error})</span>
      )}
    </div>
  );
}

