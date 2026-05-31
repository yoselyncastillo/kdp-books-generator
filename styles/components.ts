import styled, { css } from 'styled-components';
import { COLORS } from './colors';

// --- LAYOUT ---
export const LayoutWrapper = styled.div`
  display: flex;
  background-color: ${COLORS.ui.background};
  min-height: 100vh;
  @media print {
    display: block !important;
    background: none !important;
  }
`;

export const ControlPanelContainer = styled.div`
  width: 600px;
  background-color: ${COLORS.ui.surface};
  padding: 24px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  z-index: 10;
`;

export const PreviewCanvasContainer = styled.div`
  margin-left: 600px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 600px);
  box-sizing: border-box;
  overflow: hidden;
  @media print {
    margin-left: 0 !important;
    padding: 0 !important;
    width: 8.5in !important;
    display: block !important;
    overflow: visible !important;
  }
`;

export const PanelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

export const ZoomWrapper = styled.div<{ $zoom: number }>`
  transform: scale(${(props) => props.$zoom});
  transform-origin: top center;
  transition: transform 0.2s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

// --- UI COMPONENTS ---
export const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: ${COLORS.text.main};
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
  border-bottom: 1px solid ${COLORS.ui.border};
  padding-bottom: 8px;
`;

export const FieldGroup = styled.div`
  margin-bottom: 16px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${COLORS.text.muted};
  font-size: 0.85rem;
  font-family: 'Montserrat', sans-serif;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${COLORS.ui.border};
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.9rem;
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid ${COLORS.ui.border};
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.9rem;
  background-color: ${COLORS.ui.surface};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
  color: ${COLORS.text.main};
  cursor: pointer;
  margin-bottom: 8px;
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  color: ${COLORS.print.white};
  border: none;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 8px;
  font-family: 'Montserrat', sans-serif;
  background-color: ${(props) =>
    props.$primary ? COLORS.ui.primary : COLORS.ui.secondary};
  &:hover {
    opacity: 0.9;
  }
`;

export const DeleteButton = styled.button`
  background-color: ${COLORS.ui.danger};
  color: ${COLORS.print.white};
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8rem;
`;

// --- KDP PAGES ---
export const KdpPageCanvas = styled.div`
  width: 8.5in;
  height: 11in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 25px;
  padding: 1.5cm;
  box-sizing: border-box;

  /* Mantenemos tu distribución vertical original */
  display: flex;
  flex-direction: column;
  gap: 24px;

  position: relative; /* Clave para que la paginación absoluta funcione */
  overflow: hidden;
  background-color: ${COLORS.print.white};
  /* background-color: blue; */

  @media print {
    page-break-after: always !important;
    page-break-inside: avoid !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  /* &::before {
    content: '';
    position: absolute;
    top: 1.5cm;
    left: 1.5cm;
    right: 1.5cm;
    bottom: 1.5cm;
    border: 1.5px solid blue;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  } */
`;

export const BackgroundImage = styled.img<{ $opacity: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(props) => props.$opacity};
  z-index: 0;
  pointer-events: none;
`;

export const PuzzleTitle = styled.h2`
  font-size: 30pt;
  text-align: center;
  font-family: 'Lora', serif;
  font-style: italic;
  font-weight: 700;
  color: ${COLORS.print.black};
  z-index: 1;
  margin: 0;
`;

export const VersicleContainer = styled.div<{ $version: number }>`
  font-size: 16pt;
  font-style: italic;
  font-family: 'Lora', serif;
  text-align: center;
  line-height: 1.7;
  z-index: 1;
  letter-spacing: 0.5px;
  color: ${COLORS.print.black};

  display: block;
  height: 7cm;
  overflow: hidden;
  /* background-color: red; */
  /* border: 2px solid blue; */
  strong {
    display: inline;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-thickness: 1.5px;
  }
