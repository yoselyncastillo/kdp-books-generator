'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { Puzzle, BookConfig, CanvasElement } from '../types';
import {
  PreviewCanvasContainer,
  ZoomWrapper,
  KdpPageCanvas,
  SpreadContainer,
  BackgroundImage,
  PuzzleTitle,
  VersicleContainer,
  PuzzleCardContainer,
  KdpContentCard,
  SopaGrid,
  SopaCell,
  WordsContainer,
  PageNumberIndicator,
  SolutionsLayoutGrid,
  SingleSolutionBlock,
  MiniGrid,
  MiniCell,
  NotesContainer,
  NoteLine,
  ReflectionText,
  FooterPrayerText,
  SolutionOverlay,
  CapsuleHighlight,
} from '../styles/components';
import { segmentArray } from '../utils/wordSearch';

interface PreviewProps {
  dataset: Puzzle[];
  appliedConfig: BookConfig;
  zoomLevel: number;
  showPreviewSolutions: boolean;
  onUpdateFloatingElements?: (puzzleId: number, elements: CanvasElement[]) => void;
}

const renderSolutionOverlays = (puzzle: Puzzle, cols: number, rows: number) => {
  if (!puzzle.placedWords || puzzle.placedWords.length === 0) return null;

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'visible',
      }}
    >
      {puzzle.placedWords.map((pw, i) => {
        const dx = pw.endCol - pw.startCol;
        const dy = pw.endRow - pw.startRow;
        const length = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Vector de dirección normalizado
        const nx = dx / length;
        const ny = dy / length;
        
        // Extensión longitudinal extra (en unidades de celda). Ej: 0.2 = 20% de una celda más largo
        const extension = 0.15;

        // Calculamos posiciones extendidas
        const startCol = pw.startCol + 0.5 - (nx * extension);
        const startRow = pw.startRow + 0.5 - (ny * extension);
        const endCol = pw.endCol + 0.5 + (nx * extension);
        const endRow = pw.endRow + 0.5 + (ny * extension);

        const x1 = `${(startCol / cols) * 100}%`;
        const y1 = `${(startRow / rows) * 100}%`;
        const x2 = `${(endCol / cols) * 100}%`;
        const y2 = `${(endRow / rows) * 100}%`;

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#a0a0a0"
            // Se hace más gruesa para que encierre mejor la letra
            strokeWidth={`calc((100% / ${rows}) + 2px)`} 
            strokeLinecap="round"
            fill="none"
            style={{ opacity: 0.5 }}
          />
        );
      })}
    </svg>
  );
};

// LÓGICA DE NEGIRTA: Encuentra las palabras en el versículo y las pone en negrita
const highlightWordsInVerse = (verse: string, words: string[]) => {
  if (!words || words.length === 0) return verse;

  // Ordenamos de mayor a menor longitud para que no haya falsos positivos con fragmentos cortos
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Expresión regular dinámica que ignora mayúsculas/minúsculas y busca la palabra completa (\b)
  const escapedWords = sortedWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

  const parts = verse.split(regex);

  return parts.map((part, index) => {
    const isWord = sortedWords.some(
      (w) => w.toLowerCase() === part.toLowerCase(),
    );
    if (isWord) {
      return (
        <strong
          key={index}
          style={{ fontWeight: 900, textTransform: 'uppercase' }}
        >
          {part}
        </strong>
      );
    }
    return part;
  });
};

