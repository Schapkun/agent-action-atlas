
import { useState, useEffect } from 'react';

export const useWhatsAppConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setLastError(null);
    try {
      console.log('Checking WhatsApp connection...');
      const response = await fetch('https://whatsapp-backend-rney.onrender.com/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('WhatsApp status response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp status result:', result);
        setIsConnected(true);
        setConnectionDetails(result);
        setLastError(null);
      } else {
        const errorText = await response.text();
        setIsConnected(false);
        setLastError(`HTTP ${response.status}: ${errorText || 'Onbekende fout'}`);
        setConnectionDetails({ status: response.status, error: errorText });
      }
    } catch (error: any) {
      console.error('WhatsApp connection check failed:', error);
      setIsConnected(false);
      setLastError(error.message || 'Netwerkfout bij verbinden met WhatsApp API');
      setConnectionDetails({ error: error.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isChecking,
    checkConnection,
    lastError,
    connectionDetails
  };
};
