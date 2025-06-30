
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';

export const ConnectionStatus = () => {
  const { isConnected, isChecking, checkConnection, lastError, connectionDetails } = useWhatsAppConnection();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Verbonden
          </Badge>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Badge variant="secondary" className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Niet verbonden
              </Badge>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Verbindingsdetails
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <p className="text-sm text-red-600">Niet verbonden met WhatsApp API</p>
                </div>
                
                {lastError && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Laatste fout</h4>
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded border break-words">
                      {lastError}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mogelijke oorzaken</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
                    <li>WhatsApp API service is offline</li>
                    <li>Bearer token ontbreekt of is ongeldig</li>
                    <li>API endpoint is niet bereikbaar</li>
                    <li>Netwerkverbinding problemen</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Aanbevolen acties</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
                    <li>Controleer de Bearer token in de webhook instellingen</li>
                    <li>Verifieer dat de WhatsApp API service actief is</li>
                    <li>Test de verbinding opnieuw</li>
                  </ul>
                </div>
                
                {connectionDetails && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technische details</h4>
                    <div className="text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-32">
                      <pre className="break-words whitespace-pre-wrap">
                        {JSON.stringify(connectionDetails, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
