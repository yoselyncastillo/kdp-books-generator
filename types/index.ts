export interface RawPuzzleData {
  title: string;
  scripture: string;
  words: string[];
}

export interface Puzzle extends RawPuzzleData {
  id: number;
  grid: string[][];
  solutionMask: boolean[][];
}

export interface BackgroundLayer {
  id: string;
  imgData: string;
  startPage: number;
  endPage: number;
}

export interface BookConfig {
  maxPages: number;
  startingPage: number;
  solutionsDensity: number;
  gridRows: number;
  gridCols: number;
  cellFontSize: number;
  wordColumns: number;
  allowDiagonals: boolean;
  allowReverse: boolean;
  backgrounds: BackgroundLayer[];
  bgOpacity: number;
  showInternalLines: boolean;
  showExternalBorder: boolean;
  layoutVersion: 1 | 2 | 3;
}