export default function Preview({
  dataset,
  appliedConfig,
  zoomLevel,
  showPreviewSolutions,
  onUpdateFloatingElements,
}: PreviewProps) {
  const operationalPuzzles = dataset.slice(0, appliedConfig.maxPages);
  const solutionsBatches = segmentArray<Puzzle>(
    operationalPuzzles,
    appliedConfig.solutionsDensity,
  );

  if (operationalPuzzles.length === 0) {
    return (
      <PreviewCanvasContainer>
        <div
          className="no-print"
          style={{ textAlign: 'center', color: '#a4b0be', marginTop: '150px' }}
        >
          <h2>Panel Vacío</h2>
          <p>
            1. Carga tu CSV <br />
            2. Ajusta los parámetros
            <br />
            3. Haz clic en "Generar"
          </p>
        </div>
      </PreviewCanvasContainer>
    );
  }

  return (
    <PreviewCanvasContainer>
      <ZoomWrapper className="zoom-wrapper" $zoom={zoomLevel}>
        {/* PÁGINAS DE JUEGOS */}
        {operationalPuzzles.map((puzzle, index) => {
          const isSpreadLayout = appliedConfig.layoutVersion >= 4 && appliedConfig.layoutVersion !== 7;
          const assignedPageLeft = isSpreadLayout
            ? appliedConfig.startingPage + index * 2
            : appliedConfig.startingPage + index;

          const assignedPageRight = assignedPageLeft + 1; // Only used for spread

          const bgForThisPage = appliedConfig.backgrounds.find(
            (bg) => assignedPageLeft >= bg.startPage && assignedPageLeft <= bg.endPage,
          );

          const bgForRightPage = isSpreadLayout ? appliedConfig.backgrounds.find(
            (bg) => assignedPageRight >= bg.startPage && assignedPageRight <= bg.endPage,
          ) : undefined;

          const renderFloatingElements = (targetSide: 'left' | 'right') => {
            if (!puzzle.floatingElements || puzzle.floatingElements.length === 0) return null;
            const elements = puzzle.floatingElements.filter(el => el.pageSide === targetSide);
            if (elements.length === 0) return null;

            return elements.map(el => (
              <Rnd
                key={el.id}
                bounds="parent"
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                onDragStop={(e, d) => {
                  if (!onUpdateFloatingElements) return;
                  const newEls = puzzle.floatingElements!.map(fe => fe.id === el.id ? { ...fe, x: d.x, y: d.y } : fe);
                  onUpdateFloatingElements(puzzle.id, newEls);
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (!onUpdateFloatingElements) return;
                  const newEls = puzzle.floatingElements!.map(fe => fe.id === el.id ? { ...fe, width: ref.style.width, height: ref.style.height, ...position } : fe);
                  onUpdateFloatingElements(puzzle.id, newEls);
                }}
                style={{ zIndex: el.zIndex, position: 'absolute' }}
              >
                {el.type === 'image' && el.src && (
                  <img src={el.src} alt="Floating" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                )}
                {el.type === 'text' && (
                  <div style={{ width: '100%', height: '100%', fontSize: '16pt', fontFamily: 'var(--font-opensans)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', wordBreak: 'break-word' }}>
                    {el.text}
                  </div>
                )}
              </Rnd>
            ));
          };

          if (isSpreadLayout) {
            return (
              <SpreadContainer key={`puzzle-${puzzle.id}`}>
                {/* LEFT PAGE */}
                <KdpPageCanvas id={`puzzle-left-${assignedPageLeft}`} className="kdp-page" $pageType={assignedPageLeft % 2 === 0 ? 'left' : 'right'}>
                  {bgForThisPage && bgForThisPage.imgData && (
                    <BackgroundImage src={bgForThisPage.imgData} $opacity={appliedConfig.bgOpacity / 100} />
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

                  {appliedConfig.layoutVersion === 6 && (
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
                      style={{ marginTop: '40px' }}
                    >
                      {puzzle.words.map((w, wIdx) => (
                        <div key={wIdx}>{w.trim().toUpperCase()}</div>
                      ))}
                    </WordsContainer>
                  )}

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
                  

                  <PageNumberIndicator $pageType='left'>{assignedPageLeft}</PageNumberIndicator>
                  {/* ELEMENTOS FLOTANTES (Página Izquierda) */}
                  {renderFloatingElements('left')}
                </KdpPageCanvas>

                {/* RIGHT PAGE */}
                <KdpPageCanvas id={`puzzle-right-${assignedPageRight}`} className="kdp-page" $pageType={assignedPageRight % 2 === 0 ? 'left' : 'right'}>
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
                    >
                      {puzzle.title}
                    </PuzzleTitle>
                  )}

                  {/* V6: Sopa maximizada */}
                  {appliedConfig.layoutVersion === 6 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <KdpContentCard>
                        <SopaGrid
                          $cols={appliedConfig.gridCols}
                          $rows={appliedConfig.gridRows}
                          $outerLineWidth={appliedConfig.gridSettings.outerLineWidth}
                          $borderColor={appliedConfig.gridSettings.borderColor}
                          $version={appliedConfig.layoutVersion as any}
                          style={{ margin: 0 }}
                        >
                          {puzzle.grid.map((row, rIdx) =>
                            row.map((letter, cIdx) => (
                              <SopaCell
                                key={`${rIdx}-${cIdx}`}
                                $cols={appliedConfig.gridCols}
                                $innerLineWidth={appliedConfig.gridSettings.innerLineWidth}
                                $borderColor={appliedConfig.gridSettings.borderColor}
                                $cellPadding={appliedConfig.gridSettings.cellPadding}
                                $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
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
                          {showPreviewSolutions && renderSolutionOverlays(puzzle, appliedConfig.gridCols, appliedConfig.gridRows)}
                        </SopaGrid>
                      </KdpContentCard>
                    </div>
                  )}

                  {/* V4/V5: Sopa normal y lista de palabras */}
                  {(appliedConfig.layoutVersion === 4 || appliedConfig.layoutVersion === 5) && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <KdpContentCard>
                        <SopaGrid
                          $cols={appliedConfig.gridCols}
                          $rows={appliedConfig.gridRows}
                          $outerLineWidth={appliedConfig.gridSettings.outerLineWidth}
                          $borderColor={appliedConfig.gridSettings.borderColor}
                          $version={appliedConfig.layoutVersion as any}
                        >
                          {puzzle.grid.map((row, rIdx) =>
                            row.map((letter, cIdx) => (
                              <SopaCell
                                key={`${rIdx}-${cIdx}`}
                                $cols={appliedConfig.gridCols}
                                $innerLineWidth={appliedConfig.gridSettings.innerLineWidth}
                                $borderColor={appliedConfig.gridSettings.borderColor}
                                $cellPadding={appliedConfig.gridSettings.cellPadding}
                                $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
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
                          {showPreviewSolutions && renderSolutionOverlays(puzzle, appliedConfig.gridCols, appliedConfig.gridRows)}
                        </SopaGrid>
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
                        >
                          {puzzle.words.map((w, wIdx) => (
                            <div key={wIdx}>{w.trim().toUpperCase()}</div>
                          ))}
                        </WordsContainer>
                      </KdpContentCard>
                    </div>
                  )}

                  <PageNumberIndicator $pageType='right'>{assignedPageRight}</PageNumberIndicator>
                  {/* ELEMENTOS FLOTANTES (Página Derecha) */}
                  {renderFloatingElements('right')}
                </KdpPageCanvas>
              </SpreadContainer>
            );
          }

          // SINGLE PAGE LAYOUT
          const pageNum = assignedPageLeft;
          const derivedPageType = pageNum % 2 === 0 ? 'left' : 'right';
          return (
            <KdpPageCanvas key={`puzzle-${puzzle.id}`} id={`puzzle-${pageNum}`} className="kdp-page" $pageType={derivedPageType}>
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

              {(() => {
                const renderGrid = () => (
                  <SopaGrid
                    $cols={appliedConfig.gridCols}
                    $rows={appliedConfig.gridRows}
                    $outerLineWidth={appliedConfig.gridSettings.outerLineWidth}
                    $borderColor={appliedConfig.gridSettings.borderColor}
                    $version={appliedConfig.layoutVersion as any}
                  >
                    {puzzle.grid.map((row, rIdx) =>
                      row.map((letter, cIdx) => (
                        <SopaCell
                          key={`${rIdx}-${cIdx}`}
                          $cols={appliedConfig.gridCols}
                          $innerLineWidth={appliedConfig.gridSettings.innerLineWidth}
                          $borderColor={appliedConfig.gridSettings.borderColor}
                          $cellPadding={appliedConfig.gridSettings.cellPadding}
                          $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
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
                    {showPreviewSolutions && renderSolutionOverlays(puzzle, appliedConfig.gridCols, appliedConfig.gridRows)}
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
                  >
                    {puzzle.words.map((w, wIdx) => (
                      <div key={wIdx}>{w.trim().toUpperCase()}</div>
                    ))}
                  </WordsContainer>
                );

                if (appliedConfig.layoutVersion === 7) {
                  return (
                    <PuzzleCardContainer>
                      {renderWords()}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlSpace="preserve"
                        id="Capa_1"
                        x={0}
                        y={0}
                        style={{
                          // enableBackground: "new 0 0 488.6 24.4",
                        }}
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
                  );
                }

                return (
                  <>
                    {renderGrid()}
                    {appliedConfig.layoutVersion === 1 && renderWords()}
                  </>
                );
              })()}

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
                >
                  <>"{highlightWordsInVerse(puzzle.scripture, puzzle.words)}"</>
                </VersicleContainer>
              )}

              <PageNumberIndicator $pageType={derivedPageType}>{pageNum}</PageNumberIndicator>

              {/* ELEMENTOS FLOTANTES */}
              {renderFloatingElements(derivedPageType)}
            </KdpPageCanvas>
          );
        })}

        {/* PÁGINAS DE SOLUCIONES (Se mantienen igual) */}
        {solutionsBatches.map((batch, batchIdx) => {
          const isSpreadLayout = appliedConfig.layoutVersion >= 4 && appliedConfig.layoutVersion !== 7;
          const startSolutionsPage = isSpreadLayout
            ? appliedConfig.startingPage + operationalPuzzles.length * 2
            : appliedConfig.startingPage + operationalPuzzles.length;

          const currentSolutionPage = startSolutionsPage + batchIdx;
          const derivedSolPageType = currentSolutionPage % 2 === 0 ? 'left' : 'right';
          const bgForThisPage = appliedConfig.backgrounds.find(
            (bg) =>
              currentSolutionPage >= bg.startPage &&
              currentSolutionPage <= bg.endPage,
          );

          return (
            <KdpPageCanvas
              key={`solutions-page-${batchIdx}`}
              className="kdp-page"
              $pageType={derivedSolPageType}
            >
              {bgForThisPage && bgForThisPage.imgData && (
                <BackgroundImage
                  src={bgForThisPage.imgData}
                  $opacity={appliedConfig.bgOpacity / 100}
                />
              )}
              <PuzzleTitle
                $fontSize={24}
                $fontFamily={appliedConfig.titleTypography.fontFamily}
                $fontWeight={appliedConfig.titleTypography.fontWeight}
                $fontStyle={appliedConfig.titleTypography.fontStyle}
                $lineHeight={appliedConfig.titleTypography.lineHeight}
                $color={appliedConfig.titleTypography.color}
                $textAlign="center"
                $paddingTop={0}
                $paddingBottom={0}
                $paddingLeft={0}
                $paddingRight={0}
                style={{ marginTop: '0.2in' }}
              >
                Soluciones
              </PuzzleTitle>

              <SolutionsLayoutGrid $perPage={appliedConfig.solutionsDensity}>
                {batch.map((puzzle) => (
                  <SingleSolutionBlock key={`sol-${puzzle.id}`}>
                    <div
                      style={{
                        fontSize: '10pt',
                        fontWeight: 'bold',
                        marginBottom: '6px',
                        fontFamily: 'Montserrat',
                        zIndex: 1,
                        textAlign: 'center',
                      }}
                    >
                      {puzzle.title} (Pág.{' '}
                      {isSpreadLayout
                        ? appliedConfig.startingPage + operationalPuzzles.findIndex((p) => p.id === puzzle.id) * 2
                        : appliedConfig.startingPage + operationalPuzzles.findIndex((p) => p.id === puzzle.id)
                      }
                      )
                    </div>
                    <MiniGrid
                      $cols={appliedConfig.gridCols}
                      $rows={appliedConfig.gridRows}
                      $showBorder={appliedConfig.gridSettings.outerLineWidth > 0}
                    >
                      {puzzle.grid.map((row, rIdx) =>
                        row.map((letter, cIdx) => (
                          <MiniCell
                            key={`mini-${rIdx}-${cIdx}`}
                            $cols={appliedConfig.gridCols}
                            $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
                            $showLines={appliedConfig.gridSettings.innerLineWidth > 0}
                          >
                            {letter}
                          </MiniCell>
                        )),
                      )}
                      {renderSolutionOverlays(puzzle, appliedConfig.gridCols, appliedConfig.gridRows)}
                    </MiniGrid>
                  </SingleSolutionBlock>
                ))}
              </SolutionsLayoutGrid>

              <PageNumberIndicator $pageType={derivedSolPageType}>{currentSolutionPage}</PageNumberIndicator>
            </KdpPageCanvas>
          );
        })}
      </ZoomWrapper>
    </PreviewCanvasContainer>
  );
}
