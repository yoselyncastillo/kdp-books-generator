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
export const KdpPageCanvas = styled.div<{ $pageType?: 'left' | 'right'; $margins?: { top: number; bottom: number; inner: number; outer: number } }>`
  width: 8.5in;
  height: 11in;
  min-width: 8.5in;
  min-height: 11in;
  max-width: 8.5in;
  max-height: 11in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 25px;
  box-sizing: border-box;
  

  /* Márgenes dinámicos según el tipo de página. */
  padding: ${({ $pageType, $margins }) => {
    const top = $margins?.top ?? 0.3;
    const bottom = $margins?.bottom ?? 0.3;
    const inner = $margins?.inner ?? 0.8;
    const outer = $margins?.outer ?? 0.5;
    
    if ($pageType === 'left') return `${top}in ${inner}in ${bottom}in ${outer}in`;
    return `${top}in ${outer}in ${bottom}in ${inner}in`; // right or default
  }};

  /* Mantenemos tu distribución vertical original */
  display: flex;
  flex-direction: column;
  gap: 16px;

  position: relative; /* Clave para que la paginación absoluta funcione */
  overflow: hidden;
  background-color: ${COLORS.print.white};

  /* 👇 AQUÍ ESTÁ EL TRUCO: Mapear los offsets del absolute con tus paddings */
  &::before {
    content: '';
    position: absolute;
    pointer-events: none;
    z-index: 99; /* Súbelo para que se pinte por encima de las imágenes de fondo si tienes */
    border: 1.5px dashed transparent; /* Punteado para que parezca una guía de diseño */
    opacity: 0.6;

    top: ${({ $margins }) => $margins?.top ?? 0.3}in;
    bottom: ${({ $margins }) => $margins?.bottom ?? 0.3}in;

    ${({ $pageType, $margins }) => {
      const inner = $margins?.inner ?? 0.8;
      const outer = $margins?.outer ?? 0.5;
      if ($pageType === 'left') {
        return `
            right: ${inner}in;
            left: ${outer}in;
          `;
      }
      // right or default
      return `
          right: ${outer}in;
          left: ${inner}in;
        `;
    }}
  }

  @media print {
    page-break-after: always !important;
    page-break-inside: avoid !important;
    margin: 0 !important;
    box-shadow: none !important;
    &::before {
      display: none !important;
    }
  }
`;

export const SpreadContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
  
  @media print {
    display: block;
    gap: 0;
    margin-bottom: 0;
  }
`;

export const NotesContainer = styled.div<{ $spacing: number }>`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.$spacing}px;
  flex: 1; /* Para que ocupe el resto de la página hacia abajo */
`;

export const NoteLine = styled.div<{ $color: string }>`
  border-bottom: 1px solid ${(props) => props.$color};
  height: 2rem;
  width: 100%;
`;

export const ReflectionText = styled.div<{
  $fontSize: number;
  $fontFamily: string;
  $fontWeight: number;
  $fontStyle: string;
  $lineHeight: number;
  $color: string;
  $textAlign: string;
  $paddingTop: number;
  $paddingBottom: number;
  $paddingLeft: number;
  $paddingRight: number;
}>`
  font-size: ${(props) => props.$fontSize}pt;
  font-family: ${(props) => props.$fontFamily};
  font-weight: ${(props) => props.$fontWeight};
  font-style: ${(props) => props.$fontStyle};
  line-height: ${(props) => props.$lineHeight};
  color: ${(props) => props.$color};
  text-align: ${(props) => props.$textAlign};
  padding: ${(props) => `${props.$paddingTop}px ${props.$paddingRight}px ${props.$paddingBottom}px ${props.$paddingLeft}px`};
  z-index: 1;
