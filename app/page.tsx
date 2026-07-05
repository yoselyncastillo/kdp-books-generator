'use client';

import Preview from '@/components/Preview';
import Sidebar from '@/components/Sidebar';
import CsvEditor from '@/components/CsvEditor';
import { LayoutWrapper } from '@/styles/components';
import { KdpPrintStyles } from '@/styles/global';
import { BookConfig, RawPuzzleData, Puzzle } from '@/types';
import { parseCsvFile } from '@/utils/csvHelper';
import { buildMatrix } from '@/utils/wordSearch';
import React, { useState } from 'react';
import { Lora, Playfair_Display, Merriweather } from 'next/font/google';

import { Montserrat, Open_Sans } from 'next/font/google';

const fontLora = Lora({ subsets: ['latin'], variable: '--font-lora' });
const fontPlayfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const fontMerriweather = Merriweather({ subsets: ['latin'], variable: '--font-merriweather' });
const fontMontserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const fontOpenSans = Open_Sans({ subsets: ['latin'], variable: '--font-opensans' });

import { DEFAULT_LAYOUT_CONFIGS } from '@/utils/layoutConfigs';

const DEFAULT_CONFIG: BookConfig = {
  maxPages: 100,
  startingPage: 3,
  solutionsDensity: 4,
  allowDiagonals: true,
  allowReverse: false,
  backgrounds: [],
  bgOpacity: 50,
  ...(DEFAULT_LAYOUT_CONFIGS[1] as any),
};

