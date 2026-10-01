'use client';

import React from 'react';
import styled from 'styled-components';
import { Puzzle, BookConfig, CanvasElement } from '../../types';
import {
  KdpPageCanvas,
  PuzzleTitle,
  VersicleContainer,
  PuzzleCardContainer,
  SopaGrid,
  SopaCell,
  WordsContainer,
  PageNumberIndicator,
  BackgroundImage,
} from '../../styles/components';

const GridAndWordsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

interface LayoutSinglePageProps {
  puzzle: Puzzle;
  appliedConfig: BookConfig;
  showPreviewSolutions: boolean;
  pageNum: number;
  derivedPageType: 'left' | 'right';
  bgForThisPage: any;
  highlightWordsInVerse: (verse: string, words: string[]) => React.ReactNode;
  renderSolutionOverlays: (puzzle: Puzzle, cols: number, rows: number) => React.ReactNode;
  renderFloatingElements: (side: 'left' | 'right', puzzleId: number, elements: CanvasElement[]) => React.ReactNode;
}

export default function LayoutSinglePage({
  puzzle,
  appliedConfig,
  showPreviewSolutions,
  pageNum,
  derivedPageType,
  bgForThisPage,
  highlightWordsInVerse,
  renderSolutionOverlays,
  renderFloatingElements,
}: LayoutSinglePageProps) {
  
  const renderGrid = () => (
    <SopaGrid
      $cols={puzzle.grid?.[0]?.length || appliedConfig.gridCols}
      $rows={puzzle.grid?.length || appliedConfig.gridRows}
      $outerLineWidth={appliedConfig.gridSettings.outerLineWidth}
      $borderColor={appliedConfig.gridSettings.borderColor}
      $version={appliedConfig.layoutVersion as any}
      style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.grid || 1 }}
    >
      {(puzzle.grid || []).map((row, rIdx) =>
        row.map((letter, cIdx) => (
          <SopaCell
            key={`${rIdx}-${cIdx}`}
            $cols={puzzle.grid?.[0]?.length || appliedConfig.gridCols}
            $innerLineWidth={appliedConfig.gridSettings.innerLineWidth}
            $borderColor={appliedConfig.gridSettings.borderColor}
            $cellPadding={appliedConfig.gridSettings.cellPadding}
            $isAnswer={puzzle.solutionMask?.[rIdx]?.[cIdx]}
            $showPreview={showPreviewSolutions}
            $fontSize={appliedConfig.gridTypography.fontSize}
            $fontFamily={appliedConfig.gridTypography.fontFamily}
            $fontWeight={appliedConfig.gridTypography.fontWeight}
            $fontStyle={appliedConfig.gridTypography.fontStyle}
            $color={appliedConfig.gridTypography.color}
          >
            {letter}
          </SopaCell>
        )),
      )}
      {showPreviewSolutions && renderSolutionOverlays(puzzle, puzzle.grid?.[0]?.length || appliedConfig.gridCols, puzzle.grid?.length || appliedConfig.gridRows)}
    </SopaGrid>
  );

  const renderWords = () => (
    <WordsContainer
      $cols={appliedConfig.wordColumns}
      $fontSize={appliedConfig.cluesTypography.fontSize}
      $fontFamily={appliedConfig.cluesTypography.fontFamily}
      $fontWeight={appliedConfig.cluesTypography.fontWeight}
      $fontStyle={appliedConfig.cluesTypography.fontStyle}
      $lineHeight={appliedConfig.cluesTypography.lineHeight}
      $color={appliedConfig.cluesTypography.color}
      $textAlign={appliedConfig.cluesTypography.textAlign}
      $paddingTop={appliedConfig.cluesTypography.paddingTop}
      $paddingBottom={appliedConfig.cluesTypography.paddingBottom}
      $paddingLeft={appliedConfig.cluesTypography.paddingLeft}
      $paddingRight={appliedConfig.cluesTypography.paddingRight}
      style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.words || 1 }}
    >
      {puzzle.words.map((w, wIdx) => (
        <div key={wIdx}>{w.trim().toUpperCase()}</div>
      ))}
    </WordsContainer>
  );

  return (
    <KdpPageCanvas
      id={`puzzle-${pageNum}`}
      className="kdp-page"
      $pageType={derivedPageType}
      $margins={appliedConfig.pageMargins}
    >
      {bgForThisPage && bgForThisPage.imgData && (
        <BackgroundImage
          src={bgForThisPage.imgData}
          $opacity={appliedConfig.bgOpacity / 100}
        />
      )}

      {/* TÍTULO SIEMPRE ARRIBA */}
      <PuzzleTitle
        $fontSize={appliedConfig.titleTypography.fontSize}
        $fontFamily={appliedConfig.titleTypography.fontFamily}
        $fontWeight={appliedConfig.titleTypography.fontWeight}
        $fontStyle={appliedConfig.titleTypography.fontStyle}
        $lineHeight={appliedConfig.titleTypography.lineHeight}
        $color={appliedConfig.titleTypography.color}
        $textAlign={appliedConfig.titleTypography.textAlign}
        $paddingTop={appliedConfig.titleTypography.paddingTop}
        $paddingBottom={appliedConfig.titleTypography.paddingBottom}
        $paddingLeft={appliedConfig.titleTypography.paddingLeft}
        $paddingRight={appliedConfig.titleTypography.paddingRight}
        style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.title || 1 }}
      >
        {puzzle.title}
      </PuzzleTitle>

      {/* VERSÍCULO ARRIBA (Solo para Versiones 1, 2 y 7) */}
      {(appliedConfig.layoutVersion === 1 ||
        appliedConfig.layoutVersion === 2 ||
        appliedConfig.layoutVersion === 7) && (
          <VersicleContainer
            $version={appliedConfig.layoutVersion as any}
            $fontSize={appliedConfig.verseTypography.fontSize}
            $fontFamily={appliedConfig.verseTypography.fontFamily}
            $fontWeight={appliedConfig.verseTypography.fontWeight}
            $fontStyle={appliedConfig.verseTypography.fontStyle}
            $lineHeight={appliedConfig.verseTypography.lineHeight}
            $color={appliedConfig.verseTypography.color}
            $textAlign={appliedConfig.verseTypography.textAlign}
            $paddingTop={appliedConfig.verseTypography.paddingTop}
            $paddingBottom={appliedConfig.verseTypography.paddingBottom}
            $paddingLeft={appliedConfig.verseTypography.paddingLeft}
            $paddingRight={appliedConfig.verseTypography.paddingRight}
            style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.verse || 1 }}
          >
            {(appliedConfig.layoutVersion === 1 || appliedConfig.layoutVersion === 7) ? (
              `"${puzzle.scripture}"`
            ) : (
              <>
                "{highlightWordsInVerse(puzzle.scripture, puzzle.words)}"
              </>
            )}
          </VersicleContainer>
        )}

      {/* SECCIÓN INFERIOR ANCLADA AL FONDO (Flexbox flex-end) */}
      <GridAndWordsContainer>
        {appliedConfig.layoutVersion === 7 ? (
          <PuzzleCardContainer style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.grid || 1 }}>
            {renderWords()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
              id="Capa_1"
              x={0}
              y={0}
              viewBox="0 0 488.6 24.4"
            >
              <style>
                {
                  ".st0{fill:#020203}.st1{fill:none;stroke:#020203;stroke-width:.5;stroke-miterlimit:10}"
                }
              </style>
              <path
                d="M238.2 12.5c3.2 0 5.7-2.6 5.7-5.7 0 3.2 2.6 5.7 5.7 5.7-3.2 0-5.7 2.6-5.7 5.7.1-3.1-2.5-5.7-5.7-5.7zM231.8 12.5c1.6 0 2.9-1.3 2.9-2.9 0 1.6 1.3 2.9 2.9 2.9-1.6 0-2.9 1.3-2.9 2.9-.1-1.6-1.4-2.9-2.9-2.9zM250.5 12.5c1.6 0 2.9-1.3 2.9-2.9 0 1.6 1.3 2.9 2.9 2.9-1.5-.1-2.9 1.3-2.9 2.9-.1-1.6-1.4-2.9-2.9-2.9z"
                className="st0"
              />
              <path d="M3.9 12.5h226.7" className="st1" />
              <circle cx={3.9} cy={12.5} r={1.4} className="st0" />
              <path d="M484.1 12.5H257.3" className="st1" />
              <circle cx={484.1} cy={12.5} r={1.4} className="st0" />
            </svg>
            {renderGrid()}
          </PuzzleCardContainer>
        ) : (
          <>
            {renderGrid()}
            {appliedConfig.layoutVersion === 1 && renderWords()}
          </>
        )}
      </GridAndWordsContainer>

      {/* VERSÍCULO ABAJO (Solo para Versión 3) */}
      {appliedConfig.layoutVersion === 3 && (
        <VersicleContainer
          $version={appliedConfig.layoutVersion as any}
          $fontSize={appliedConfig.verseTypography.fontSize}
          $fontFamily={appliedConfig.verseTypography.fontFamily}
          $fontWeight={appliedConfig.verseTypography.fontWeight}
          $fontStyle={appliedConfig.verseTypography.fontStyle}
          $lineHeight={appliedConfig.verseTypography.lineHeight}
          $color={appliedConfig.verseTypography.color}
          $textAlign={appliedConfig.verseTypography.textAlign}
          $paddingTop={appliedConfig.verseTypography.paddingTop}
          $paddingBottom={appliedConfig.verseTypography.paddingBottom}
          $paddingLeft={appliedConfig.verseTypography.paddingLeft}
          $paddingRight={appliedConfig.verseTypography.paddingRight}
          style={{ marginTop: '16px' }}
        >
          <>"{highlightWordsInVerse(puzzle.scripture, puzzle.words)}"</>
        </VersicleContainer>
      )}

      <PageNumberIndicator $pageType={derivedPageType}>{pageNum}</PageNumberIndicator>

      {/* ELEMENTOS FLOTANTES */}
      {renderFloatingElements(derivedPageType, puzzle.id, puzzle.floatingElements || [])}
    </KdpPageCanvas>
  );
}
