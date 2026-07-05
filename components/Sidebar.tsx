'use client';

import React from 'react';
import { BookConfig, BackgroundLayer } from '../types';
import { Accordion } from './Accordion';
import { exportCsvFile } from '../utils/csvHelper';
import { DEFAULT_LAYOUT_CONFIGS } from '../utils/layoutConfigs';
import {
  ControlPanelContainer,
  SectionTitle,
  FieldGroup,
  FieldRow,
  FieldLabel,
  StyledInput,
  CheckboxLabel,
  ActionButton,
  DeleteButton,
  StyledSelect,
} from '../styles/components';

interface SidebarProps {
  draftConfig: BookConfig;
  setDraftConfig: React.Dispatch<React.SetStateAction<BookConfig>>;
  rawCsvDataLength: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  showPreviewSolutions: boolean;
  setShowPreviewSolutions: (s: boolean) => void;
  isTestingManual: boolean;
  setIsTestingManual: (m: boolean) => void;
  manualData: import('../types').RawPuzzleData;
  setManualData: React.Dispatch<React.SetStateAction<import('../types').RawPuzzleData>>;
  activePageIndex: number;
  setActivePageIndex: (i: number) => void;
  rawCsvData: import('../types').RawPuzzleData[];
  onUpdateCsvRow: (index: number, updatedRow: import('../types').RawPuzzleData) => void;
  setShowFullTable: (show: boolean) => void;
}

