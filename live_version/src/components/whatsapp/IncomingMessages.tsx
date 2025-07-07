
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Clock, Check } from 'lucide-react';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export const IncomingMessages = () => {
  const { messages, loading, markAsRead } = useWhatsAppMessages();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Inkomende Berichten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Berichten laden...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Inkomende Berichten ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-gray-500">Nog geen berichten ontvangen</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 border rounded-lg ${
                  message.status === 'received' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {message.profile_name || message.from_number}
                    </span>
                    {message.status === 'received' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Nieuw
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(message.timestamp), { 
                      addSuffix: true, 
                      locale: nl 
                    })}
                  </div>
                </div>
                
                <p className="text-gray-900 mb-2">{message.message_body}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Van: {message.from_number}
                  </span>
                  
                  {message.status === 'received' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(message.id)}
                      className="h-7 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Markeren als gelezen
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
