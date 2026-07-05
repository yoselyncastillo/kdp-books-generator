'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { RawPuzzleData } from '../types';
import { COLORS } from '../styles/colors';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
`;

const EditorContainer = styled.div`
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  background-color: ${COLORS.ui.surface};
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
`;

const EditorHeader = styled.div`
  background-color: #f1f2f6;
  padding: 15px 20px;
  border-bottom: 1px solid ${COLORS.ui.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h3 {
    margin: 0;
    color: ${COLORS.text.main};
    font-size: 1.1rem;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;
`;

const EditorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    border-bottom: 1px solid ${COLORS.ui.border};
    border-right: 1px solid ${COLORS.ui.border};
    text-align: left;
    vertical-align: top;
    font-size: 0.9rem;
  }

  th {
    background-color: #fafafa;
    position: sticky;
    top: 0;
    z-index: 1;
    font-weight: 600;
    color: ${COLORS.text.muted};
  }

  tr:last-child td {
    border-bottom: none;
  }
  
  td:last-child, th:last-child {
    border-right: none;
  }
`;

const EditorInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 8px;
  border: 1px solid ${props => props.$error ? '#ff4d4d' : COLORS.ui.border};
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
  background-color: ${props => props.$error ? '#ffe6e6' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ff4d4d' : COLORS.ui.primary};
  }
`;

const EditorTextarea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid ${props => props.$error ? '#ff4d4d' : COLORS.ui.border};
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
  background-color: ${props => props.$error ? '#ffe6e6' : 'white'};

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ff4d4d' : COLORS.ui.primary};
  }
`;

const ErrorText = styled.div`
  color: #ff4d4d;
  font-size: 0.8rem;
  margin-top: 4px;
  font-weight: 600;
`;

interface CsvEditorProps {
  rawCsvData: RawPuzzleData[];
  onUpdateRow: (index: number, updatedRow: RawPuzzleData) => void;
  onClose: () => void;
}

export default function CsvEditor({ rawCsvData, onUpdateRow, onClose }: CsvEditorProps) {

  // Local state to track edits before blur
  const [localData, setLocalData] = useState<RawPuzzleData[]>([]);

  // Sync local data when rawCsvData changes from parent (e.g. file upload)
  React.useEffect(() => {
    setLocalData(rawCsvData);
  }, [rawCsvData]);

  const getMissingWords = (scripture: string, words: string[]): string[] => {
    const scriptureUpper = scripture.toUpperCase();
    return words.filter(word => {
      const wUpper = word.trim().toUpperCase();
      return wUpper && !scriptureUpper.includes(wUpper);
    });
  };

  const handleInputChange = (index: number, field: keyof RawPuzzleData, value: string) => {
    const newLocal = [...localData];
    if (field === 'words') {
      newLocal[index] = { ...newLocal[index], words: value.split(',').map(w => w.trim()) };
    } else {
      newLocal[index] = { ...newLocal[index], [field]: value };
    }
    setLocalData(newLocal);
  };

  const handleBlur = (index: number) => {
    onUpdateRow(index, localData[index]);
  };

  if (rawCsvData.length === 0) return null;

  return (
    <Overlay className="no-print">
      <EditorContainer>
        <EditorHeader>
          <h3>Tabla Completa del Libro</h3>
          <button 
            onClick={onClose}
            style={{ padding: '6px 12px', background: '#2f3542', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ✕ Cerrar
          </button>
        </EditorHeader>

        <TableWrapper>
          <EditorTable>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th style={{ width: '20%' }}>Título / Cita</th>
                <th style={{ width: '30%' }}>Versículo</th>
                <th style={{ width: '20%' }}>Palabras Clave (Separadas por comas)</th>
                <th style={{ width: '30%' }}>Texto de Reflexión (Solo V4)</th>
              </tr>
            </thead>
            <tbody>
              {localData.map((row, idx) => {
                const missingWords = getMissingWords(row.scripture, row.words);
                const hasError = missingWords.length > 0;

                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <EditorInput
                        value={row.title}
                        onChange={(e) => handleInputChange(idx, 'title', e.target.value)}
                        onBlur={() => handleBlur(idx)}
                      />
                    </td>
                    <td>
                      <EditorTextarea
                        $error={hasError}
                        value={row.scripture}
                        onChange={(e) => handleInputChange(idx, 'scripture', e.target.value)}
                        onBlur={() => handleBlur(idx)}
                      />
                      {hasError && (
                        <ErrorText>
                          {missingWords.length === 1 
                            ? `La palabra "${missingWords[0]}" no se encuentra en el versículo.`
                            : `Las palabras ${missingWords.map(w => `"${w}"`).join(', ')} no se encuentran en el versículo.`}
                        </ErrorText>
                      )}
                    </td>
                    <td>
                      <EditorInput
                        $error={hasError}
                        value={row.words.join(', ')}
                        onChange={(e) => handleInputChange(idx, 'words', e.target.value)}
                        onBlur={() => handleBlur(idx)}
                      />
                    </td>
                    <td>
                      <EditorTextarea
                        value={row.reflectionText || ''}
                        onChange={(e) => handleInputChange(idx, 'reflectionText', e.target.value)}
                        onBlur={() => handleBlur(idx)}
                        placeholder="Opcional. Usado en Layout V4."
                        $error={!row.reflectionText || row.reflectionText.trim() === ''}
                      />
                      {(!row.reflectionText || row.reflectionText.trim() === '') && (
                        <ErrorText style={{ color: '#e1b12c' }}>
                          Vacío (No se mostrará reflexión en V4)
                        </ErrorText>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </EditorTable>
        </TableWrapper>
      </EditorContainer>
    </Overlay>
  );
}
