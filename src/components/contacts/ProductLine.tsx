
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List } from 'lucide-react';

export const ProductLine = () => {
  const [description, setDescription] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (type: 'bold' | 'italic' | 'underline' | 'list') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    
    let formattedText = '';
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
    }
    
    const newText = description.substring(0, start) + formattedText + description.substring(end);
    setDescription(newText);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(32, textareaRef.current.scrollHeight) + 'px';
    }
  }, [description]);

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-1">
        <Input
          type="number"
          step="0.01"
          defaultValue={1}
          className="text-center w-12 h-8 text-xs"
        />
      </div>
      <div className="col-span-6">
        <Textarea
          ref={textareaRef}
          placeholder="Omschrijving"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[32px] resize-none text-xs"
          rows={1}
        />
        <div className="flex items-center gap-1 mt-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0"
            onClick={() => applyFormatting('bold')}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0"
            onClick={() => applyFormatting('italic')}
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0"
            onClick={() => applyFormatting('underline')}
          >
            <Underline className="h-3 w-3" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0"
            onClick={() => applyFormatting('list')}
          >
            <List className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="col-span-2">
        <div className="flex items-center">
          <span className="mr-1 text-xs">€</span>
          <Input
            type="number"
            step="0.01"
            defaultValue={0}
            className="text-right w-14 h-8 text-xs"
          />
        </div>
      </div>
      <div className="col-span-1">
        <Select defaultValue="21">
          <SelectTrigger className="w-10 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0%</SelectItem>
            <SelectItem value="6">6%</SelectItem>
            <SelectItem value="9">9%</SelectItem>
            <SelectItem value="21">21%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <div className="flex items-center">
          <span className="mr-1 text-xs">€</span>
          <span className="font-medium text-xs">0.00</span>
        </div>
      </div>
    </div>
  );
};
