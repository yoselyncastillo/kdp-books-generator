export const normalizeWord = (word: string) => {
  return word.toUpperCase()
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U')
    .replace(/[^A-ZÑ]/g, ''); 
};

// Se validan rows y cols independientemente
export function verifyPlacement(word: string, r: number, c: number, dir: number[], grid: string[][], rows: number, cols: number): boolean {
  if (r + dir[0] * word.length > rows || r + dir[0] * word.length < -1 || c + dir[1] * word.length > cols || c + dir[1] * word.length < -1) return false;
  for (let i = 0; i < word.length; i++) {
    const targetCell = grid[r + dir[0] * i][c + dir[1] * i];
    if (targetCell !== '' && targetCell !== word[i]) return false;
  }
  return true;
}

export function buildMatrix(wordList: string[], rows: number, cols: number, allowDiagonals: boolean, allowReverse: boolean): { grid: string[][]; solutionMask: boolean[][] } {
  // Construimos matrices asimétricas
  const grid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  const solutionMask: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  const orientations: number[][] = [[0, 1], [1, 0]]; 
  if (allowReverse) orientations.push([0, -1], [-1, 0]); 
  if (allowDiagonals) {
    orientations.push([1, 1], [1, -1]); 
    if (allowReverse) orientations.push([-1, -1], [-1, 1]); 
  }

  const safeWords: string[] = wordList
    .map(w => normalizeWord(w))
    .filter(w => w.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const word of safeWords) {
    let inserted = false;
    let retries = 0;
    while (!inserted && retries < 250) {
      const currentDir = orientations[Math.floor(Math.random() * orientations.length)];
      const startRow = Math.floor(Math.random() * rows);
      const startCol = Math.floor(Math.random() * cols);

      if (verifyPlacement(word, startRow, startCol, currentDir, grid, rows, cols)) {
        for (let i = 0; i < word.length; i++) {
          const targetRow = startRow + currentDir[0] * i;
          const targetCol = startCol + currentDir[1] * i;
          grid[targetRow][targetCol] = word[i];
          solutionMask[targetRow][targetCol] = true;
        }
        inserted = true;
      }
      retries++;
    }
  }

  const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  return { grid, solutionMask };
}

export const segmentArray = <T,>(array: T[], total: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += total) {
    result.push(array.slice(i, i + total));
  }
  return result;
};