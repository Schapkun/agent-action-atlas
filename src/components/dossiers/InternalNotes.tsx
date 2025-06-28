
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';

export const InternalNotes = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('Cliënt wacht nog op aangepaste conceptovereenkomst');
  const [tempNotes, setTempNotes] = useState(notes);

  const handleSave = () => {
    // In real app, this would save to API
    setNotes(tempNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempNotes(notes);
    setIsEditing(true);
  };

  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">Interne Notities</h3>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-green-600 hover:text-green-700" onClick={handleSave}>
                <Save className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-red-600" onClick={handleCancel}>
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600" onClick={handleEdit}>
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <Textarea
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          className="text-xs min-h-[60px] resize-none"
          placeholder="Voeg interne notities toe..."
        />
      ) : (
        <p className="text-xs text-slate-700">{notes}</p>
      )}
    </div>
  );
};
