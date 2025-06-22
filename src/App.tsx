
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";

// Import all pages
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import PendingTasks from "./pages/PendingTasks";
import Actions from "./pages/Actions";
import Documents from "./pages/Documents";
import CreateDocument from "./pages/CreateDocument";
import ActiveDossiers from "./pages/ActiveDossiers";
import ClosedDossiers from "./pages/ClosedDossiers";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import FactuurSturen from "./pages/FactuurSturen";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import PhoneCalls from "./pages/PhoneCalls";
import Emails from "./pages/Emails";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              
              {/* Main app routes - all wrapped in Index for layout */}
              <Route path="/" element={<Index><Dashboard /></Index>} />
              <Route path="/openstaande-taken" element={<Index><PendingTasks /></Index>} />
              <Route path="/ai-acties" element={<Index><Actions /></Index>} />
              
              {/* Client routes - new primary route + redirect from old */}
              <Route path="/clienten" element={<Index><Contacts /></Index>} />
              <Route path="/contacten" element={<Navigate to="/clienten" replace />} />
              
              <Route path="/documenten" element={<Index><Documents /></Index>} />
              <Route path="/documenten/nieuw" element={<Index><CreateDocument /></Index>} />
              <Route path="/documenten/opstellen" element={<Navigate to="/documenten/nieuw" replace />} />
              <Route path="/actieve-dossiers" element={<Index><ActiveDossiers /></Index>} />
              <Route path="/gesloten-dossiers" element={<Index><ClosedDossiers /></Index>} />
              <Route path="/facturen" element={<Index><Invoices /></Index>} />
              <Route path="/facturen/nieuw" element={<Index><CreateInvoice /></Index>} />
              <Route path="/facturen/opstellen" element={<Navigate to="/facturen/nieuw" replace />} />
              <Route path="/facturen/:id/sturen" element={<Index><FactuurSturen /></Index>} />
              <Route path="/offertes" element={<Index><Quotes /></Index>} />
              <Route path="/offertes/nieuw" element={<Index><CreateQuote /></Index>} />
              <Route path="/offertes/opstellen" element={<Navigate to="/offertes/nieuw" replace />} />
              <Route path="/telefoongesprekken" element={<Index><PhoneCalls /></Index>} />
              <Route path="/e-mails" element={<Index><Emails /></Index>} />
              <Route path="/instellingen/*" element={<Index><Settings /></Index>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
