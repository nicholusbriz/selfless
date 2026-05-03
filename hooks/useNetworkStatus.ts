import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: string;
  rtt: number;
  saveData: boolean;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 'unknown',
    rtt: 0,
    saveData: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        isOffline: !navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink ? `${connection.downlink}Mbps` : 'unknown',
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
      });
    };

    // Initial status
    updateNetworkStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🟢 Network: Online');
      updateNetworkStatus();
    };

    const handleOffline = () => {
      console.log('🔴 Network: Offline');
      updateNetworkStatus();
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      console.log('🌐 Network: Connection changed');
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkStatus;
}
