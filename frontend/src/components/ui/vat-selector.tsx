
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VatSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export const VatSelector = ({ value, onValueChange, className }: VatSelectorProps) => {
  const vatOptions = [
    { value: 0, label: '0%' },
    { value: 6, label: '6%' },
    { value: 9, label: '9%' },
    { value: 21, label: '21%' },
  ];

  return (
    <Select 
      value={value.toString()} 
      onValueChange={(val) => onValueChange(parseFloat(val))}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        {vatOptions.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
        <SelectItem value="geen">geen</SelectItem>
      </SelectContent>
    </Select>
  );
};
