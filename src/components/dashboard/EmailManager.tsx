import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSelector } from './WorkspaceSelector';
import { EmailDetailDialog } from './EmailDetailDialog';
import { EmailDraftDialog } from './EmailDraftDialog';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Mail, 
  Folder, 
  Eye,
  Reply,
  Forward,
  Trash2,
  Star,
  StarOff,
  Plus,
  MailOpen,
  RefreshCw,
  Clock
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

export const EmailManager = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewEmailDialog, setShowNewEmailDialog] = useState(false);
  const { selectedOrganization, selectedWorkspace, getFilteredWorkspaces } = useOrganization();
  const { toast } = useToast();

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Mail },
    { id: 'sent', name: 'Verzonden', icon: MailOpen },
    { id: 'draft', name: 'Concepten', icon: Folder },
    { id: 'starred', name: 'Favorieten', icon: Star },
    { id: 'trash', name: 'Prullenbak', icon: Trash2 },
  ];

  const fetchEmails = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📧 Fetching emails for organization:', selectedOrganization.id);

      let query = supabase
        .from('emails')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('received_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      // Filter op folder
      if (selectedFolder === 'starred') {
        query = query.eq('is_flagged', true);
      } else if (selectedFolder !== 'inbox') {
        query = query.eq('folder', selectedFolder);
      } else {
        query = query.eq('folder', 'inbox');
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      console.log('📧 Emails fetched:', data?.length || 0);
      
      // Transform Supabase data to match our Email interface
      const transformedEmails: Email[] = (data || []).map(email => ({
        ...email,
        attachments: Array.isArray(email.attachments) ? email.attachments : []
      }));

      setEmails(transformedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: "Fout",
        description: "Kon e-mails niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshEmails = async () => {
    if (!selectedOrganization) return;

    setRefreshing(true);
    try {
      console.log('🔄 Refreshing emails...');
      await fetchEmails();
      toast({
        title: "E-mails bijgewerkt",
        description: "De e-maillijst is vernieuwd"
      });
    } catch (error) {
      console.error('Error refreshing emails:', error);
      toast({
        title: "Fout",
        description: "Kon e-mails niet verversen",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Real-time subscription voor nieuwe emails
  useEffect(() => {
    if (!selectedOrganization) return;

    console.log('📡 Setting up real-time email subscription for org:', selectedOrganization.id);

    const channel = supabase
      .channel('emails-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `organization_id=eq.${selectedOrganization.id}`
        },
        (payload) => {
          console.log('📧 New email received via real-time:', payload.new);
          const newEmail = payload.new as Email;
          
          // Transform attachments
          const transformedEmail = {
            ...newEmail,
            attachments: Array.isArray(newEmail.attachments) ? newEmail.attachments : []
          };
          
          // Check if email matches current folder filter
          const matchesFolder = 
            selectedFolder === 'inbox' && transformedEmail.folder === 'inbox' ||
            selectedFolder === 'starred' && transformedEmail.is_flagged ||
            selectedFolder === transformedEmail.folder;
          
          if (matchesFolder) {
            setEmails(prevEmails => [transformedEmail, ...prevEmails]);
            toast({
              title: "Nieuwe e-mail ontvangen",
              description: `Van: ${transformedEmail.from_email}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emails',
          filter: `organization_id=eq.${selectedOrganization.id}`
        },
        (payload) => {
          console.log('📧 Email updated via real-time:', payload.new);
          const updatedEmail = payload.new as Email;
          
          setEmails(prevEmails => 
            prevEmails.map(email => 
              email.id === updatedEmail.id 
                ? { ...updatedEmail, attachments: Array.isArray(updatedEmail.attachments) ? updatedEmail.attachments : [] }
                : email
            )
          );
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up email real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedOrganization, selectedFolder, toast]);

  useEffect(() => {
    fetchEmails();
  }, [selectedOrganization, selectedWorkspace, selectedFolder]);

  const filteredEmails = emails.filter(email =>
    searchTerm === '' || 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.to_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setShowDetailDialog(true);
    
    // Markeer als gelezen
    if (!email.is_read) {
      markAsRead(email.id);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true, status: 'read' })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { ...email, is_read: true, status: 'read' }
          : email
      ));
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const toggleStar = async (emailId: string, isStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_flagged: !isStarred })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { ...email, is_flagged: !isStarred }
          : email
      ));

      toast({
        title: !isStarred ? "Toegevoegd aan favorieten" : "Verwijderd uit favorieten",
        description: "E-mail status bijgewerkt"
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Fout",
        description: "Kon e-mail status niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const handleCreateEmail = () => {
    if (!selectedOrganization && !selectedWorkspace) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst een organisatie of werkruimte om een e-mail te maken.",
        variant: "destructive",
      });
      return;
    }

    if (selectedOrganization && !selectedWorkspace) {
      const workspaces = getFilteredWorkspaces();
      if (workspaces.length > 1) {
        setShowWorkspaceSelector(true);
        return;
      } else if (workspaces.length === 1) {
        setShowNewEmailDialog(true);
        return;
      }
    }

    setShowNewEmailDialog(true);
  };

  const createEmailInWorkspace = (workspaceId: string) => {
    setShowNewEmailDialog(true);
    setShowWorkspaceSelector(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const unreadCount = emails.filter(email => !email.is_read).length;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">E-mail Manager</h1>
              <p className="text-muted-foreground">
                Beheer inkomende e-mails
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={refreshEmails}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Vernieuwen...' : 'Vernieuwen'}
              </Button>
              
              <Button onClick={handleCreateEmail}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe E-mail
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek e-mails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {(selectedOrganization || selectedWorkspace) && (
              <div className="text-sm text-gray-600">
                Context: {getContextInfo()}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folder Structure */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                E-mail Folders
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} nieuw</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedOrganization && !selectedWorkspace ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecteer een organisatie of werkruimte</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {folders.map((folder) => {
                    const Icon = folder.icon;
                    const folderEmails = folder.id === 'starred' 
                      ? emails.filter(e => e.is_flagged)
                      : emails.filter(e => e.folder === folder.id);
                    const folderUnreadCount = folderEmails.filter(e => !e.is_read).length;
                    
                    return (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-gray-100 ${
                          selectedFolder === folder.id ? 'bg-blue-100 text-blue-800' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{folder.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {folderUnreadCount > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {folderUnreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">
                E-mails {selectedFolder !== 'inbox' && `- ${folders.find(f => f.id === selectedFolder)?.name}`}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8">E-mails laden...</div>
              ) : !selectedOrganization && !selectedWorkspace ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecteer een organisatie of werkruimte om e-mails te bekijken</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Geen e-mails gevonden</p>
                  <p className="text-sm mt-2">
                    E-mails van externe bronnen verschijnen hier automatisch
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        !email.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600 font-medium">Onderwerp:</span>
                            <span className={`font-medium ${!email.is_read ? 'font-bold' : ''}`}>
                              {email.subject || 'Geen onderwerp'}
                            </span>
                            {email.has_attachments && (
                              <Badge variant="outline" className="text-xs">
                                📎
                              </Badge>
                            )}
                            <Badge variant="outline" className={getPriorityColor(email.priority)}>
                              {email.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            Van: {email.from_email}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {email.content || email.body_text || 'Geen inhoud'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(email.id, email.is_flagged);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {email.is_flagged ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <div className="text-xs text-gray-400 flex flex-col items-end">
                            <div>{formatDate(email.received_at || email.created_at)}</div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(email.received_at || email.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={createEmailInWorkspace}
        title="Selecteer werkruimte voor nieuwe e-mail"
        description="Kies in welke werkruimte de e-mail moet worden aangemaakt:"
      />

      <EmailDetailDialog
        email={selectedEmail}
        isOpen={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedEmail(null);
        }}
        onReply={(email) => {
          console.log('Reply to:', email.from_email);
          toast({
            title: "Antwoorden",
            description: `Bezig met voorbereiden van antwoord naar ${email.from_email}...`
          });
        }}
        onForward={(email) => {
          console.log('Forward:', email.subject);
          toast({
            title: "Doorsturen", 
            description: `Bezig met voorbereiden van doorsturen: ${email.subject}...`
          });
        }}
      />

      <EmailDraftDialog
        task={null}
        isOpen={showNewEmailDialog}
        onClose={() => setShowNewEmailDialog(false)}
        onEmailSent={() => {
          setShowNewEmailDialog(false);
          refreshEmails();
        }}
      />
    </>
  );
};
