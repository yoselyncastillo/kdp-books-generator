'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Preview from '@/components/Preview';
import { KdpPrintStyles } from '@/styles/global';
import { BookConfig, Puzzle } from '@/types';
import { Lora, Playfair_Display, Merriweather, Montserrat, Open_Sans } from 'next/font/google';

const fontLora = Lora({ subsets: ['latin'], variable: '--font-lora' });
const fontPlayfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const fontMerriweather = Merriweather({ subsets: ['latin'], variable: '--font-merriweather' });
const fontMontserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const fontOpenSans = Open_Sans({ subsets: ['latin'], variable: '--font-opensans' });

export default function ViewBookApp() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);

  const [dataset, setDataset] = useState<Puzzle[]>([]);
  const [draftConfig, setDraftConfig] = useState<BookConfig | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(0.8);
  const [showPreviewSolutions, setShowPreviewSolutions] = useState<boolean>(false);

  useEffect(() => {
    if (!bookId) return;
    setIsLoading(true);
    api.getBookById(bookId).then(book => {
      if (book) {
        setDraftConfig(book.config);
        const loadedData = book.puzzleData || [];
        setDataset(loadedData);
      } else {
        alert('Book not found');
        router.push('/');
      }
    }).finally(() => setIsLoading(false));
  }, [bookId, router]);

  const handleUpdatePuzzleFloatingElements = (puzzleId: number, newElements: import('@/types').CanvasElement[]) => {
    // In view mode, we probably shouldn't allow updating floating elements.
    console.log("View mode: Floating element updates ignored.");
  };

  if (isLoading || !draftConfig) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando proyecto...</div>;
  }

  return (
    <div
      className={`${fontLora.variable} ${fontPlayfair.variable} ${fontMerriweather.variable} ${fontMontserrat.variable} ${fontOpenSans.variable}`}
      style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column' }}
    >
      <KdpPrintStyles />
      
      {/* Top Bar for View Mode */}
      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 20px', 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '8px 15px',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ← Volver al Dashboard
        </button>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={showPreviewSolutions}
              onChange={(e) => setShowPreviewSolutions(e.target.checked)}
            />
            Ver Soluciones
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>Zoom:</span>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            />
          </div>
          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, justifyContent: 'center', overflowY: 'auto' }}>
        <Preview
          dataset={dataset}
          appliedConfig={draftConfig}
          zoomLevel={zoomLevel}
          showPreviewSolutions={showPreviewSolutions}
          onUpdateFloatingElements={handleUpdatePuzzleFloatingElements}
        />
      </div>
    </div>
  );
}