export default function Sidebar({
  draftConfig,
  setDraftConfig,
  rawCsvDataLength,
  onFileUpload,
  onGenerate,
  zoomLevel,
  setZoomLevel,
  showPreviewSolutions,
  setShowPreviewSolutions,
  isTestingManual,
  setIsTestingManual,
  manualData,
  setManualData,
  activePageIndex,
  setActivePageIndex,
  rawCsvData,
  onUpdateCsvRow,
  setShowFullTable,
}: SidebarProps) {
  const [localInlineData, setLocalInlineData] = React.useState<import('../types').RawPuzzleData | null>(null);
  const [floatingTargetSide, setFloatingTargetSide] = React.useState<'left' | 'right'>('left');

  React.useEffect(() => {
    if (rawCsvData && rawCsvData.length > 0 && activePageIndex < rawCsvData.length) {
      setLocalInlineData(rawCsvData[activePageIndex]);
    } else {
      setLocalInlineData(null);
    }
  }, [rawCsvData, activePageIndex]);

  const handleInlineChange = (field: keyof import('../types').RawPuzzleData, value: string) => {
    if (!localInlineData) return;
    if (field === 'words') {
      setLocalInlineData({ ...localInlineData, words: value.split(',').map(w => w.trim()) });
    } else {
      setLocalInlineData({ ...localInlineData, [field]: value });
    }
  };

  const handleInlineBlur = () => {
    if (localInlineData) {
      onUpdateCsvRow(activePageIndex, localInlineData);
    }
  };

  const handlePageChange = (step: number) => {
    const newIdx = Math.max(0, Math.min(rawCsvData.length - 1, activePageIndex + step));
    setActivePageIndex(newIdx);
    const el = document.getElementById(`puzzle-${newIdx + draftConfig.startingPage}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const updateTypography = (configKey: keyof BookConfig, field: string, value: any) => {
    setDraftConfig({
      ...draftConfig,
      [configKey]: {
        ...(draftConfig[configKey] as any),
        [field]: value,
      },
    });
  };

  const updateNotesSettings = (field: string, value: any) => {
    setDraftConfig({
      ...draftConfig,
      notesSettings: {
        ...draftConfig.notesSettings,
        [field]: value,
      },
    });
  };

  const updateGridSettings = (field: string, value: any) => {
    setDraftConfig({
      ...draftConfig,
      gridSettings: {
        ...draftConfig.gridSettings,
        [field]: value,
      },
    });
  };

  const activePuzzleData = isTestingManual ? manualData : rawCsvData[activePageIndex];
  const floatingElements = activePuzzleData?.floatingElements || [];

  const updateFloatingElements = (newElements: import('../types').CanvasElement[]) => {
    if (isTestingManual) {
      setManualData({ ...manualData, floatingElements: newElements });
    } else if (rawCsvData[activePageIndex]) {
      onUpdateCsvRow(activePageIndex, { ...rawCsvData[activePageIndex], floatingElements: newElements });
    }
  };

  const handleAddFloatingImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const newEl: import('../types').CanvasElement = {
          id: crypto.randomUUID(),
          type: 'image',
          src,
          x: 100,
          y: 100,
          width: 150,
          height: 150,
          zIndex: floatingElements.length + 1,
          pageSide: floatingTargetSide,
        };
        updateFloatingElements([...floatingElements, newEl]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFloatingText = () => {
    const newEl: import('../types').CanvasElement = {
      id: crypto.randomUUID(),
      type: 'text',
      text: 'Nuevo Texto',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      zIndex: floatingElements.length + 1,
      pageSide: floatingTargetSide,
    };
    updateFloatingElements([...floatingElements, newEl]);
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...floatingElements.map(el => el.zIndex), 0);
    updateFloatingElements(
      floatingElements.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el)
    );
  };

  const sendToBack = (id: string) => {
    const minZ = Math.min(...floatingElements.map(el => el.zIndex), 0);
    updateFloatingElements(
      floatingElements.map(el => el.id === id ? { ...el, zIndex: minZ - 1 } : el)
    );
  };

  const removeFloatingElement = (id: string) => {
    updateFloatingElements(floatingElements.filter(el => el.id !== id));
  };

  const renderTypographyControls = (configKey: 'titleTypography' | 'verseTypography' | 'cluesTypography' | 'reflectionTypography' | 'footerPrayerTypography' | 'gridTypography') => (
    <>
      <FieldRow>
        <div style={{ flex: 1 }}>
          <FieldLabel>Tamaño (pt)</FieldLabel>
          <StyledInput type="number" value={draftConfig[configKey].fontSize} onChange={e => updateTypography(configKey, 'fontSize', parseInt(e.target.value) || 12)} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Grosor</FieldLabel>
          <StyledSelect value={draftConfig[configKey].fontWeight} onChange={e => updateTypography(configKey, 'fontWeight', parseInt(e.target.value) || 400)}>
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
          </StyledSelect>
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Estilo</FieldLabel>
          <StyledSelect value={draftConfig[configKey].fontStyle} onChange={e => updateTypography(configKey, 'fontStyle', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </StyledSelect>
        </div>
      </FieldRow>
      <FieldRow>
        <div style={{ flex: 2 }}>
          <FieldLabel>Fuente</FieldLabel>
          <StyledSelect value={draftConfig[configKey].fontFamily} onChange={e => updateTypography(configKey, 'fontFamily', e.target.value)}>
            <option value="var(--font-lora), Lora, serif">Lora (Serif)</option>
            <option value="var(--font-playfair), 'Playfair Display', serif">Playfair Display</option>
            <option value="var(--font-merriweather), Merriweather, serif">Merriweather</option>
            <option value="var(--font-montserrat), Montserrat, sans-serif">Montserrat (Sans)</option>
            <option value="var(--font-opensans), 'Open Sans', sans-serif">Open Sans</option>
            <option value="var(--font-spicy-rice), 'Spicy Rice', cursive">Spicy Rice</option>
            <option value="var(--font-limelight), Limelight, cursive">Limelight</option>
            <option value="var(--font-boogaloo), Boogaloo, cursive">Boogaloo</option>
          </StyledSelect>
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Color</FieldLabel>
          <StyledInput type="color" value={draftConfig[configKey].color} onChange={e => updateTypography(configKey, 'color', e.target.value)} style={{ padding: '0', height: '36px' }} />
        </div>
      </FieldRow>
      <FieldRow>
        <div style={{ flex: 1 }}>
          <FieldLabel>Alineación</FieldLabel>
          <StyledSelect value={draftConfig[configKey].textAlign} onChange={e => updateTypography(configKey, 'textAlign', e.target.value)}>
            <option value="left">Izquierda</option>
            <option value="center">Centro</option>
            <option value="right">Derecha</option>
            <option value="justify">Justificado</option>
          </StyledSelect>
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Interlineado</FieldLabel>
          <StyledInput type="number" step="0.1" value={draftConfig[configKey].lineHeight} onChange={e => updateTypography(configKey, 'lineHeight', parseFloat(e.target.value) || 1)} />
        </div>
      </FieldRow>
      <FieldLabel style={{ marginTop: '10px' }}>Paddings (px)</FieldLabel>
      <FieldRow>
        <div style={{ flex: 1 }}>
          <FieldLabel>Arriba</FieldLabel>
          <StyledInput type="number" value={draftConfig[configKey].paddingTop} onChange={e => updateTypography(configKey, 'paddingTop', parseInt(e.target.value) || 0)} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Abajo</FieldLabel>
          <StyledInput type="number" value={draftConfig[configKey].paddingBottom} onChange={e => updateTypography(configKey, 'paddingBottom', parseInt(e.target.value) || 0)} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Izq</FieldLabel>
          <StyledInput type="number" value={draftConfig[configKey].paddingLeft} onChange={e => updateTypography(configKey, 'paddingLeft', parseInt(e.target.value) || 0)} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Der</FieldLabel>
          <StyledInput type="number" value={draftConfig[configKey].paddingRight} onChange={e => updateTypography(configKey, 'paddingRight', parseInt(e.target.value) || 0)} />
        </div>
      </FieldRow>
    </>
  );

  return (
    <ControlPanelContainer className="no-print">
      
      <SectionTitle style={{ marginTop: '10px' }}>Panel de Configuración</SectionTitle>

      <Accordion title="1. Editor de Datos (CsvEditor)" defaultOpen>
        <FieldGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={isTestingManual}
              onChange={(e) => setIsTestingManual(e.target.checked)}
            />{' '}
            <strong>Modo Prueba Manual</strong>
          </CheckboxLabel>
        </FieldGroup>

        {!isTestingManual && (
          <FieldGroup>
            <FieldLabel>Cargar archivo (.csv)</FieldLabel>
            <StyledInput type="file" accept=".csv" onChange={onFileUpload} />
            <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#888' }}>
              Datos cargados: {rawCsvDataLength} versículos
            </div>
          </FieldGroup>
        )}

        {isTestingManual && (
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #ffeeba' }}>
            <FieldGroup>
              <FieldLabel>Título / Cita Bíblica</FieldLabel>
              <StyledInput type="text" value={manualData.title} onChange={(e) => setManualData({ ...manualData, title: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Versículo</FieldLabel>
              <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced6e0', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' }} value={manualData.scripture} onChange={(e) => setManualData({ ...manualData, scripture: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Palabras Clave (separadas por comas)</FieldLabel>
              <StyledInput type="text" value={manualData.words.join(', ')} onChange={(e) => setManualData({ ...manualData, words: e.target.value.split(',').map(w => w.trim()) })} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Texto de Reflexión (Solo V4)</FieldLabel>
              <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced6e0', fontFamily: 'inherit', minHeight: '60px', resize: 'vertical' }} value={manualData.reflectionText || ''} onChange={(e) => setManualData({ ...manualData, reflectionText: e.target.value })} placeholder="Escribe aquí el devocional o reflexión..." />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Oración Final / Footer Prayer</FieldLabel>
              <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced6e0', fontFamily: 'inherit', minHeight: '40px', resize: 'vertical' }} value={manualData.footerPrayer || ''} onChange={(e) => setManualData({ ...manualData, footerPrayer: e.target.value })} placeholder="Opcional. Oración corta..." />
            </FieldGroup>
          </div>
        )}

        {!isTestingManual && rawCsvData.length > 0 && (
          <div style={{ backgroundColor: '#f5f6fa', padding: '15px', borderRadius: '6px', border: '1px solid #ced6e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <ActionButton style={{ width: '30%', padding: '6px', fontSize: '0.85rem' }} onClick={() => handlePageChange(-1)} disabled={activePageIndex === 0}>◀ Anterior</ActionButton>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Página {activePageIndex + draftConfig.startingPage} ({activePageIndex + 1} / {rawCsvData.length})</span>
              <ActionButton style={{ width: '30%', padding: '6px', fontSize: '0.85rem' }} onClick={() => handlePageChange(1)} disabled={activePageIndex === rawCsvData.length - 1}>Siguiente ▶</ActionButton>
            </div>

            {localInlineData && (
              <>
                <FieldGroup>
                  <FieldLabel>Título</FieldLabel>
                  <StyledInput type="text" value={localInlineData.title} onChange={(e) => handleInlineChange('title', e.target.value)} onBlur={handleInlineBlur} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Versículo</FieldLabel>
                  <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced6e0', fontFamily: 'inherit', minHeight: '60px', resize: 'vertical' }} value={localInlineData.scripture} onChange={(e) => handleInlineChange('scripture', e.target.value)} onBlur={handleInlineBlur} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Palabras</FieldLabel>
                  <StyledInput type="text" value={localInlineData.words.join(', ')} onChange={(e) => handleInlineChange('words', e.target.value)} onBlur={handleInlineBlur} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Reflexión (V4)</FieldLabel>
                  <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced6e0', fontFamily: 'inherit', minHeight: '60px', resize: 'vertical' }} value={localInlineData.reflectionText || ''} onChange={(e) => handleInlineChange('reflectionText', e.target.value)} onBlur={handleInlineBlur} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Oración Final / Footer Prayer</FieldLabel>
                  <textarea style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced6e0', fontFamily: 'inherit', minHeight: '40px', resize: 'vertical' }} value={localInlineData.footerPrayer || ''} onChange={(e) => handleInlineChange('footerPrayer', e.target.value)} onBlur={handleInlineBlur} />
                </FieldGroup>
              </>
            )}
            
            <ActionButton onClick={() => setShowFullTable(true)} style={{ backgroundColor: '#ffffff', color: '#2f3542', border: '1px dashed #ced6e0', marginTop: '10px' }}>
              ⊞ Ver Tabla Completa
            </ActionButton>
            <ActionButton onClick={() => exportCsvFile(rawCsvData)} style={{ backgroundColor: '#009432', marginTop: '10px' }} $primary>
              ↓ Exportar CSV Modificado
            </ActionButton>
          </div>
        )}
      </Accordion>

      <Accordion title="2. Layout Global">
        <FieldRow>
          <div style={{ flex: 1 }}>
            <FieldLabel>Nº Puzzles Max</FieldLabel>
            <StyledInput type="number" value={draftConfig.maxPages} onChange={(e) => setDraftConfig({ ...draftConfig, maxPages: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Pág Inicial</FieldLabel>
            <StyledInput type="number" value={draftConfig.startingPage} onChange={(e) => setDraftConfig({ ...draftConfig, startingPage: parseInt(e.target.value) || 0 })} />
          </div>
        </FieldRow>
        <FieldGroup>
          <FieldLabel>Disposición de la Página</FieldLabel>
          <StyledSelect value={draftConfig.layoutVersion} onChange={(e) => {
            const newVersion = parseInt(e.target.value) as any;
            const layoutDefaults = DEFAULT_LAYOUT_CONFIGS[newVersion] || DEFAULT_LAYOUT_CONFIGS[1];
            setDraftConfig({
              ...draftConfig,
              ...layoutDefaults
            });
          }}>
            <optgroup label="Una Página">
              <option value={1}>V1: Versículo + Sopa + Lista</option>
              <option value={2}>V2: Versículo (Negritas) + Sopa</option>
              <option value={3}>V3: Sopa + Versículo (Negritas)</option>
              <option value={7}>V7: Versículo + Lista + Sopa</option>
            </optgroup>
            <optgroup label="Doble Página (Spread)">
              <option value={4}>V4: Reflexión (Izq) + Sopa (Der)</option>
              <option value={5}>V5: Notas (Izq) + Sopa (Der)</option>
              <option value={6}>V6: Palabras (Izq) + Sopa Max (Der)</option>
            </optgroup>
          </StyledSelect>
        </FieldGroup>
        
        <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Imágenes de Fondo</SectionTitle>
        <FieldGroup>
          <FieldLabel>Subir Imagen de Fondo</FieldLabel>
          <StyledInput type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const imgData = event.target?.result as string;
                setDraftConfig({
                  ...draftConfig,
                  backgrounds: [{ id: Date.now().toString(), startPage: 1, endPage: 999, imgData }]
                });
              };
              reader.readAsDataURL(file);
            }
          }} />
          {draftConfig.backgrounds.length > 0 && (
            <DeleteButton style={{ marginTop: '10px', width: '100%' }} onClick={() => setDraftConfig({ ...draftConfig, backgrounds: [] })}>
              Remover Imagen de Fondo
            </DeleteButton>
          )}
        </FieldGroup>

        <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />
        <FieldGroup>
          <FieldLabel style={{ color: '#e1b12c' }}>Visualización y Testeo</FieldLabel>
          <FieldLabel style={{ marginTop: '10px' }}>Zoom de Pantalla: {Math.round(zoomLevel * 100)}%</FieldLabel>
          <StyledInput type="range" min="0.3" max="1.5" step="0.05" value={zoomLevel} onChange={(e) => setZoomLevel(parseFloat(e.target.value))} />
        </FieldGroup>
        <FieldLabel>Opacidad Fondo KDP ({draftConfig.bgOpacity}%)</FieldLabel>
        <StyledInput type="range" min="0" max="100" step="1" value={draftConfig.bgOpacity} onChange={(e) => setDraftConfig({ ...draftConfig, bgOpacity: parseInt(e.target.value) })} style={{ marginBottom: '15px' }} />
      </Accordion>

      <Accordion title="3. Tipografía del Título">
        <CheckboxLabel style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fdfdfd', border: '1px dashed #ced6e0' }}>
          <input type="checkbox" checked={draftConfig.hideRightTitle} onChange={(e) => setDraftConfig({ ...draftConfig, hideRightTitle: e.target.checked })} />{' '}
          Ocultar título en página derecha (Multipágina)
        </CheckboxLabel>
        {renderTypographyControls("titleTypography")}
      </Accordion>

      <Accordion title="4. Tipografía del Versículo">
        {renderTypographyControls("verseTypography")}
      </Accordion>

      <Accordion title="5. Tipografía de Pistas (Palabras)">
        <FieldGroup style={{ marginBottom: '15px' }}>
          <FieldLabel>Columnas para Lista de Palabras</FieldLabel>
          <StyledInput type="number" value={draftConfig.wordColumns} onChange={(e) => setDraftConfig({ ...draftConfig, wordColumns: parseInt(e.target.value) || 1 })} />
        </FieldGroup>
        {renderTypographyControls("cluesTypography")}
      </Accordion>

      <Accordion title="6. Contenido Extra Multipágina">
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Notas en Blanco (V5)</SectionTitle>
        <FieldRow>
          <div style={{ flex: 1 }}>
            <FieldLabel>Renglones</FieldLabel>
            <StyledInput type="number" value={draftConfig.notesSettings.quantity} onChange={(e) => updateNotesSettings('quantity', parseInt(e.target.value) || 1)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Espaciado (px)</FieldLabel>
            <StyledInput type="number" value={draftConfig.notesSettings.spacing} onChange={(e) => updateNotesSettings('spacing', parseInt(e.target.value) || 15)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Color</FieldLabel>
            <StyledInput type="color" value={draftConfig.notesSettings.color} onChange={(e) => updateNotesSettings('color', e.target.value)} style={{ padding: '0', height: '36px' }} />
          </div>
        </FieldRow>
        
        <hr style={{ borderTop: '1px solid #eee', margin: '20px 0' }} />
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Reflexión (V4)</SectionTitle>
        {renderTypographyControls("reflectionTypography")}
        
        <hr style={{ borderTop: '1px solid #eee', margin: '20px 0' }} />
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Oración Final / Footer Prayer</SectionTitle>
        {renderTypographyControls("footerPrayerTypography")}
      </Accordion>

      <Accordion title="7. Elementos Flotantes & Capas">
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Añadir a esta página</SectionTitle>
        <div style={{ marginBottom: '15px' }}>
          <FieldLabel>Página de destino (solo Spread Layouts)</FieldLabel>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <CheckboxLabel>
              <input type="radio" name="floatingSide" checked={floatingTargetSide === 'left'} onChange={() => setFloatingTargetSide('left')} /> Izquierda
            </CheckboxLabel>
            <CheckboxLabel>
              <input type="radio" name="floatingSide" checked={floatingTargetSide === 'right'} onChange={() => setFloatingTargetSide('right')} /> Derecha
            </CheckboxLabel>
          </div>
        </div>
        <FieldRow>
          <div style={{ flex: 1 }}>
            <ActionButton as="label" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
              + Imagen Libre
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAddFloatingImage} />
            </ActionButton>
          </div>
          <div style={{ flex: 1 }}>
            <ActionButton onClick={handleAddFloatingText}>+ Texto Libre</ActionButton>
          </div>
        </FieldRow>

        {floatingElements.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <SectionTitle style={{ fontSize: '1rem', border: 'none', marginBottom: '8px' }}>Capas Activas</SectionTitle>
            {floatingElements.map((el, i) => (
              <div key={el.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '4px', backgroundColor: '#fafafa' }}>
                <span style={{ fontSize: '0.85rem', flex: 1 }}>
                  {el.type === 'image' ? `📷 Imagen ${i + 1}` : `📝 Texto ${i + 1}`}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ActionButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => sendToBack(el.id)}>⬇️ Fondo</ActionButton>
                  <ActionButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => bringToFront(el.id)}>⬆️ Frente</ActionButton>
                  <DeleteButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => removeFloatingElement(el.id)}>X</DeleteButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      <Accordion title="8. Configuración del Puzzle Grid & Soluciones">
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Algoritmo y Dificultad</SectionTitle>
        <FieldRow>
          <div style={{ flex: 1 }}>
            <FieldLabel>Filas</FieldLabel>
            <StyledInput type="number" value={draftConfig.gridRows} onChange={(e) => setDraftConfig({ ...draftConfig, gridRows: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Columnas</FieldLabel>
            <StyledInput type="number" value={draftConfig.gridCols} onChange={(e) => setDraftConfig({ ...draftConfig, gridCols: parseInt(e.target.value) || 0 })} />
          </div>
        </FieldRow>
        <FieldGroup style={{ marginTop: '10px' }}>
          <CheckboxLabel>
            <input type="checkbox" checked={draftConfig.allowDiagonals} onChange={(e) => setDraftConfig({ ...draftConfig, allowDiagonals: e.target.checked })} />{' '}
            Permitir Diagonales
          </CheckboxLabel>
          <CheckboxLabel>
            <input type="checkbox" checked={draftConfig.allowReverse} onChange={(e) => setDraftConfig({ ...draftConfig, allowReverse: e.target.checked })} />{' '}
            Permitir Invertidas
          </CheckboxLabel>
        </FieldGroup>
        
        <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Tipografía Interna de las Letras</SectionTitle>
        {renderTypographyControls("gridTypography")}

        <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Diseño de Celda</SectionTitle>
        <FieldRow>
          <div style={{ flex: 1 }}>
            <FieldLabel>Grosor L. Interna</FieldLabel>
            <StyledInput type="number" step="0.1" value={draftConfig.gridSettings.innerLineWidth} onChange={(e) => updateGridSettings('innerLineWidth', parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Grosor L. Externa</FieldLabel>
            <StyledInput type="number" step="0.1" value={draftConfig.gridSettings.outerLineWidth} onChange={(e) => updateGridSettings('outerLineWidth', parseFloat(e.target.value) || 0)} />
          </div>
        </FieldRow>
        <FieldRow>
          <div style={{ flex: 1 }}>
            <FieldLabel>Padding (px)</FieldLabel>
            <StyledInput type="number" value={draftConfig.gridSettings.cellPadding} onChange={(e) => updateGridSettings('cellPadding', parseInt(e.target.value) || 0)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Color Bordes</FieldLabel>
            <StyledInput type="color" value={draftConfig.gridSettings.borderColor} onChange={(e) => updateGridSettings('borderColor', e.target.value)} style={{ padding: '0', height: '36px' }} />
          </div>
        </FieldRow>
        
        <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />
        <SectionTitle style={{ fontSize: '1rem', border: 'none' }}>Soluciones</SectionTitle>
        <FieldRow>
          <div style={{ flex: 1 }}>
            <FieldLabel>Puzzles por Página (Soluciones)</FieldLabel>
            <StyledSelect value={draftConfig.solutionsDensity} onChange={(e) => setDraftConfig({ ...draftConfig, solutionsDensity: parseInt(e.target.value) })}>
              <option value={4}>4 por página</option>
              <option value={6}>6 por página</option>
            </StyledSelect>
          </div>
        </FieldRow>
        <CheckboxLabel style={{ marginTop: '10px' }}>
          <input type="checkbox" checked={showPreviewSolutions} onChange={(e) => setShowPreviewSolutions(e.target.checked)} />
          Ver soluciones en modo test (Solo Preview)
        </CheckboxLabel>
      </Accordion>

      <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', paddingTop: '15px', paddingBottom: '15px', borderTop: '1px solid #eee', zIndex: 100, marginTop: '20px' }}>
        <ActionButton $primary onClick={onGenerate}>
          Aplicar Cambios
        </ActionButton>
        <ActionButton style={{ backgroundColor: '#2f3542', marginTop: '10px' }} onClick={() => window.print()}>
          Exportar a PDF (Ctrl + P)
        </ActionButton>
      </div>

    </ControlPanelContainer>
  );
}
