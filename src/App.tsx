
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Contacts from '@/pages/Contacts';
import Invoices from '@/pages/Invoices';
import CreateInvoice from '@/pages/CreateInvoice';
import Quotes from '@/pages/Quotes';
import CreateQuote from '@/pages/CreateQuote';
import Documents from '@/pages/Documents';
import CreateDocument from '@/pages/CreateDocument';
import Actions from '@/pages/Actions';
import ActiveDossiers from '@/pages/ActiveDossiers';
import ClosedDossiers from '@/pages/ClosedDossiers';
import PendingTasks from '@/pages/PendingTasks';
import PhoneCalls from '@/pages/PhoneCalls';
import Emails from '@/pages/Emails';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes with layout */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/contacten" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Contacts />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/facturen" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Invoices />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/facturen/nieuw" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <CreateInvoice />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/offertes" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Quotes />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/offertes/nieuw" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <CreateQuote />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/documenten" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Documents />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/documenten/nieuw" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <CreateDocument />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/acties" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Actions />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dossiers" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <ActiveDossiers />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dossiers/gesloten" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <ClosedDossiers />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/taken" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <PendingTasks />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/gesprekken" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <PhoneCalls />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/emails" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Emails />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/instellingen" element={
                  <ProtectedRoute>
                    <AppLayout 
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={handleMobileMenuToggle}
                    >
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Responsive app layout component
interface AppLayoutProps {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, isMobileMenuOpen, onMobileMenuToggle }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileToggle={onMobileMenuToggle} 
      />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header onMobileMenuToggle={onMobileMenuToggle} />
        
        {/* Page content with responsive padding */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