`;

export const FooterPrayerText = styled.div<{
  $fontSize: number;
  $fontFamily: string;
  $fontWeight: number;
  $fontStyle: string;
  $lineHeight: number;
  $color: string;
  $textAlign: string;
  $paddingTop: number;
  $paddingBottom: number;
  $paddingLeft: number;
  $paddingRight: number;
}>`
  font-size: ${(props) => props.$fontSize}pt;
  font-family: ${(props) => props.$fontFamily};
  font-weight: ${(props) => props.$fontWeight};
  font-style: ${(props) => props.$fontStyle};
  line-height: ${(props) => props.$lineHeight};
  color: ${(props) => props.$color};
  text-align: ${(props) => props.$textAlign};
  padding: ${(props) => `${props.$paddingTop}px ${props.$paddingRight}px ${props.$paddingBottom}px ${props.$paddingLeft}px`};
  z-index: 1;
  position: absolute;
  bottom: 1in;
  left: 0;
  right: 0;
  width: 100%;
  box-sizing: border-box;
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

export const PuzzleTitle = styled.h2<{
  $fontSize: number;
  $fontFamily: string;
  $fontWeight: number;
  $fontStyle: string;
  $lineHeight: number;
  $color: string;
  $textAlign: string;
  $paddingTop: number;
  $paddingBottom: number;
  $paddingLeft: number;
  $paddingRight: number;
}>`
  font-size: ${(props) => props.$fontSize}pt;
  font-family: ${(props) => props.$fontFamily};
  font-weight: ${(props) => props.$fontWeight};
  font-style: ${(props) => props.$fontStyle};
  line-height: ${(props) => props.$lineHeight};
  color: ${(props) => props.$color};
  text-align: ${(props) => props.$textAlign};
  padding: ${(props) => `${props.$paddingTop}px ${props.$paddingRight}px ${props.$paddingBottom}px ${props.$paddingLeft}px`};
  z-index: 1;
  margin: 0;
`;

export const VersicleContainer = styled.div<{
  $version: number;
  $fontSize: number;
  $fontFamily: string;
  $fontWeight: number;
  $fontStyle: string;
  $lineHeight: number;
  $color: string;
  $textAlign: string;
  $paddingTop: number;
  $paddingBottom: number;
  $paddingLeft: number;
  $paddingRight: number;
}>`
  font-size: ${(props) => props.$fontSize}pt;
  font-family: ${(props) => props.$fontFamily};
  font-weight: ${(props) => props.$fontWeight};
  font-style: ${(props) => props.$fontStyle};
  line-height: ${(props) => props.$lineHeight};
  color: ${(props) => props.$color};
  text-align: ${(props) => props.$textAlign};
  padding: ${(props) => `${props.$paddingTop}px ${props.$paddingRight}px ${props.$paddingBottom}px ${props.$paddingLeft}px`};
  z-index: 1;
  letter-spacing: 0.5px;

  display: block;
  // height: 7cm;
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

export const PuzzleCardContainer = styled.div`
  background-color: #ffffff;
  // border-radius: 12px;
  // box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 auto;
  width: 100%;
  position: relative;
`;

export const KdpContentCard = styled.div`
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  /* height: 100%; */
  box-sizing: border-box;
  position: relative;

  @media print {
    /* box-shadow: none !important; */
  }
`;

export const SopaGrid = styled.div<{
  $cols: number;
  $rows: number;
  $outerLineWidth: number;
  $borderColor: string;
  $version: number;
}>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols}, minmax(0, 1fr));
  width: 100%;
  margin: 0 auto;
  border: ${(props) => props.$outerLineWidth > 0 ? `${props.$outerLineWidth}px solid ${props.$borderColor}` : 'none'};
  z-index: 1;

  ${({ $version }) =>
    ($version === 2 || $version === 3) &&
    css`
      margin-bottom: 24px;
    `}
`;