export default function KdpGeneratorApp() {
  const [rawCsvData, setRawCsvData] = useState<RawPuzzleData[]>([]);
  const [dataset, setDataset] = useState<Puzzle[]>([]);
  const [draftConfig, setDraftConfig] = useState<BookConfig>(DEFAULT_CONFIG);
  const [appliedConfig, setAppliedConfig] =
    useState<BookConfig>(DEFAULT_CONFIG);

  const [zoomLevel, setZoomLevel] = useState<number>(0.8);
  const [showPreviewSolutions, setShowPreviewSolutions] =
    useState<boolean>(false);

  const [isTestingManual, setIsTestingManual] = useState<boolean>(false);
  const [manualData, setManualData] = useState<RawPuzzleData>({
    title: 'The Good Shepherd',
    scripture: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. Psalm 23:1-2',
    words: ['LORD', 'SHEPHERD', 'NOTHING', 'PASTURES', 'QUIET', 'WATERS', 'REFRESHES', 'SOUL', 'GUIDES', 'PATHS', 'VALLEY', 'FEAR', 'EVIL', 'COMFORT', 'GREEN', 'STAFF', 'ANXIOUS', 'SITUATION', 'PRAYER', 'PETITION', 'REQUESTS', 'GUARD', 'HEARTS', 'MINDS', 'NOBLE'],
    reflectionText: 'In a world that constantly pushes us to hurry, achieve, and accumulate more, Psalm 23 offers a radical shift in perspective. When we recognize God as our shepherd, the focus moves from what we lack to the peace of knowing we are deeply cared for. True abundance isn\'t about having everything; it is about trusting the One who provides exactly what we need for today. The imagery of "green pastures" and "quiet waters" is not just a promise of future peace, but an active invitation to slow down right now. Often, we try to push through exhaustion, but the verse says He makes us lie down. It is a gentle reminder that rest is not a luxury, but a divine necessity. Before we can climb the next mountain or face the next challenge, we are called to simply stop, breathe, and let our souls be restored.',
    footerPrayer: 'Lord, thank You for being my faithful shepherd who provides for all my needs. Teach me to pause amidst the busyness of life, trusting in Your care and embracing the rest You offer beside quiet waters. Please restore my soul today and guide my steps in Your perfect peace. Amen.',
    floatingElements: [],
  });
  const [manualDataset, setManualDataset] = useState<Puzzle[]>([]);

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [showFullTable, setShowFullTable] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isTestingManual) return;
    try {
      const { grid, solutionMask, placedWords } = buildMatrix(
        manualData.words,
        draftConfig.gridRows,
        draftConfig.gridCols,
        draftConfig.allowDiagonals,
        draftConfig.allowReverse,
      );
      setManualDataset([{ id: 9999, ...manualData, grid, solutionMask, placedWords }]);
    } catch (e) {
      console.warn("No se pudo generar el puzzle manual", e);
    }
  }, [manualData, draftConfig, isTestingManual]);

  const handleUpdateCsvRow = (index: number, updatedRow: RawPuzzleData) => {
    const newRaw = [...rawCsvData];
    newRaw[index] = updatedRow;
    setRawCsvData(newRaw);

    // Regenerar el puzzle específico en el dataset
    const newDataset = [...dataset];
    const targetPuzzleIndex = newDataset.findIndex(p => p.id === index + 1);

    if (targetPuzzleIndex !== -1) {
      try {
        const { grid, solutionMask, placedWords } = buildMatrix(
          updatedRow.words,
          appliedConfig.gridRows,
          appliedConfig.gridCols,
          appliedConfig.allowDiagonals,
          appliedConfig.allowReverse,
        );
        newDataset[targetPuzzleIndex] = { id: index + 1, ...updatedRow, grid, solutionMask, placedWords };
        setDataset(newDataset);
      } catch (e) {
        console.warn("No se pudo regenerar el puzzle en caliente", e);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseCsvFile(file);
        if (parsed.length === 0) {
          alert('El archivo se subió, pero no se encontraron datos válidos. Revisa que las columnas estén separadas por punto y coma (;) y que haya al menos 3 columnas por fila (Title;Scripture;Words).');
        } else {
          alert(`¡Archivo cargado con éxito! Se detectaron ${parsed.length} juegos. No olvides hacer clic en "Generar" para ver los cambios en la previsualización.`);
        }
        setRawCsvData(parsed);
      } catch (error) {
        alert('Error grave procesando CSV: ' + error);
      }
    }
  };

  const handleGenerateBook = () => {
    if (rawCsvData.length === 0) {
      alert('Primero sube un archivo CSV válido.');
      return;
    }

    const generatedPuzzles: Puzzle[] = rawCsvData.map((item, idx) => {
      const { grid, solutionMask, placedWords } = buildMatrix(
        item.words,
        draftConfig.gridRows,
        draftConfig.gridCols,
        draftConfig.allowDiagonals,
        draftConfig.allowReverse,
      );
      return { id: idx + 1, ...item, grid, solutionMask, placedWords };
    });

    setAppliedConfig(draftConfig);
    setDataset(generatedPuzzles);
  };

  const handleUpdatePuzzleFloatingElements = (puzzleId: number, newElements: import('../types').CanvasElement[]) => {
    if (isTestingManual) {
      setManualData(prev => ({ ...prev, floatingElements: newElements }));
      setManualDataset(prev => prev.map(p => p.id === puzzleId ? { ...p, floatingElements: newElements } : p));
    } else {
      setRawCsvData(prev => prev.map((row, idx) => (idx + 1 === puzzleId) ? { ...row, floatingElements: newElements } : row));
      setDataset(prev => prev.map(p => p.id === puzzleId ? { ...p, floatingElements: newElements } : p));
    }
  };

  return (
    <div
      className={`${fontLora.variable} ${fontPlayfair.variable} ${fontMerriweather.variable} ${fontMontserrat.variable} ${fontOpenSans.variable}`}
    >
      <LayoutWrapper>
        <KdpPrintStyles />
        <Sidebar
          draftConfig={draftConfig}
          setDraftConfig={setDraftConfig}
          rawCsvDataLength={rawCsvData.length}
          onFileUpload={handleFileUpload}
          onGenerate={handleGenerateBook}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          showPreviewSolutions={showPreviewSolutions}
          setShowPreviewSolutions={setShowPreviewSolutions}
          isTestingManual={isTestingManual}
          setIsTestingManual={setIsTestingManual}
          manualData={manualData}
          setManualData={setManualData}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          rawCsvData={rawCsvData}
          onUpdateCsvRow={handleUpdateCsvRow}
          setShowFullTable={setShowFullTable}
        />
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Preview
            dataset={isTestingManual ? manualDataset : dataset}
            appliedConfig={isTestingManual ? draftConfig : appliedConfig}
            zoomLevel={zoomLevel}
            showPreviewSolutions={showPreviewSolutions}
            onUpdateFloatingElements={handleUpdatePuzzleFloatingElements}
          />
        </div>
      </LayoutWrapper>

      {showFullTable && (
        <CsvEditor
          rawCsvData={rawCsvData}
          onUpdateRow={handleUpdateCsvRow}
          onClose={() => setShowFullTable(false)}
        />
      )}
    </div>
  );
}
