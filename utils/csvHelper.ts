import { RawPuzzleData } from '../types';

export const parseCsvFile = (file: File): Promise<RawPuzzleData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }

      const cleanLines = text.split('\n').slice(1);
      const parsedRaw: RawPuzzleData[] = cleanLines
        .map((line): RawPuzzleData | null => {
          if (line.trim() === '') return null;
          const firstSemi = line.indexOf(';');
          const lastSemi = line.lastIndexOf(';');
          if (firstSemi === -1 || firstSemi === lastSemi) return null;

          const title = line.substring(0, firstSemi).trim();
          const scripture = line
            .substring(firstSemi + 1, lastSemi)
            .replace(/["“”«»]/g, '')
            .trim();
          const words = line
            .substring(lastSemi + 1)
            .split(',')
            .map((w) => w.trim());

          return { title, scripture, words };
        })
        .filter((item): item is RawPuzzleData => item !== null);

      resolve(parsedRaw);
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsText(file, 'UTF-8');
  });
};
