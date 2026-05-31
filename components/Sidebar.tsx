'use client';

import React from 'react';
import { BookConfig, BackgroundLayer } from '../types';
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
  PanelGrid,
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
}: SidebarProps) {
  const addBackgroundRow = () => {
    const newBg: BackgroundLayer = {
      id: Date.now().toString(),
      imgData: '',
      startPage: 1,
      endPage: 10,
    };
    setDraftConfig({
      ...draftConfig,
      backgrounds: [...draftConfig.backgrounds, newBg],
    });
  };

  const updateBackground = (
    id: string,
    field: keyof BackgroundLayer,
    value: any,
  ) => {
    const updated = draftConfig.backgrounds.map((bg) =>
      bg.id === id ? { ...bg, [field]: value } : bg,
    );
    setDraftConfig({ ...draftConfig, backgrounds: updated });
  };

  const handleBgImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateBackground(id, 'imgData', reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <ControlPanelContainer className="no-print">
      <PanelGrid>
        {/* COLUMNA IZQUIERDA: Datos y Estructura */}
        <div>
          <SectionTitle>1. Datos y Estructura</SectionTitle>

          <FieldGroup>
            <FieldLabel>Cargar archivo (.csv)</FieldLabel>
            <StyledInput type="file" accept=".csv" onChange={onFileUpload} />
            <div
              style={{ fontSize: '0.8rem', marginTop: '4px', color: '#888' }}
            >
              Datos cargados: {rawCsvDataLength} versículos
            </div>
          </FieldGroup>

          <FieldRow>
            <div style={{ flex: 1 }}>
              <FieldLabel>Nº Puzzles</FieldLabel>
              <StyledInput
                type="number"
                value={draftConfig.maxPages || ''}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    maxPages: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Pág Inicial</FieldLabel>
              <StyledInput
                type="number"
                value={draftConfig.startingPage || ''}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    startingPage: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </FieldRow>

          <FieldGroup>
            <FieldLabel>Disposición de la Página</FieldLabel>
            <StyledSelect
              value={draftConfig.layoutVersion}
              onChange={(e) =>
                setDraftConfig({
                  ...draftConfig,
                  layoutVersion: parseInt(e.target.value) as 1 | 2 | 3,
                })
              }
            >
              <option value={1}>V1: Versículo + Sopa + Lista</option>
              <option value={2}>V2: Versículo (Negritas) + Sopa</option>
              <option value={3}>V3: Sopa + Versículo (Negritas)</option>
            </StyledSelect>
          </FieldGroup>

          <FieldGroup style={{ marginTop: '20px' }}>
            <FieldLabel>Dificultad del Algoritmo</FieldLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={draftConfig.allowDiagonals}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    allowDiagonals: e.target.checked,
                  })
                }
              />{' '}
              Permitir Diagonales
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={draftConfig.allowReverse}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    allowReverse: e.target.checked,
                  })
                }
              />{' '}
              Permitir Invertidas
            </CheckboxLabel>
          </FieldGroup>
        </div>

        {/* COLUMNA DERECHA: Formato Visual */}
        <div>
          <SectionTitle>2. Formato del Grid</SectionTitle>

          <FieldRow>
            <div style={{ flex: 1 }}>
              <FieldLabel>Filas</FieldLabel>
              <StyledInput
                type="number"
                value={draftConfig.gridRows || ''}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    gridRows: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Columnas</FieldLabel>
              <StyledInput
                type="number"
                value={draftConfig.gridCols || ''}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    gridCols: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </FieldRow>

          <FieldRow>
            <div style={{ flex: 1 }}>
              <FieldLabel>Tamaño Letra (pt)</FieldLabel>
              <StyledInput
                type="number"
                value={draftConfig.cellFontSize || ''}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    cellFontSize: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Cols. Lista</FieldLabel>
              <StyledInput
                type="number"
                value={draftConfig.wordColumns || ''}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    wordColumns: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </FieldRow>

          <FieldGroup style={{ marginTop: '20px' }}>
            <FieldLabel>Estilos de Borde</FieldLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={draftConfig.showInternalLines}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    showInternalLines: e.target.checked,
                  })
                }
              />
              Mostrar líneas internas
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={draftConfig.showExternalBorder}
                onChange={(e) =>
                  setDraftConfig({
                    ...draftConfig,
                    showExternalBorder: e.target.checked,
                  })
                }
              />
              Mostrar borde externo
            </CheckboxLabel>
          </FieldGroup>

          <FieldGroup
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#fdfdfd',
              borderRadius: '6px',
              border: '1px dashed #ced6e0',
            }}
          >
            <FieldLabel style={{ color: '#e1b12c' }}>
              Herramientas de Autor
            </FieldLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={showPreviewSolutions}
                onChange={(e) => setShowPreviewSolutions(e.target.checked)}
              />
              Ver pista de respuestas
            </CheckboxLabel>
            <FieldLabel style={{ marginTop: '10px' }}>
              Zoom: {Math.round(zoomLevel * 100)}%
            </FieldLabel>
            <StyledInput
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            />
          </FieldGroup>
        </div>
      </PanelGrid>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #f1f2f6',
          margin: '15px 0',
        }}
      />

      {/* SECCIÓN INFERIOR: Fondos y Acciones */}
      <SectionTitle>3. Fondos KDP (Watermarks)</SectionTitle>
      {draftConfig.backgrounds.map((bg, idx) => (
        <div
          key={bg.id}
          style={{
            border: '1px solid #eee',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <strong>Fondo #{idx + 1}</strong>
            <DeleteButton
              onClick={() =>
                setDraftConfig({
                  ...draftConfig,
                  backgrounds: draftConfig.backgrounds.filter(
                    (b) => b.id !== bg.id,
                  ),
                })
              }
            >
              X
            </DeleteButton>
          </div>
          <StyledInput
            type="file"
            accept="image/*"
            onChange={(e) => handleBgImageUpload(bg.id, e)}
            style={{ marginBottom: '8px' }}
          />
          <FieldRow style={{ marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>Desde Pág.</FieldLabel>
              <StyledInput
                type="number"
                value={bg.startPage || ''}
                onChange={(e) =>
                  updateBackground(
                    bg.id,
                    'startPage',
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Hasta Pág.</FieldLabel>
              <StyledInput
                type="number"
                value={bg.endPage || ''}
                onChange={(e) =>
                  updateBackground(
                    bg.id,
                    'endPage',
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
          </FieldRow>
        </div>
      ))}
      <ActionButton
        onClick={addBackgroundRow}
        style={{
          backgroundColor: '#f1f2f6',
          color: '#2f3542',
          border: '1px dashed #ced6e0',
        }}
      >
        + Añadir Capa de Fondo
      </ActionButton>

      <FieldGroup style={{ marginTop: '15px' }}>
        <FieldLabel>Opacidad Global: {draftConfig.bgOpacity}%</FieldLabel>
        <StyledInput
          type="range"
          min="0"
          max="100"
          step="1"
          value={draftConfig.bgOpacity}
          onChange={(e) =>
            setDraftConfig({
              ...draftConfig,
              bgOpacity: parseInt(e.target.value),
            })
          }
        />
      </FieldGroup>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #f1f2f6',
          margin: '20px 0',
        }}
      />

      <ActionButton $primary onClick={onGenerate}>
        Aplicar Configuración y Generar
      </ActionButton>

      <ActionButton
        style={{ backgroundColor: '#2f3542', marginTop: '10px' }}
        onClick={() => window.print()}
      >
        Exportar a PDF (Ctrl + P)
      </ActionButton>
    </ControlPanelContainer>
  );
}
