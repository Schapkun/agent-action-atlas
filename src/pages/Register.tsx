
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
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
          <p className="text-muted-foreground">Maak een nieuw account aan</p>
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          view="sign_up"
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
          magicLink={false}
          showLinks={true}
          localization={{
            variables: {
              sign_up: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                email_input_placeholder: 'je@meester.app',
                password_input_placeholder: 'Kies een sterk wachtwoord',
                button_label: 'Account aanmaken',
                loading_button_label: 'Account aanmaken...',
                social_provider_text: 'Registreer met {{provider}}',
                link_text: 'Heb je al een account? Login hier',
                confirmation_text: 'Controleer je e-mail voor de bevestigingslink'
              },
              sign_in: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                email_input_placeholder: 'je@meester.app',
                password_input_placeholder: 'Je wachtwoord',
                button_label: 'Inloggen',
                loading_button_label: 'Inloggen...',
                social_provider_text: 'Inloggen met {{provider}}',
                link_text: 'Nog geen account? Registreer hier'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Register;
