
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PendingTasks from "./pages/PendingTasks";
import Actions from "./pages/Actions";
import Documents from "./pages/Documents";
import ActiveDossiers from "./pages/ActiveDossiers";
import ClosedDossiers from "./pages/ClosedDossiers";
import Invoices from "./pages/Invoices";
import PhoneCalls from "./pages/PhoneCalls";
import Emails from "./pages/Emails";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OrganizationProvider>
              <Routes>
                <Route path="/" element={<Index><Dashboard /></Index>} />
                <Route path="/openstaande-taken" element={<Index><PendingTasks /></Index>} />
                <Route path="/ai-acties" element={<Index><Actions /></Index>} />
                <Route path="/documenten" element={<Index><Documents /></Index>} />
                <Route path="/actieve-dossiers" element={<Index><ActiveDossiers /></Index>} />
                <Route path="/gesloten-dossiers" element={<Index><ClosedDossiers /></Index>} />
                <Route path="/facturen" element={<Index><Invoices /></Index>} />
                <Route path="/telefoongesprekken" element={<Index><PhoneCalls /></Index>} />
                <Route path="/e-mails" element={<Index><Emails /></Index>} />
                <Route path="/contacten" element={<Index><Contacts /></Index>} />
                <Route path="/instellingen" element={<Index><Settings /></Index>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </OrganizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
