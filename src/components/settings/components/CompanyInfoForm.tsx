import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Building } from 'lucide-react';
import { CompanyInfo } from '../types/VisualTemplate';

interface CompanyInfoFormProps {
  companyInfo: CompanyInfo;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
}

export const CompanyInfoForm = ({ 
  companyInfo, 
  onUpdateCompanyInfo 
}: CompanyInfoFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    onUpdateCompanyInfo({
      ...companyInfo,
      [field]: value
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string;
        onUpdateCompanyInfo({
          ...companyInfo,
          logo: logoDataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onUpdateCompanyInfo({
      ...companyInfo,
      logo: undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4" />
        <h3 className="text-sm font-medium">Bedrijfsgegevens</h3>
      </div>

      {/* Logo Upload */}
      <Card className="bg-muted/20">
        <CardContent className="p-3">
          <Label className="text-xs font-medium block mb-2">Bedrijfslogo</Label>
          
          {companyInfo.logo ? (
            <div className="flex items-center gap-3">
              <img 
                src={companyInfo.logo} 
                alt="Company logo" 
                className="h-12 w-12 object-contain rounded border bg-white"
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Logo geüpload</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-md p-4 text-center cursor-pointer hover:border-muted-foreground/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Klik om logo te uploaden
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG tot 2MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Company Info Form */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label htmlFor="company-name" className="text-xs">Bedrijfsnaam *</Label>
          <Input
            id="company-name"
            value={companyInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Uw bedrijfsnaam"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address" className="text-xs">Adres</Label>
          <Input
            id="address"
            value={companyInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Straat en huisnummer"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="postal-code" className="text-xs">Postcode</Label>
            <Input
              id="postal-code"
              value={companyInfo.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="1234 AB"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city" className="text-xs">Plaats</Label>
            <Input
              id="city"
              value={companyInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Amsterdam"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-xs">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={companyInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="info@bedrijf.nl"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-xs">Telefoon</Label>
          <Input
            id="phone"
            value={companyInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+31 6 12345678"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="website" className="text-xs">Website</Label>
          <Input
            id="website"
            value={companyInfo.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="www.bedrijf.nl"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};
