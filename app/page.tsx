'use client';

import Preview from '@/components/Preview';
import Sidebar from '@/components/Sidebar';
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
        />
        <Preview
          dataset={dataset}
          appliedConfig={appliedConfig}
          zoomLevel={zoomLevel}
          showPreviewSolutions={showPreviewSolutions}
        />
      </LayoutWrapper>
    </div>
  );
}
