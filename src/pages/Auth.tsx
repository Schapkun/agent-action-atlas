
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">meester.app</h1>
          <p className="text-muted-foreground">Inloggen op je account</p>
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
          onlyThirdPartyProviders={false}
          magicLink={true}
          showLinks={true}
          localization={{
            variables: {
              sign_up: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                email_input_placeholder: 'Je e-mailadres',
                password_input_placeholder: 'Je wachtwoord',
                button_label: 'Registreren',
                loading_button_label: 'Registreren...',
                social_provider_text: 'Registreer met {{provider}}',
                link_text: 'Nog geen account? Registreer hier',
                confirmation_text: 'Controleer je e-mail voor de bevestigingslink'
              },
              sign_in: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                email_input_placeholder: 'Je e-mailadres',
                password_input_placeholder: 'Je wachtwoord',
                button_label: 'Inloggen',
                loading_button_label: 'Inloggen...',
                social_provider_text: 'Inloggen met {{provider}}',
                link_text: 'Heb je al een account? Login hier'
              },
              magic_link: {
                email_input_label: 'E-mailadres',
                email_input_placeholder: 'je@meester.app',
                button_label: 'Verstuur magic link',
                loading_button_label: 'Magic link versturen...',
                link_text: 'Verstuur een magic link e-mail',
                confirmation_text: 'Controleer je e-mail voor de magic link'
              },
              forgotten_password: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                email_input_placeholder: 'je@meester.app',
                button_label: 'Verstuur wachtwoord reset instructies',
                loading_button_label: 'Instructies versturen...',
                link_text: 'Wachtwoord vergeten?',
                confirmation_text: 'Controleer je e-mail voor de wachtwoord reset link'
              },
              update_password: {
                password_label: 'Nieuw wachtwoord',
                password_input_placeholder: 'Je nieuwe wachtwoord',
                button_label: 'Wachtwoord bijwerken',
                loading_button_label: 'Wachtwoord bijwerken...',
                confirmation_text: 'Je wachtwoord is bijgewerkt'
              },
              verify_otp: {
                email_input_label: 'E-mailadres',
                email_input_placeholder: 'je@meester.app',
                phone_input_label: 'Telefoonnummer',
                phone_input_placeholder: 'Je telefoonnummer',
                token_input_label: 'Verificatiecode',
                token_input_placeholder: 'Je verificatiecode',
                button_label: 'Verifieer code',
                loading_button_label: 'Verifiëren...'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
