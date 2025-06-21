
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Documents = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the settings templates tab
    navigate('/instellingen?tab=templates');
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Doorverwijzen naar template beheer...</p>
      </div>
    </div>
  );
};

export default Documents;
