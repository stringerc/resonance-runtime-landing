'use client';

import { useState, useEffect } from 'react';

export default function DashboardClient() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (status === 'loading') {
    return <span className="text-gray-400">Checking...</span>;
  }

  if (status === 'online') {
    return (
      <span className="text-green-600 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Online
      </span>
    );
  }

  return (
    <span className="text-gray-400 flex items-center gap-2">
      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
      Offline
    </span>
  );
}

