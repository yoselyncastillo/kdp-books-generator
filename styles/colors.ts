// src/styles/colors.ts

export const COLORS = {
    // 🎨 UI: Colores para el Panel de Control
    ui: {
      primary: '#1e90ff',     
      secondary: '#2ed573',   
      danger: '#ff4757',      
      background: '#f5f6fa',  
      surface: '#ffffff',     
      border: '#ced6e0',      
    },
    // 📝 TEXTO: Jerarquía tipográfica de la UI
    text: {
      main: '#2f3542',        
      muted: '#57606f',       
      light: '#a4b0be',       
    },
    // 🖨️ PRINT: Colores estrictos para el PDF de KDP
    print: {
      black: '#000000',
      white: '#ffffff',
      previewHighlight: '#f39c12', 
      solutionMask: '#bdc3c7',     
      miniGridLine: '#b2bec3',     
    }
  } as const;