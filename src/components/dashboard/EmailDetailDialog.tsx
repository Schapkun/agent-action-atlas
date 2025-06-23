
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Reply, 
  Forward, 
  Star, 
  StarOff, 
  Paperclip,
  Calendar,
  User,
  Mail
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
  client_id?: string;
  dossier_id?: string;
  message_id?: string;
  thread_id?: string;
  in_reply_to?: string;
  email_references?: string;
}

interface EmailDetailDialogProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
}

export const EmailDetailDialog = ({ 
  email, 
  isOpen, 
  onClose, 
  onReply, 
  onForward 
}: EmailDetailDialogProps) => {
  if (!email) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {email.subject || 'Geen onderwerp'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email metadata */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getPriorityColor(email.priority)}>
                  {email.priority}
                </Badge>
                {email.is_flagged && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Favoriet
                  </Badge>
                )}
                {email.has_attachments && (
                  <Badge variant="outline">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Bijlagen ({email.attachments?.length || 0})
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={onReply} variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-2" />
                  Antwoorden
                </Button>
                <Button onClick={onForward} variant="outline" size="sm">
                  <Forward className="h-4 w-4 mr-2" />
                  Doorsturen
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Van:</span>
                  <span>{email.from_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Aan:</span>
                  <span>{email.to_email}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Ontvangen:</span>
                  <span>{formatDate(email.received_at || email.created_at)}</span>
                </div>
                {email.message_id && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">Message ID:</span>
                    <span className="truncate">{email.message_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {email.has_attachments && email.attachments && email.attachments.length > 0 && (
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Bijlagen ({email.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm truncate">
                      {attachment.name || attachment.filename || `Bijlage ${index + 1}`}
                    </span>
                    {attachment.size && (
                      <span className="text-xs text-gray-500">
                        ({Math.round(attachment.size / 1024)}KB)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email content */}
          <ScrollArea className="h-96 w-full">
            <div className="pr-4">
              {email.body_html ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: email.body_html }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm">
                  {email.body_text || email.content || 'Geen inhoud beschikbaar'}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Technical details (collapsible) */}
          {email.message_id && (
            <details className="border-t pt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                Technische details
              </summary>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                {email.message_id && (
                  <div><strong>Message ID:</strong> {email.message_id}</div>
                )}
                {email.thread_id && (
                  <div><strong>Thread ID:</strong> {email.thread_id}</div>
                )}
                {email.in_reply_to && (
                  <div><strong>In Reply To:</strong> {email.in_reply_to}</div>
                )}
                <div><strong>Folder:</strong> {email.folder}</div>
                <div><strong>Status:</strong> {email.status}</div>
              </div>
            </details>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
