
import { DEFAULT_PLACEHOLDERS } from './documentConstants';

export const parseJsonToStringRecord = (value: any): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_PLACEHOLDERS };
  }
  
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(value)) {
    if (typeof val === 'string') {
      result[key] = val;
    } else {
      result[key] = String(val || '');
    }
  }
  
  return { ...DEFAULT_PLACEHOLDERS, ...result };
};
