
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ProductLine = () => {
  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      <div className="col-span-1">
        <Input
          type="number"
          step="0.01"
          defaultValue={1}
          className="text-center w-14"
        />
      </div>
      <div className="col-span-6">
        <Textarea
          placeholder="Omschrijving"
          className="min-h-[32px] resize-none"
          rows={1}
        />
      </div>
      <div className="col-span-2">
        <div className="flex items-center">
          <span className="mr-1 text-sm">€</span>
          <Input
            type="number"
            step="0.01"
            defaultValue={0}
            className="text-right w-16"
          />
        </div>
      </div>
      <div className="col-span-1">
        <Select defaultValue="21">
          <SelectTrigger className="w-12">
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
          <span className="mr-1 text-sm">€</span>
          <span className="font-medium text-sm">0.00</span>
        </div>
      </div>
    </div>
  );
};
