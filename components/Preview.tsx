'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { Puzzle, BookConfig, CanvasElement } from '../types';
import LayoutFactory from './preview/LayoutFactory';
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

  const renderFloatingElements = (targetSide: 'left' | 'right', puzzleId: number, elements: CanvasElement[]) => {
    if (!elements || elements.length === 0) return null;
    const sideElements = elements.filter(el => el.pageSide === targetSide);
    if (sideElements.length === 0) return null;

    return sideElements.map(el => (
      <Rnd
        key={el.id}
        bounds="parent"
        size={{ width: el.width, height: el.height }}
        position={{ x: el.x, y: el.y }}
        disableDragging={el.isLocked}
        enableResizing={!el.isLocked}
        onDragStop={(e, d) => {
          if (!onUpdateFloatingElements) return;
          const newEls = elements.map(fe => fe.id === el.id ? { ...fe, x: d.x, y: d.y } : fe);
          onUpdateFloatingElements(puzzleId, newEls);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          if (!onUpdateFloatingElements) return;
          const newEls = elements.map(fe => fe.id === el.id ? { ...fe, width: ref.style.width, height: ref.style.height, ...position } : fe);
          onUpdateFloatingElements(puzzleId, newEls);
        }}
        style={{ zIndex: el.zIndex, position: 'absolute' }}
      >
        {el.type === 'image' && el.src && (
          <img src={el.src} alt="Floating" style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: el.isLocked ? 'default' : 'move' }} draggable={false} />
        )}
        {el.type === 'text' && (
          <div style={{ width: '100%', height: '100%', fontSize: '16pt', fontFamily: 'var(--font-opensans)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', wordBreak: 'break-word', cursor: el.isLocked ? 'default' : 'move' }}>
            {el.text}
          </div>
        )}
      </Rnd>
    ));
  };

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

          const assignedPageRight = assignedPageLeft + 1;

          const bgForLeftPage = appliedConfig.backgrounds.find(
            (bg) => assignedPageLeft >= bg.startPage && assignedPageLeft <= bg.endPage,
          );

          const bgForRightPage = isSpreadLayout ? appliedConfig.backgrounds.find(
            (bg) => assignedPageRight >= bg.startPage && assignedPageRight <= bg.endPage,
          ) : undefined;

          return (
            <LayoutFactory
              key={`puzzle-${puzzle.id}`}
              puzzle={puzzle}
              appliedConfig={appliedConfig}
              showPreviewSolutions={showPreviewSolutions}
              assignedPageLeft={assignedPageLeft}
              assignedPageRight={assignedPageRight}
              bgForLeftPage={bgForLeftPage}
              bgForRightPage={bgForRightPage}
              highlightWordsInVerse={highlightWordsInVerse}
              renderSolutionOverlays={renderSolutionOverlays}
              renderFloatingElements={renderFloatingElements}
            />
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
              $margins={appliedConfig.pageMargins}
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
                      $cols={puzzle.grid[0]?.length || appliedConfig.gridCols}
                      $rows={puzzle.grid?.length || appliedConfig.gridRows}
                      $showBorder={appliedConfig.gridSettings.outerLineWidth > 0}
                    >
                      {puzzle.grid.map((row, rIdx) =>
                        row.map((letter, cIdx) => (
                          <MiniCell
                            key={`mini-${rIdx}-${cIdx}`}
                            $cols={puzzle.grid[0]?.length || appliedConfig.gridCols}
                            $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
                            $showLines={appliedConfig.gridSettings.innerLineWidth > 0}
                          >
                            {letter}
                          </MiniCell>
                        )),
                      )}
                      {renderSolutionOverlays(puzzle, puzzle.grid[0]?.length || appliedConfig.gridCols, puzzle.grid?.length || appliedConfig.gridRows)}
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
