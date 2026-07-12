'use client';

import React from 'react';
import { Puzzle, BookConfig, CanvasElement } from '../../types';
import LayoutSinglePage from './LayoutSinglePage';
import LayoutSpreadPage from './LayoutSpreadPage';
import { SpreadContainer } from '../../styles/components';

interface LayoutFactoryProps {
  puzzle: Puzzle;
  appliedConfig: BookConfig;
  showPreviewSolutions: boolean;
  assignedPageLeft: number;
  assignedPageRight: number;
  bgForLeftPage: any;
  bgForRightPage: any;
  highlightWordsInVerse: (verse: string, words: string[]) => React.ReactNode;
  renderSolutionOverlays: (puzzle: Puzzle, cols: number, rows: number) => React.ReactNode;
  renderFloatingElements: (side: 'left' | 'right', puzzleId: number, elements: CanvasElement[]) => React.ReactNode;
}

export default function LayoutFactory(props: LayoutFactoryProps) {
  const isSpreadLayout = props.appliedConfig.layoutVersion >= 4 && props.appliedConfig.layoutVersion !== 7;

  if (isSpreadLayout) {
    return (
      <SpreadContainer>
        <LayoutSpreadPage {...props} />
      </SpreadContainer>
    );
  }

  const derivedPageType = props.assignedPageLeft % 2 === 0 ? 'left' : 'right';

  return (
    <LayoutSinglePage
      puzzle={props.puzzle}
      appliedConfig={props.appliedConfig}
      showPreviewSolutions={props.showPreviewSolutions}
      pageNum={props.assignedPageLeft}
      derivedPageType={derivedPageType}
      bgForThisPage={props.bgForLeftPage}
      highlightWordsInVerse={props.highlightWordsInVerse}
      renderSolutionOverlays={props.renderSolutionOverlays}
      renderFloatingElements={props.renderFloatingElements}
    />
  );
}