`;

export const SopaGrid = styled.div<{
  $cols: number;
  $rows: number;
  $showBorder: boolean;
  $version: number;
}>`
  /* background-color: blue; */
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols}, 1fr);
  margin: 0 auto;
  border: ${(props) =>
    props.$showBorder ? `1px solid ${COLORS.print.miniGridLine}` : 'none'};
  z-index: 1;

  ${({ $version }) =>
    ($version === 2 || $version === 3) &&
    css`
      padding-bottom: 24px;
    `}
`;

export const SopaCell = styled.div<{
  $cols: number;
  $fontSize: number;
  $isAnswer: boolean;
  $showPreview: boolean;
  $showLines: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.$fontSize}pt;
  line-height: ${(props) => props.$fontSize}pt;
  font-weight: 600;
  font-family: 'Open Sans', Arial, sans-serif;
  color: ${COLORS.print.black};
  border-right: ${(props) =>
    props.$showLines ? `1px solid ${COLORS.print.miniGridLine}` : 'none'};
  border-bottom: ${(props) =>
    props.$showLines ? `1px solid ${COLORS.print.miniGridLine}` : 'none'};
  box-sizing: border-box;
  &:nth-child(${(props) => props.$cols}n) {
    border-right: none;
  }
  &:nth-last-child(-n + ${(props) => props.$cols}) {
    border-bottom: none;
  }
  background-color: ${(props) =>
    props.$isAnswer && props.$showPreview
      ? COLORS.print.previewHighlight
      : 'transparent'};
  @media print {
    background-color: transparent !important;
  }
  padding: 8px;
  aspect-ratio: 1 / 1;
`;

export const WordsContainer = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols}, 1fr);
  gap: 10px;
  text-align: center;
  font-size: 16pt;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  color: ${COLORS.print.black};
  z-index: 1;
`;

/* DEFENSA ABSOLUTA DE LA PAGINACIÓN: Nunca se moverá */
export const PageNumberIndicator = styled.div`
  position: absolute;
  bottom: 1.5cm; /* Anclado exactamente al límite de tu margen azul */
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11pt;
  font-weight: bold;
  font-family: 'Montserrat', sans-serif;
  color: ${COLORS.print.black};
  z-index: 1;
`;

export const SolutionsLayoutGrid = styled.div<{ $perPage: number }>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: ${(props) =>
    props.$perPage === 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'};
  gap: 30px;
  height: 9in;
  width: 100%;
  margin-top: 0.1in;
  z-index: 1;
`;

export const SingleSolutionBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${COLORS.ui.border};
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

export const MiniGrid = styled.div<{
  $cols: number;
  $rows: number;
  $showBorder: boolean;
}>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols}, 1fr);
  width: 100%;
  max-width: 2.3in;
  aspect-ratio: ${(props) => props.$cols} / ${(props) => props.$rows};
  box-sizing: border-box;
  border: ${(props) =>
    props.$showBorder ? `1.5px solid ${COLORS.print.black}` : 'none'};
`;

export const MiniCell = styled.div<{
  $cols: number;
  $isAnswer: boolean;
  $showLines: boolean;
}>`
  background-color: ${(props) =>
    props.$isAnswer ? COLORS.print.solutionMask : 'transparent'};
  color: ${(props) =>
    props.$isAnswer ? COLORS.print.black : COLORS.text.light};
  font-weight: ${(props) => (props.$isAnswer ? 'bold' : 'normal')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7.5pt;
  font-family: Arial, sans-serif;
  box-sizing: border-box;

  border-right: ${(props) =>
    props.$showLines ? `1px solid ${COLORS.print.miniGridLine}` : 'none'};
  border-bottom: ${(props) =>
    props.$showLines ? `1px solid ${COLORS.print.miniGridLine}` : 'none'};

  &:nth-child(${(props) => props.$cols}n) {
    border-right: none;
  }
  &:nth-last-child(-n + ${(props) => props.$cols}) {
    border-bottom: none;
  }
`;
