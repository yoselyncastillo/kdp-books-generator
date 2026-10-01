'use client';

import React from 'react';
import styled from 'styled-components';
import { Puzzle, BookConfig, CanvasElement } from '../../types';
import {
  KdpPageCanvas,
  BackgroundImage,
  PuzzleTitle,
  VersicleContainer,
  ReflectionText,
  NotesContainer,
  NoteLine,
  WordsContainer,
  FooterPrayerText,
  PageNumberIndicator,
  KdpContentCard,
  SopaGrid,
  SopaCell,
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

interface LayoutSpreadPageProps {
  puzzle: Puzzle;
  appliedConfig: BookConfig;
  showPreviewSolutions: boolean;
  assignedPageLeft: number;
  assignedPageRight: number;
  bgForLeftPage: any;
  bgForRightPage: any;
  renderSolutionOverlays: (puzzle: Puzzle, cols: number, rows: number) => React.ReactNode;
  renderFloatingElements: (side: 'left' | 'right', puzzleId: number, elements: CanvasElement[]) => React.ReactNode;
}

export default function LayoutSpreadPage({
  puzzle,
  appliedConfig,
  showPreviewSolutions,
  assignedPageLeft,
  assignedPageRight,
  bgForLeftPage,
  bgForRightPage,
  renderSolutionOverlays,
  renderFloatingElements,
}: LayoutSpreadPageProps) {

  const renderGrid = (marginZero = false) => (
    <SopaGrid
      $cols={puzzle.grid?.[0]?.length || appliedConfig.gridCols}
      $rows={puzzle.grid?.length || appliedConfig.gridRows}
      $outerLineWidth={appliedConfig.gridSettings.outerLineWidth}
      $borderColor={appliedConfig.gridSettings.borderColor}
      $version={appliedConfig.layoutVersion as any}
      style={{
        position: 'relative',
        zIndex: appliedConfig.layerZIndices?.grid || 1,
        ...(marginZero ? { margin: 0 } : {})
      }}
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

  const renderWords = (marginTop = false) => (
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
      style={{
        position: 'relative',
        zIndex: appliedConfig.layerZIndices?.words || 1,
        ...(marginTop ? { marginTop: '0.2in' } : {})
      }}
    >
      {puzzle.words.map((w, wIdx) => (
        <div key={wIdx}>{w.trim().toUpperCase()}</div>
      ))}
    </WordsContainer>
  );

  return (
    <>
      {/* LEFT PAGE */}
      <KdpPageCanvas
        id={`puzzle-left-${assignedPageLeft}`}
        className="kdp-page"
        $pageType={assignedPageLeft % 2 === 0 ? 'left' : 'right'}
        $margins={appliedConfig.pageMargins}
      >
        {bgForLeftPage && bgForLeftPage.imgData && (
          <BackgroundImage src={bgForLeftPage.imgData} $opacity={appliedConfig.bgOpacity / 100} />
        )}

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
          "{puzzle.scripture}"
        </VersicleContainer>

        {appliedConfig.layoutVersion === 4 && puzzle.reflectionText && (
          <ReflectionText
            $fontSize={appliedConfig.reflectionTypography.fontSize}
            $fontFamily={appliedConfig.reflectionTypography.fontFamily}
            $fontWeight={appliedConfig.reflectionTypography.fontWeight}
            $fontStyle={appliedConfig.reflectionTypography.fontStyle}
            $lineHeight={appliedConfig.reflectionTypography.lineHeight}
            $color={appliedConfig.reflectionTypography.color}
            $textAlign={appliedConfig.reflectionTypography.textAlign}
            $paddingTop={appliedConfig.reflectionTypography.paddingTop}
            $paddingBottom={appliedConfig.reflectionTypography.paddingBottom}
            $paddingLeft={appliedConfig.reflectionTypography.paddingLeft}
            $paddingRight={appliedConfig.reflectionTypography.paddingRight}
          >
            {puzzle.reflectionText}
          </ReflectionText>
        )}

        {appliedConfig.layoutVersion === 5 && (
          <NotesContainer $spacing={appliedConfig.notesSettings.spacing}>
            {Array.from({ length: appliedConfig.notesSettings.quantity }).map((_, i) => <NoteLine key={i} $color={appliedConfig.notesSettings.color} />)}
          </NotesContainer>
        )}

        {appliedConfig.layoutVersion === 6 && renderWords(true)}

        {puzzle.footerPrayer && (
          <FooterPrayerText
            $fontSize={appliedConfig.footerPrayerTypography.fontSize}
            $fontFamily={appliedConfig.footerPrayerTypography.fontFamily}
            $fontWeight={appliedConfig.footerPrayerTypography.fontWeight}
            $fontStyle={appliedConfig.footerPrayerTypography.fontStyle}
            $lineHeight={appliedConfig.footerPrayerTypography.lineHeight}
            $color={appliedConfig.footerPrayerTypography.color}
            $textAlign={appliedConfig.footerPrayerTypography.textAlign}
            $paddingTop={appliedConfig.footerPrayerTypography.paddingTop}
            $paddingBottom={appliedConfig.footerPrayerTypography.paddingBottom}
            $paddingLeft={appliedConfig.footerPrayerTypography.paddingLeft}
            $paddingRight={appliedConfig.footerPrayerTypography.paddingRight}
          >
            {puzzle.footerPrayer}
          </FooterPrayerText>
        )}

        <PageNumberIndicator $pageType={assignedPageLeft % 2 === 0 ? 'left' : 'right'}>{assignedPageLeft}</PageNumberIndicator>
        {/* ELEMENTOS FLOTANTES (Página Izquierda) */}
        {renderFloatingElements('left', puzzle.id, puzzle.floatingElements || [])}
      </KdpPageCanvas>

      {/* RIGHT PAGE */}
      <KdpPageCanvas
        id={`puzzle-right-${assignedPageRight}`}
        className="kdp-page"
        $pageType={assignedPageRight % 2 === 0 ? 'left' : 'right'}
        $margins={appliedConfig.pageMargins}
      >
        {bgForRightPage && bgForRightPage.imgData && (
          <BackgroundImage src={bgForRightPage.imgData} $opacity={appliedConfig.bgOpacity / 100} />
        )}

        {!appliedConfig.hideRightTitle && (
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
        )}

        {/* ANCLAJE INFERIOR PARA EL GRID / PALABRAS */}
        <GridAndWordsContainer>
          {appliedConfig.layoutVersion === 6 ? (
            <KdpContentCard style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.grid || 1 }}>
              {renderGrid(true)}
            </KdpContentCard>
          ) : (
            <KdpContentCard style={{ position: 'relative', zIndex: appliedConfig.layerZIndices?.grid || 1 }}>
              {renderGrid()}
              {renderWords()}
            </KdpContentCard>
          )}
        </GridAndWordsContainer>

        <PageNumberIndicator $pageType={assignedPageRight % 2 === 0 ? 'left' : 'right'}>{assignedPageRight}</PageNumberIndicator>
        {/* ELEMENTOS FLOTANTES (Página Derecha) */}
        {renderFloatingElements('right', puzzle.id, puzzle.floatingElements || [])}
      </KdpPageCanvas>
    </>
  );
}
