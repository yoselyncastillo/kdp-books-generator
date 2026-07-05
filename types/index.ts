export interface RawPuzzleData {
  title: string;
  scripture: string;
  words: string[];
  reflectionText?: string;
  footerPrayer?: string;
  floatingElements?: CanvasElement[];
}

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: number[];
}

export interface Puzzle extends RawPuzzleData {
  id: number;
  grid: string[][];
  solutionMask: boolean[][];
  placedWords: PlacedWord[];
}

export interface BackgroundLayer {
  id: string;
  imgData: string;
  startPage: number;
  endPage: number;
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  src?: string;
  text?: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  zIndex: number;
  pageSide: 'left' | 'right';
}

export interface TypographySettings {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface GridSettings {
  innerLineWidth: number;
  outerLineWidth: number;
  borderColor: string;
  cellPadding: number;
}

export interface NotesSettings {
  quantity: number;
  color: string;
  spacing: number;
}

export interface BookConfig {
  maxPages: number;
  startingPage: number;
  solutionsDensity: number;
  gridRows: number;
  gridCols: number;
  wordColumns: number;
  allowDiagonals: boolean;
  allowReverse: boolean;
  backgrounds: BackgroundLayer[];
  bgOpacity: number;
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  
  // Nuevas configuraciones avanzadas
  hideRightTitle: boolean;
  titleTypography: TypographySettings;
  verseTypography: TypographySettings;
  cluesTypography: TypographySettings;
  reflectionTypography: TypographySettings;
  footerPrayerTypography: TypographySettings;
  gridTypography: TypographySettings;
  gridSettings: GridSettings;
  notesSettings: NotesSettings;
}