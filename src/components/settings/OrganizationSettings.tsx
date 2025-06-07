
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationOperations } from './hooks/useOrganizationOperations';
import { CreateOrganizationForm } from './components/CreateOrganizationForm';
import { OrganizationCard } from './components/OrganizationCard';

export const OrganizationSettings = () => {
  const { user } = useAuth();
  const {
    organizations,
    loading,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  } = useOrganizationOperations();

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  // Check if user can create organizations and workspaces
  const canCreate = () => {
    console.log('OrganizationSettings - canCreate check:', { 
      userEmail: user?.email,
      isAccountOwner: user?.email === 'info@schapkun.com'
    });
    
    // Account owner can always create
    if (user?.email === 'info@schapkun.com') {
      console.log('Account owner detected, can create');
      return true;
    }
    
    // For now, let any authenticated user create organizations
    // This can be adjusted based on business rules
    return true;
  };

  if (loading) {
    return <div className="text-sm">Organisaties laden...</div>;
  }

  const canCreateItems = canCreate();
  console.log('OrganizationSettings - Final render decision:', { 
    canCreateItems, 
    userEmail: user?.email,
    organizationsCount: organizations.length 
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Organisaties & Werkruimtes</h2>
        {canCreateItems && (
          <CreateOrganizationForm onCreateOrganization={createOrganization} />
        )}
      </div>

      <div className="space-y-4">
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              {user?.email === 'info@schapkun.com' 
                ? 'Er zijn nog geen organisaties aangemaakt.'
                : 'Je bent nog geen lid van een organisatie. Maak een nieuwe organisatie aan om te beginnen.'
              }
            </CardContent>
          </Card>
        ) : (
          organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              canCreate={canCreateItems}
              onUpdateOrganization={updateOrganization}
              onDeleteOrganization={deleteOrganization}
              onCreateWorkspace={createWorkspace}
              onUpdateWorkspace={updateWorkspace}
              onDeleteWorkspace={deleteWorkspace}
            />
          ))
        )}
      </div>
    </div>
  );
};
