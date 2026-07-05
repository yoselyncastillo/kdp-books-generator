import React, { useState } from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles/colors';

const AccordionContainer = styled.div`
  border: 1px solid ${COLORS.ui.border};
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  background-color: #ffffff;
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text.main};
  text-align: left;
  background-color: #f8f9fa;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${(props) => (props.$isOpen ? '2000px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
`;

const ContentInner = styled.div`
  padding: 16px;
  border-top: 1px solid ${COLORS.ui.border};
`;

const Chevron = styled.span<{ $isOpen: boolean }>`
  transform: ${(props) => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
  font-size: 1.2rem;
  color: ${COLORS.text.muted};
`;

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <AccordionContainer>
      <AccordionHeader onClick={() => setIsOpen(!isOpen)}>
        {title}
        <Chevron $isOpen={isOpen}>▼</Chevron>
      </AccordionHeader>
      <AccordionContent $isOpen={isOpen}>
        <ContentInner>{children}</ContentInner>
      </AccordionContent>
    </AccordionContainer>
  );
};
