
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Welkom bij InvoiceApp</h1>
        <p className="text-muted-foreground mb-8">Beheer uw facturen, offertes en klanten eenvoudig</p>
        <div className="space-x-4">
          <a href="/auth" className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
            Inloggen
          </a>
          <a href="/register" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors">
            Registreren
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
