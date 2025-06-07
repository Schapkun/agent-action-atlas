
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Check for invitation token in URL
  useEffect(() => {
    const inviteEmail = searchParams.get('email');
    const token = searchParams.get('token');
    
    console.log('Registration page - email from URL:', inviteEmail);
    console.log('Registration page - token from URL:', token);
    
    if (inviteEmail && token) {
      // Clean up the email in case there are any URL artifacts
      const cleanEmail = inviteEmail.split('?')[0];
      setEmail(cleanEmail);
      setInvitationToken(token);
      
      // Verify the invitation is still valid
      verifyInvitation(cleanEmail, token);
    } else if (inviteEmail) {
      // Fallback for old invitation links without token
      const cleanEmail = inviteEmail.split('?')[0];
      setEmail(cleanEmail);
    } else {
      // If no email in URL, redirect to login page
      toast({
        title: "Geen uitnodiging gevonden",
        description: "Je hebt een geldige uitnodiging nodig om een account aan te maken.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [searchParams, navigate, toast]);

  const verifyInvitation = async (email: string, token: string) => {
    try {
      console.log('Verifying invitation for:', email, 'with token:', token);
      
      const { data: invitation, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('email', email)
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !invitation) {
        console.error('Invalid or expired invitation:', error);
        toast({
          title: "Ongeldige uitnodiging",
          description: "Deze uitnodiging is verlopen of ongeldig. Vraag om een nieuwe uitnodiging.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      console.log('Valid invitation found:', invitation);
    } catch (error) {
      console.error('Error verifying invitation:', error);
      toast({
        title: "Fout bij verificatie",
        description: "Kon de uitnodiging niet verifiëren. Probeer opnieuw.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting registration process for:', email);

      // First, let's check if there's a valid invitation
      if (invitationToken) {
        const { data: invitation, error: invitationError } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('email', email)
          .eq('token', invitationToken)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (invitationError || !invitation) {
          console.error('Invitation verification failed:', invitationError);
          toast({
            title: "Uitnodiging ongeldig",
            description: "De uitnodiging is verlopen of ongeldig.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Invitation verified, proceeding with signup');
      }

      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account bestaat al",
            description: "Dit e-mailadres heeft al een account. Probeer in te loggen.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registratie mislukt",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        console.log('Signup successful, marking invitation as accepted');
        
        // Mark the invitation as accepted if we have a token
        if (invitationToken) {
          try {
            const { error: updateError } = await supabase
              .from('user_invitations')
              .update({ 
                accepted_at: new Date().toISOString()
              })
              .eq('email', email)
              .eq('token', invitationToken);

            if (updateError) {
              console.error('Error updating invitation:', updateError);
            } else {
              console.log('Invitation marked as accepted');
            }
          } catch (updateError) {
            console.error('Error updating invitation status:', updateError);
          }
        }

        toast({
          title: "Account aangemaakt",
          description: "Check je e-mail om je account te verifiëren.",
        });
        
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Meester.ai</span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              Account aanmaken
            </h1>
            <p className="text-muted-foreground mt-2">
              Maak een account aan om de uitnodiging te accepteren
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Volledige naam</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jan van der Berg"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  className="pl-10 bg-muted cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                E-mailadres uit de uitnodiging
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Bezig...' : 'Account aanmaken'}
            </Button>
          </form>

          {/* Login link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
            >
              Al een account? Inloggen
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;
