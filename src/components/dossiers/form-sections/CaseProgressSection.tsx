
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Clock, User, Plus, FileText } from 'lucide-react';
import { TimeEntryInput } from '../TimeEntryInput';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';
import { useAuth } from '@/contexts/AuthContext';

interface TimeEntry {
  user_id: string;
  user_name: string;
  hours: number;
  description: string;
}

interface StatusUpdate {
  id: string;
  status: 'active' | 'closed' | 'pending' | 'on-hold' | 'in-review';
  description: string;
  updated_by: string;
  updated_by_name: string;
  updated_at: string;
  time_entries: TimeEntry[];
}

interface CaseProgressSectionProps {
  currentStatus: 'active' | 'closed' | 'pending' | 'on-hold' | 'in-review';
  statusUpdates: StatusUpdate[];
  onStatusChange: (status: string) => void;
  onAddStatusUpdate: (update: { status: string; description: string; updated_by: string; time_entries: TimeEntry[] }) => void;
}

export const CaseProgressSection = ({ 
  currentStatus, 
  statusUpdates, 
  onStatusChange, 
  onAddStatusUpdate 
}: CaseProgressSectionProps) => {
  const { members } = useOrganizationMembers();
  const { user } = useAuth();
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    status: currentStatus,
    description: '',
    updated_by: user?.id || '',
    time_entries: [] as TimeEntry[]
  });

  const statusOptions = [
    { value: 'active', label: 'Actief', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'In afwachting', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'on-hold', label: 'On hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'in-review', label: 'In review', color: 'bg-blue-100 text-blue-800' },
    { value: 'closed', label: 'Gesloten', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleAddUpdate = () => {
    if (!newUpdate.description.trim()) return;

    onAddStatusUpdate({
      status: newUpdate.status,
      description: newUpdate.description,
      updated_by: newUpdate.updated_by,
      time_entries: newUpdate.time_entries
    });

    // Reset form
    setNewUpdate({
      status: currentStatus,
      description: '',
      updated_by: user?.id || '',
      time_entries: []
    });
    setShowAddUpdate(false);
  };

  const getCurrentStatusOption = () => {
    return statusOptions.find(option => option.value === currentStatus);
  };

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    return member?.account_name || member?.email || 'Onbekend';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Dossier Voortgang
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Huidige Status</Label>
          <div className="flex items-center gap-3">
            <Select value={currentStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={`${option.color} border-0`}>
                        {option.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getCurrentStatusOption() && (
              <Badge className={`${getCurrentStatusOption()?.color} border-0`}>
                {getCurrentStatusOption()?.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Status Updates History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Status Updates</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddUpdate(true)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Update toevoegen
            </Button>
          </div>

          {statusUpdates.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {statusUpdates.map((update) => (
                <div key={update.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusOptions.find(s => s.value === update.status)?.color} border-0 text-xs`}>
                        {statusOptions.find(s => s.value === update.status)?.label}
                      </Badge>
                      <span className="text-slate-600 text-xs">
                        door {update.updated_by_name}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">
                      {new Date(update.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-2">{update.description}</p>
                  {update.time_entries.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span>Gewerkte uren:</span>
                      </div>
                      {update.time_entries.map((entry, idx) => (
                        <div key={idx} className="text-xs text-slate-600 ml-4">
                          {entry.user_name}: {entry.hours}h
                          {entry.description && ` - ${entry.description}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Nog geen status updates</p>
          )}
        </div>

        {/* Add New Status Update */}
        {showAddUpdate && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nieuwe Status</Label>
                <Select
                  value={newUpdate.status}
                  onValueChange={(value) => setNewUpdate(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <Badge className={`${option.color} border-0`}>
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Update door</Label>
                <Select
                  value={newUpdate.updated_by}
                  onValueChange={(value) => setNewUpdate(prev => ({ ...prev, updated_by: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {member.account_name || member.email}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Beschrijving</Label>
              <Textarea
                value={newUpdate.description}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschrijf de status wijziging..."
                className="mt-1"
                rows={3}
              />
            </div>

            <TimeEntryInput
              timeEntries={newUpdate.time_entries}
              onTimeEntriesChange={(entries) => setNewUpdate(prev => ({ ...prev, time_entries: entries }))}
              defaultUserId={newUpdate.updated_by}
            />

            <div className="flex gap-2">
              <Button onClick={handleAddUpdate} size="sm">
                Update toevoegen
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowAddUpdate(false);
                  setNewUpdate({
                    status: currentStatus,
                    description: '',
                    updated_by: user?.id || '',
                    time_entries: []
                  });
                }}
              >
                Annuleren
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
