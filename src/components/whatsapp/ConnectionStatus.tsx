
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';

export const ConnectionStatus = () => {
  const { isConnected, isChecking, checkConnection } = useWhatsAppConnection();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Verbonden
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            Niet verbonden
          </Badge>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={checkConnection}
        disabled={isChecking}
        className="h-6 px-2"
      >
        <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
