
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { OrganizationMembership, WorkspaceMembership } from '../types/UserProfile';
import { MembershipsList } from './MembershipsList';

interface MembershipsCardProps {
  organizations: OrganizationMembership[];
  workspaces: WorkspaceMembership[];
}

export const MembershipsCard = ({ organizations, workspaces }: MembershipsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Mijn Organisaties & Werkruimtes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MembershipsList organizations={organizations} workspaces={workspaces} />
      </CardContent>
    </Card>
  );
};
