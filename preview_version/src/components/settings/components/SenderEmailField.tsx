
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SenderEmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  description?: string;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

export const SenderEmailField = ({
  value,
  onChange,
  label,
  placeholder = "bijvoorbeeld: info@uwbedrijf.nl",
  description,
  onSave,
  saving = false
}: SenderEmailFieldProps) => {
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(value));

    // Check if domain is verified (simplified check)
    if (value && emailRegex.test(value)) {
      const domain = value.split('@')[1];
      // For now, we'll assume meester.app is verified and others are not
      // In a real implementation, you would check this via Resend API
      setIsDomainVerified(domain === 'meester.app');
    } else {
      setIsDomainVerified(null);
    }
  }, [value]);

  const getValidationIcon = () => {
    if (!value) return null;
    
    if (!isValidEmail) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (isDomainVerified === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (isDomainVerified === false) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    
    return null;
  };

  const getValidationMessage = () => {
    if (!value) return null;
    
    if (!isValidEmail) {
      return (
        <div className="text-xs text-red-600 mt-1">
          Voer een geldig emailadres in
        </div>
      );
    }
    
    if (isDomainVerified === false) {
      return (
        <div className="text-xs text-orange-600 mt-1">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Domein niet geverifieerd bij Resend
          </div>
          <div className="mt-1">
            Ga naar <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a> om dit domein te verifiëren
          </div>
        </div>
      );
    }
    
    if (isDomainVerified === true) {
      return (
        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Domein geverifieerd en klaar voor gebruik
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="sender-email" className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="sender-email"
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        </div>
      </div>

      {getValidationMessage()}
      
      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}

      {onSave && (
        <Button
          onClick={onSave}
          disabled={!isValidEmail || saving}
          size="sm"
          className="w-full"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      )}
    </div>
  );
};
