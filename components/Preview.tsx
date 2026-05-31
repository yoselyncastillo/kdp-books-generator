'use client';

import React from 'react';
import { Puzzle, BookConfig } from '../types';
import {
  PreviewCanvasContainer,
  ZoomWrapper,
  KdpPageCanvas,
  BackgroundImage,
  PuzzleTitle,
  VersicleContainer,
  SopaGrid,
  SopaCell,
  WordsContainer,
  PageNumberIndicator,
  SolutionsLayoutGrid,
  SingleSolutionBlock,
  MiniGrid,
  MiniCell,
} from '../styles/components';
import { segmentArray } from '../utils/wordSearch';

interface PreviewProps {
  dataset: Puzzle[];
  appliedConfig: BookConfig;
  zoomLevel: number;
  showPreviewSolutions: boolean;
}

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
          const assignedPage = appliedConfig.startingPage + index;
          const bgForThisPage = appliedConfig.backgrounds.find(
            (bg) => assignedPage >= bg.startPage && assignedPage <= bg.endPage,
          );

          return (
            <KdpPageCanvas key={`puzzle-${puzzle.id}`} id={`puzzle-${assignedPage}`} className="kdp-page">
              {bgForThisPage && bgForThisPage.imgData && (
                <BackgroundImage
                  src={bgForThisPage.imgData}
                  $opacity={appliedConfig.bgOpacity / 100}
                />
              )}

              {/* TÍTULO SIEMPRE ARRIBA */}
              <PuzzleTitle>{puzzle.title}</PuzzleTitle>

              {/* VERSÍCULO ARRIBA (Solo para Versiones 1 y 2) */}
              {(appliedConfig.layoutVersion === 1 ||
                appliedConfig.layoutVersion === 2) && (
                <VersicleContainer $version={appliedConfig.layoutVersion}>
                  {appliedConfig.layoutVersion === 1 ? (
                    `"${puzzle.scripture}"`
                  ) : (
                    <>
                      "{highlightWordsInVerse(puzzle.scripture, puzzle.words)}"
                    </>
                  )}
                </VersicleContainer>
              )}

              {/* LA SOPA DE LETRAS */}
              <SopaGrid
                $cols={appliedConfig.gridCols}
                $rows={appliedConfig.gridRows}
                $showBorder={appliedConfig.showExternalBorder}
                $version={appliedConfig.layoutVersion}
              >
                {puzzle.grid.map((row, rIdx) =>
                  row.map((letter, cIdx) => (
                    <SopaCell
                      key={`${rIdx}-${cIdx}`}
                      $cols={appliedConfig.gridCols}
                      $fontSize={appliedConfig.cellFontSize}
                      $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
                      $showPreview={showPreviewSolutions}
                      $showLines={appliedConfig.showInternalLines}
                    >
                      {letter}
                    </SopaCell>
                  )),
                )}
              </SopaGrid>

              {/* LISTA DE PALABRAS ABAJO (Solo para Versión 1) */}
              {appliedConfig.layoutVersion === 1 && (
                <WordsContainer $cols={appliedConfig.wordColumns}>
                  {puzzle.words.map((w, wIdx) => (
                    <div key={wIdx}>{w.trim().toUpperCase()}</div>
                  ))}
                </WordsContainer>
              )}

              {/* VERSÍCULO ABAJO (Solo para Versión 3) */}
              {appliedConfig.layoutVersion === 3 && (
                <VersicleContainer $version={appliedConfig.layoutVersion}>
                  <>"{highlightWordsInVerse(puzzle.scripture, puzzle.words)}"</>
                </VersicleContainer>
              )}

              <PageNumberIndicator>{assignedPage}</PageNumberIndicator>
            </KdpPageCanvas>
          );
        })}

        {/* PÁGINAS DE SOLUCIONES (Se mantienen igual) */}
        {solutionsBatches.map((batch, batchIdx) => {
          const currentSolutionPage =
            appliedConfig.startingPage + operationalPuzzles.length + batchIdx;
          const bgForThisPage = appliedConfig.backgrounds.find(
            (bg) =>
              currentSolutionPage >= bg.startPage &&
              currentSolutionPage <= bg.endPage,
          );

          return (
            <KdpPageCanvas
              key={`solutions-page-${batchIdx}`}
              className="kdp-page"
            >
              {bgForThisPage && bgForThisPage.imgData && (
                <BackgroundImage
                  src={bgForThisPage.imgData}
                  $opacity={appliedConfig.bgOpacity / 100}
                />
              )}
              <PuzzleTitle style={{ fontSize: '24pt', marginTop: '0.2in' }}>
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
                      {appliedConfig.startingPage +
                        operationalPuzzles.findIndex((p) => p.id === puzzle.id)}
                      )
                    </div>
                    <MiniGrid
                      $cols={appliedConfig.gridCols}
                      $rows={appliedConfig.gridRows}
                      $showBorder={appliedConfig.showExternalBorder}
                    >
                      {puzzle.grid.map((row, rIdx) =>
                        row.map((letter, cIdx) => (
                          <MiniCell
                            key={`mini-${rIdx}-${cIdx}`}
                            $cols={appliedConfig.gridCols}
                            $isAnswer={puzzle.solutionMask[rIdx][cIdx]}
                            $showLines={appliedConfig.showInternalLines}
                          >
                            {letter}
                          </MiniCell>
                        )),
                      )}
                    </MiniGrid>
                  </SingleSolutionBlock>
                ))}
              </SolutionsLayoutGrid>

              <PageNumberIndicator>{currentSolutionPage}</PageNumberIndicator>
            </KdpPageCanvas>
          );
        })}
      </ZoomWrapper>
    </PreviewCanvasContainer>
  );
}
