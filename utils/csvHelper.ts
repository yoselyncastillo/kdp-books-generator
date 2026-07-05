import { RawPuzzleData } from '../types';

export const parseCSVLine = (line: string, delimiter: string = ';'): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const escapeCSVField = (field: string | undefined, delimiter: string = ';'): string => {
  if (field === undefined || field === null) return '';
  if (field.includes(delimiter) || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

export const parseCsvFile = (file: File): Promise<RawPuzzleData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }

      // We split by newline
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        resolve([]);
        return;
      }

      // Detect delimiter from the first line (header)
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') ? ';' : ',';

      const cleanLines = lines.slice(1);
      const parsedRaw: RawPuzzleData[] = cleanLines
        .map((line): RawPuzzleData | null => {
          if (line.trim() === '') return null;
          
          const parts = parseCSVLine(line, delimiter);
          if (parts.length < 3) return null;

          const title = parts[0].trim();
          const scripture = parts[1]
            .replace(/["“”«»]/g, '')
            .trim();
          const words = parts[2]
            .split(',')
            .map((w) => w.trim());
          
          let reflectionText = undefined;
          let footerPrayer = undefined;
          if (parts.length >= 4) {
            reflectionText = parts[3].trim();
          }
          if (parts.length >= 5) {
            footerPrayer = parts[4].trim();
          }

          return { title, scripture, words, reflectionText, footerPrayer };
        })
        .filter((item): item is RawPuzzleData => item !== null);

      resolve(parsedRaw);
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsText(file, 'UTF-8');
  });
};

export const exportCsvFile = (data: RawPuzzleData[], filename: string = 'modificado.csv') => {
  const headers = ['Title', 'Scripture', 'Words', 'ReflectionText', 'FooterPrayer'].join(',');
  const rows = data.map((row) => {
    return [
      escapeCSVField(row.title, ','),
      escapeCSVField(row.scripture, ','),
      escapeCSVField(row.words.join(', '), ','),
      escapeCSVField(row.reflectionText, ','),
      escapeCSVField(row.footerPrayer, ',')
    ].join(',');
  });
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
