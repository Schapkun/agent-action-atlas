
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";

// Import all pages
import Auth from "./pages/Auth";
import Register from "./pages/Register";
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
              
              {/* Main app routes - all handled by Index */}
              <Route path="/" element={<Index />} />
              <Route path="/openstaande-taken" element={<Index />} />
              <Route path="/ai-acties" element={<Index />} />
              
              {/* Client routes - new primary route + redirect from old */}
              <Route path="/clienten" element={<Index />} />
              <Route path="/contacten" element={<Navigate to="/clienten" replace />} />
              
              <Route path="/documenten" element={<Index />} />
              <Route path="/documenten/nieuw" element={<Index />} />
              <Route path="/documenten/opstellen" element={<Navigate to="/documenten/nieuw" replace />} />
              <Route path="/actieve-dossiers" element={<Index />} />
              <Route path="/gesloten-dossiers" element={<Index />} />
              <Route path="/facturen" element={<Index />} />
              <Route path="/facturen/nieuw" element={<Index />} />
              <Route path="/facturen/opstellen" element={<Navigate to="/facturen/nieuw" replace />} />
              <Route path="/facturen/:id/sturen" element={<Index />} />
              <Route path="/offertes" element={<Index />} />
              <Route path="/offertes/nieuw" element={<Index />} />
              <Route path="/offertes/opstellen" element={<Navigate to="/offertes/nieuw" replace />} />
              <Route path="/telefoongesprekken" element={<Index />} />
              <Route path="/e-mails" element={<Index />} />
              <Route path="/instellingen/*" element={<Index />} />
              <Route path="/support" element={<Index />} />
              
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
