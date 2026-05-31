import { createGlobalStyle } from 'styled-components';


export const KdpPrintStyles = createGlobalStyle`
  @page { size: 8.5in 11in; margin: 0; }
  
  @media print {
    body, html { background: #ffffff !important; width: 8.5in; height: 11in; }
    .no-print { display: none !important; }
    .zoom-wrapper { transform: scale(1) !important; transform-origin: top left !important; }
  }
`;