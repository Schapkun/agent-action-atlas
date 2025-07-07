
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Calendar, 
  User, 
  X,
  Star,
  Paperclip,
  MessageSquare,
  Reply,
  Forward
} from 'lucide-react';

interface Email {
  id: string;
  subject: string;
  from_email: string;
  to_email: string;
  content: string;
  body_html?: string;
  body_text?: string;
  status: string;
  priority: string;
  is_read: boolean;
  is_flagged: boolean;
  has_attachments: boolean;
  attachments: any[];
  folder: string;
  received_at: string;
  created_at: string;
  headers?: any;
}

interface EmailViewDialogProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
}

export const EmailViewDialog = ({ email, isOpen, onClose, onReply, onForward }: EmailViewDialogProps) => {
  if (!email) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Hoog</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600">Gemiddeld</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-green-600">Laag</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="outline" className="text-blue-600">Ongelezen</Badge>;
      case 'read':
        return <Badge variant="outline" className="text-green-600">Gelezen</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-purple-600">Verzonden</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const emailContent = email.body_html || email.content || email.body_text || 'Geen inhoud beschikbaar';
  const isHtmlContent = !!email.body_html;

  const handleReply = () => {
    if (onReply) {
      onReply(email);
    }
  };

  const handleForward = () => {
    if (onForward) {
      onForward(email);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {email.subject || 'Geen onderwerp'}
            {email.is_flagged && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPriorityBadge(email.priority)}
                {getStatusBadge(email.status)}
              </div>
              
              <div className="flex gap-2">
                {onReply && (
                  <Button onClick={handleReply} variant="outline" size="sm">
                    <Reply className="h-4 w-4 mr-2" />
                    Antwoorden
                  </Button>
                )}
                {onForward && (
                  <Button onClick={handleForward} variant="outline" size="sm">
                    <Forward className="h-4 w-4 mr-2" />
                    Doorsturen
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Van:</span>
                <span>{email.from_email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Naar:</span>
                <span>{email.to_email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Ontvangen:</span>
                <span>{formatDate(email.received_at)}</span>
              </div>
              
              {email.has_attachments && (
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Bijlagen:</span>
                  <span>{email.attachments?.length || 0}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Bericht:</label>
            </div>
            <ScrollArea className="max-h-[400px] w-full border rounded-lg p-4">
              {isHtmlContent ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailContent }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm">
                  {emailContent}
                </div>
              )}
            </ScrollArea>
          </div>

          {email.has_attachments && email.attachments && email.attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Bijlagen</label>
              <div className="border rounded-lg p-3">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-4 w-4" />
                    <span>{attachment.name || `Bijlage ${index + 1}`}</span>
                    {attachment.size && (
                      <span className="text-gray-500">({attachment.size})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Sluiten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
