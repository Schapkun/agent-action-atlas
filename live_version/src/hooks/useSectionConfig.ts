
import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';

interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'currency';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  order?: number;
}

interface SectionConfig {
  id: string;
  name: string;
  order: number;
  fields: FieldDefinition[];
}

const DEFAULT_SECTIONS: Record<string, SectionConfig> = {
  basic: {
    id: 'basic',
    name: 'Basisinformatie',
    order: 0,
    fields: [
      { id: 'name', name: 'Dossiernaam', type: 'text', required: true, order: 0, placeholder: "Geef het dossier een duidelijke naam" },
      { id: 'description', name: 'Beschrijving', type: 'textarea', order: 1, placeholder: "Korte beschrijving van het dossier..." },
      { id: 'category', name: 'Categorie', type: 'select', options: ['algemeen', 'familierecht', 'arbeidsrecht', 'strafrecht', 'ondernemingsrecht'], order: 2, placeholder: "Selecteer categorie" },
      { id: 'priority', name: 'Prioriteit', type: 'select', options: ['low', 'medium', 'high', 'urgent'], order: 3, placeholder: "Selecteer prioriteit" }
    ]
  },
  planning: {
    id: 'planning',
    name: 'Planning & Termijnen',
    order: 1,
    fields: [
      { id: 'start_date', name: 'Startdatum', type: 'date', order: 0 },
      { id: 'end_date', name: 'Einddatum', type: 'date', order: 1 },
      { id: 'deadline_date', name: 'Deadline Datum', type: 'date', order: 2 },
      { id: 'deadline_description', name: 'Deadline Beschrijving', type: 'textarea', order: 3 }
    ]
  },
  legal: {
    id: 'legal',
    name: 'Details',
    order: 2,
    fields: [
      { id: 'case_type', name: 'Zaaktype', type: 'select', options: ['civiel', 'straf', 'bestuurs', 'arbeids', 'familie', 'ondernemings', 'fiscaal', 'intellectueel'], order: 0 },
      { id: 'court_instance', name: 'Rechtbank/Instantie', type: 'text', order: 1 },
      { id: 'legal_status', name: 'Juridische Status', type: 'select', options: ['intake', 'onderzoek', 'dagvaarding', 'verweer', 'comparitie', 'vonnis', 'hoger_beroep', 'executie', 'afgerond'], order: 2 },
      { id: 'estimated_hours', name: 'Geschatte Uren', type: 'number', order: 3 },
      { id: 'hourly_rate', name: 'Uurtarief', type: 'currency', order: 4 }
    ]
  },
  procedure: {
    id: 'procedure',
    name: 'Procedure',
    order: 3,
    fields: [
      { id: 'procedure_type', name: 'Type Procedure', type: 'select', options: ['dagvaarding', 'kort_geding', 'arbitrage', 'mediation', 'onderhandeling', 'advies', 'hoger_beroep', 'cassatie'], order: 0 }
    ]
  },
  notes: {
    id: 'notes',
    name: 'Notities',
    order: 4,
    fields: [
      { id: 'intake_notes', name: 'Intake Notities', type: 'textarea', order: 0 }
    ]
  }
};

export const useSectionConfig = () => {
  const { selectedOrganization } = useOrganization();
  const [sectionConfigs, setSectionConfigs] = useState<Record<string, SectionConfig>>(DEFAULT_SECTIONS);

  const storageKey = `section_configs_${selectedOrganization?.id}`;

  useEffect(() => {
    if (selectedOrganization) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsedConfigs = JSON.parse(stored);
          setSectionConfigs(parsedConfigs);
        } catch (error) {
          console.error('Error parsing stored section configs:', error);
          setSectionConfigs(DEFAULT_SECTIONS);
        }
      } else {
        setSectionConfigs(DEFAULT_SECTIONS);
      }
    }
  }, [selectedOrganization, storageKey]);

  const updateSectionConfig = (sectionId: string, config: Partial<SectionConfig>) => {
    setSectionConfigs(prev => {
      const updated = {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          ...config
        }
      };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const updateSectionFields = (sectionId: string, fields: FieldDefinition[]) => {
    updateSectionConfig(sectionId, { fields });
  };

  const updateSectionName = (sectionId: string, name: string) => {
    updateSectionConfig(sectionId, { name });
  };

  const updateSectionOrder = (sectionId: string, order: number) => {
    updateSectionConfig(sectionId, { order });
  };

  const getSectionConfig = (sectionId: string): SectionConfig => {
    return sectionConfigs[sectionId] || DEFAULT_SECTIONS[sectionId];
  };

  const getAllSections = (): SectionConfig[] => {
    return Object.values(sectionConfigs).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  return {
    getSectionConfig,
    getAllSections,
    updateSectionFields,
    updateSectionName,
    updateSectionOrder,
    updateSectionConfig
  };
};
