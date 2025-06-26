
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, X } from 'lucide-react';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

interface TimeEntry {
  user_id: string;
  user_name: string;
  hours: number;
  description: string;
}

interface TimeEntryInputProps {
  timeEntries: TimeEntry[];
  onTimeEntriesChange: (entries: TimeEntry[]) => void;
  defaultUserId?: string;
}

export const TimeEntryInput = ({ 
  timeEntries, 
  onTimeEntriesChange, 
  defaultUserId 
}: TimeEntryInputProps) => {
  const { members } = useOrganizationMembers();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    user_id: defaultUserId || '',
    hours: '',
    description: ''
  });

  const handleAddEntry = () => {
    if (!newEntry.user_id || !newEntry.hours) return;

    const member = members.find(m => m.user_id === newEntry.user_id);
    if (!member) return;

    const entry: TimeEntry = {
      user_id: newEntry.user_id,
      user_name: member.account_name || member.email,
      hours: parseFloat(newEntry.hours),
      description: newEntry.description
    };

    onTimeEntriesChange([...timeEntries, entry]);
    setNewEntry({ user_id: defaultUserId || '', hours: '', description: '' });
    setShowAddEntry(false);
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = timeEntries.filter((_, i) => i !== index);
    onTimeEntriesChange(updatedEntries);
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">
          Gewerkte Uren
        </Label>
        {totalHours > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {totalHours.toFixed(1)}h totaal
          </Badge>
        )}
      </div>

      {timeEntries.length > 0 && (
        <div className="space-y-2">
          {timeEntries.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-md text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.user_name}</span>
                  <span className="text-slate-500">{entry.hours}h</span>
                </div>
                {entry.description && (
                  <p className="text-xs text-slate-600 mt-1">{entry.description}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveEntry(index)}
                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!showAddEntry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddEntry(true)}
          className="w-full text-slate-600 hover:text-slate-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Uren toevoegen
        </Button>
      ) : (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600">Medewerker</Label>
              <Select
                value={newEntry.user_id}
                onValueChange={(value) => setNewEntry(prev => ({ ...prev, user_id: value }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Selecteer..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.account_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Uren</Label>
              <Input
                type="number"
                step="0.25"
                min="0"
                value={newEntry.hours}
                onChange={(e) => setNewEntry(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="2.5"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Omschrijving (optioneel)</Label>
            <Input
              value={newEntry.description}
              onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Wat heb je gedaan?"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddEntry} className="h-7 text-xs">
              Toevoegen
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowAddEntry(false);
                setNewEntry({ user_id: defaultUserId || '', hours: '', description: '' });
              }}
              className="h-7 text-xs"
            >
              Annuleren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
