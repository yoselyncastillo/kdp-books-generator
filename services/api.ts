import { Book, BookConfig, BookStatus, RawPuzzleData } from '@/types';
import { DEFAULT_LAYOUT_CONFIGS } from '@/utils/layoutConfigs';

const API_URL = 'http://localhost:3010/books';

export const api = {
  getBooks: async (): Promise<Book[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getBookById: async (id: string): Promise<Book | null> => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch book');
      }
      return response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  createBook: async (title: string, config?: BookConfig): Promise<Book> => {
    const defaultConfig: BookConfig = {
      maxPages: 100,
      startingPage: 3,
      solutionsDensity: 4,
      gridRows: 12,
      gridCols: 12,
      wordColumns: 2,
      allowDiagonals: true,
      allowReverse: false,
      backgrounds: [],
      bgOpacity: 50,
      pageMargins: { top: 0.3, bottom: 0.3, inner: 0.8, outer: 0.5 },
      layerZIndices: { title: 1, verse: 1, grid: 1, words: 1 },
      hideRightTitle: false,
      titleTypography: { fontSize: 24, fontFamily: 'var(--font-lora)', fontWeight: 700, fontStyle: 'normal', lineHeight: 1.2, color: '#000000', textAlign: 'center', paddingTop: 0, paddingBottom: 10, paddingLeft: 0, paddingRight: 0 },
      verseTypography: { fontSize: 14, fontFamily: 'var(--font-opensans)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.4, color: '#333333', textAlign: 'justify', paddingTop: 0, paddingBottom: 15, paddingLeft: 0, paddingRight: 0 },
      cluesTypography: { fontSize: 12, fontFamily: 'var(--font-montserrat)', fontWeight: 500, fontStyle: 'normal', lineHeight: 1.3, color: '#000000', textAlign: 'left', paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
      reflectionTypography: { fontSize: 12, fontFamily: 'var(--font-merriweather)', fontWeight: 400, fontStyle: 'normal', lineHeight: 1.5, color: '#444444', textAlign: 'justify', paddingTop: 15, paddingBottom: 15, paddingLeft: 0, paddingRight: 0 },
      footerPrayerTypography: { fontSize: 12, fontFamily: 'var(--font-playfair)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.3, color: '#222222', textAlign: 'center', paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
      gridTypography: { fontSize: 16, fontFamily: 'monospace', fontWeight: 700, fontStyle: 'normal', lineHeight: 1, color: '#000000', textAlign: 'center', paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
      gridSettings: { innerLineWidth: 1, outerLineWidth: 2, borderColor: '#000000', cellPadding: 2 },
      notesSettings: { quantity: 5, color: '#999999', spacing: 20 },
      ...(DEFAULT_LAYOUT_CONFIGS[1] as any),
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        config: config || defaultConfig,
      }),
    });
    if (!response.ok) throw new Error('Failed to create book');
    return response.json();
  },

  updateBook: async (id: string, updates: Partial<Book>): Promise<Book> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update book');
    return response.json();
  },

  deleteBook: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete book');
  },

  duplicateBook: async (id: string): Promise<Book> => {
    const response = await fetch(`${API_URL}/${id}/duplicate`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to duplicate book');
    return response.json();
  }
};