export const SopaCell = styled.div<{
  $cols: number;
  $innerLineWidth: number;
  $borderColor: string;
  $cellPadding: number;
  $isAnswer: boolean;
  $showPreview: boolean;
  $fontSize: number;
  $fontFamily: string;
  $fontWeight: number;
  $fontStyle: string;
  $color: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.$fontSize}pt;
  font-family: ${(props) => props.$fontFamily};
  font-weight: ${(props) => props.$fontWeight};
  font-style: ${(props) => props.$fontStyle};
  color: ${(props) => props.$color};
  border-right: ${(props) =>
    props.$innerLineWidth > 0 ? `${props.$innerLineWidth}px solid ${props.$borderColor}` : 'none'};
  border-bottom: ${(props) =>
    props.$innerLineWidth > 0 ? `${props.$innerLineWidth}px solid ${props.$borderColor}` : 'none'};
  box-sizing: border-box;
  &:nth-child(${(props) => props.$cols}n) {
    border-right: none;
  }
  &:nth-last-child(-n + ${(props) => props.$cols}) {
    border-bottom: none;
  }
  background-color: transparent;
  padding: ${(props) => props.$cellPadding}px;
  aspect-ratio: 1 / 1;
`;

export const WordsContainer = styled.div<{
  $cols: number;
  $fontSize: number;
  $fontFamily: string;
  $fontWeight: number;
  $fontStyle: string;
  $lineHeight: number;
  $color: string;
  $textAlign: string;
  $paddingTop: number;
  $paddingBottom: number;
  $paddingLeft: number;
  $paddingRight: number;
}>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols}, 1fr);
  gap: 10px;
  text-align: ${(props) => props.$textAlign};
  font-size: ${(props) => props.$fontSize}pt;
  font-weight: ${(props) => props.$fontWeight};
  font-family: ${(props) => props.$fontFamily};
  font-style: ${(props) => props.$fontStyle};
  line-height: ${(props) => props.$lineHeight};
  color: ${(props) => props.$color};
  padding: ${(props) => `${props.$paddingTop}px ${props.$paddingRight}px ${props.$paddingBottom}px ${props.$paddingLeft}px`};
  z-index: 1;
`;

/* DEFENSA ABSOLUTA DE LA PAGINACIÓN: Nunca se moverá */
export const PageNumberIndicator = styled.div<{ $pageType?: 'left' | 'right' }>`
  position: absolute;
  top: 0.3in;
  text-align: center;
  font-size: 11pt;
  font-weight: bold;
  font-family: 'Montserrat', sans-serif;
  color: ${COLORS.print.white};
  z-index: 1;
  padding: 0 24px 0;
  background-color: #8d8b8bff;
  height: 40pt;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 👇 DINÁMICO: Posición y bordes redondeados según el lado 👇 */
  ${({ $pageType }) => {
    if ($pageType === 'left') {
      return `
        left: 0;
        right: auto;
        border-radius: 0 24px 24px 0; /* Redondeado hacia adentro en la izquierda */
      `;
    }
    // Por defecto o si es 'right'
    return `
      right: 0;
      left: auto;
      border-radius: 24px 0 0 24px; /* Redondeado hacia adentro en la derecha */
    `;
  }}

  /* Fuerza los colores correctos en el PDF */
  @media print {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background-color: #8d8b8bff !important;
    color: ${COLORS.print.white} !important;
  }
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
  /* justify-content: center; */
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
  position: relative;
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols}, minmax(0, 1fr));
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
  background-color: transparent;
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
    props.$showLines ? `0.5px solid ${COLORS.print.black}` : 'none'};
  border-bottom: ${(props) =>
    props.$showLines ? `0.5px solid ${COLORS.print.black}` : 'none'};

  &:nth-child(${(props) => props.$cols}n) {
    border-right: none;
  }
  &:nth-last-child(-n + ${(props) => props.$cols}) {
    border-bottom: none;
  }
`;

export const SolutionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
`;

export const CapsuleHighlight = styled.div<{
  $top: string;
  $left: string;
  $width: string;
  $height: string;
  $angle: number;
}>`
  position: absolute;
  top: ${(props) => props.$top};
  left: ${(props) => props.$left};
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  border: 1.5px solid #000;
  border-radius: 999px;
  background-color: transparent;
  transform: translate(-50%, -50%) rotate(${(props) => props.$angle}deg);
  transform-origin: center center;
  pointer-events: none;
  box-sizing: border-box;
`;
