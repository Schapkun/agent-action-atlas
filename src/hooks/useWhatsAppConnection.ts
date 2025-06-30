
import { useState, useEffect } from 'react';

export const useWhatsAppConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
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
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('WhatsApp connection check failed:', error);
      setIsConnected(false);
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
    checkConnection
  };
};
