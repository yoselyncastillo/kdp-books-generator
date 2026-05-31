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

const fontLora = Lora({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
});
const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '800'],
  style: ['normal', 'italic'],
});
const fontMerriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '900'],
  style: ['normal', 'italic'],
});

const DEFAULT_CONFIG: BookConfig = {
  maxPages: 100,
  startingPage: 3,
  solutionsDensity: 4,
  gridRows: 12,
  gridCols: 18,
  cellFontSize: 16,
  wordColumns: 4,
  allowDiagonals: true,
  allowReverse: false,
  backgrounds: [],
  bgOpacity: 15,
  showInternalLines: false,
  showExternalBorder: false,
  layoutVersion: 1,
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
    title: 'Prueba Manual',
    scripture: 'En el principio creó Dios los cielos y la tierra.',
    words: ['PRINCIPIO', 'DIOS', 'CIELOS', 'TIERRA'],
  });
  const [manualDataset, setManualDataset] = useState<Puzzle[]>([]);

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [showFullTable, setShowFullTable] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isTestingManual) return;
    try {
      const { grid, solutionMask } = buildMatrix(
        manualData.words,
        draftConfig.gridRows,
        draftConfig.gridCols,
        draftConfig.allowDiagonals,
        draftConfig.allowReverse,
      );
      setManualDataset([{ id: 9999, ...manualData, grid, solutionMask }]);
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
        const { grid, solutionMask } = buildMatrix(
          updatedRow.words,
          appliedConfig.gridRows,
          appliedConfig.gridCols,
          appliedConfig.allowDiagonals,
          appliedConfig.allowReverse,
        );
        newDataset[targetPuzzleIndex] = { id: index + 1, ...updatedRow, grid, solutionMask };
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
        setRawCsvData(parsed);
      } catch (error) {
        alert('Error procesando CSV.');
      }
    }
  };

  const handleGenerateBook = () => {
    if (rawCsvData.length === 0) {
      alert('Primero sube un archivo CSV válido.');
      return;
    }

    const generatedPuzzles: Puzzle[] = rawCsvData.map((item, idx) => {
      const { grid, solutionMask } = buildMatrix(
        item.words,
        draftConfig.gridRows,
        draftConfig.gridCols,
        draftConfig.allowDiagonals,
        draftConfig.allowReverse,
      );
      return { id: idx + 1, ...item, grid, solutionMask };
    });

    setAppliedConfig(draftConfig);
    setDataset(generatedPuzzles);
  };

  return (
    <div
      className={`${fontLora.className} ${fontPlayfair.className} ${fontMerriweather.className}`}
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
