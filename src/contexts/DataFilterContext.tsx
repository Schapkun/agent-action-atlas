
import React, { createContext, useContext, useMemo } from 'react';
import { useOrganization } from './OrganizationContext';

interface DataFilterContextType {
  getDataFilter: () => {
    organizationId: string | null;
    workspaceId: string | null;
    showAllWorkspaces: boolean;
  };
}

const DataFilterContext = createContext<DataFilterContextType | undefined>(undefined);

export const useDataFilter = () => {
  const context = useContext(DataFilterContext);
  if (context === undefined) {
    throw new Error('useDataFilter must be used within a DataFilterProvider');
  }
  return context;
};

export const DataFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentOrganization, currentWorkspace } = useOrganization();

  const getDataFilter = useMemo(() => {
    return () => ({
      organizationId: currentOrganization?.id || null,
      workspaceId: currentWorkspace?.id || null,
      showAllWorkspaces: !currentWorkspace && !!currentOrganization
    });
  }, [currentOrganization, currentWorkspace]);

  const value: DataFilterContextType = {
    getDataFilter,
  };

  return (
    <DataFilterContext.Provider value={value}>
      {children}
    </DataFilterContext.Provider>
  );
};
