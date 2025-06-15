import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Register from '@/pages/Register';
import PendingTasks from '@/pages/PendingTasks';
import Actions from '@/pages/Actions';
import Documents from '@/pages/Documents';
import ActiveDossiers from '@/pages/ActiveDossiers';
import ClosedDossiers from '@/pages/ClosedDossiers';
import Invoices from '@/pages/Invoices';
import CreateInvoice from '@/pages/CreateInvoice';
import Quotes from '@/pages/Quotes';
import CreateQuote from '@/pages/CreateQuote';
import FactuurSturen from '@/pages/FactuurSturen';
import PhoneCalls from '@/pages/PhoneCalls';
import Emails from '@/pages/Emails';
import Contacts from '@/pages/Contacts';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Index><Dashboard /></Index>} />
              <Route path="/openstaande-taken" element={<Index><PendingTasks /></Index>} />
              <Route path="/ai-acties" element={<Index><Actions /></Index>} />
              <Route path="/documenten" element={<Index><Documents /></Index>} />
              <Route path="/actieve-dossiers" element={<Index><ActiveDossiers /></Index>} />
              <Route path="/gesloten-dossiers" element={<Index><ClosedDossiers /></Index>} />
              <Route path="/facturen" element={<Index><Invoices /></Index>} />
              <Route path="/facturen/opstellen" element={<Index><CreateInvoice /></Index>} />
              <Route path="/offertes" element={<Index><Quotes /></Index>} />
              <Route path="/offertes/opstellen" element={<Index><CreateQuote /></Index>} />
              <Route path="/factuursturen" element={<Index><FactuurSturen /></Index>} />
              <Route path="/telefoongesprekken" element={<Index><PhoneCalls /></Index>} />
              <Route path="/e-mails" element={<Index><Emails /></Index>} />
              <Route path="/contacten" element={<Index><Contacts /></Index>} />
              <Route path="/instellingen" element={<Index><Settings /></Index>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
