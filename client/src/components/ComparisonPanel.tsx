import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "./theme-provider"; // Importação corrigida

interface ComparisonPanelProps {
  originalText: string;
  translatedText: string;
  syncScroll: boolean;
  layout: 'horizontal' | 'vertical';
  onTranslatedChange?: (text: string) => void;
  scrollToLine?: number;
  searchHighlight?: string;
  searchType: 'original' | 'translated'; // Added searchType prop
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  originalText,
  translatedText,
  syncScroll,
  layout,
  onTranslatedChange,
  scrollToLine,
  searchHighlight,
  searchType, // Destructure searchType
}) => {
  const [translatedEditorValue, setTranslatedEditorValue] = useState(translatedText);
  const diffEditorRef = useRef<any>(null);

  // Obtém o tema atual do ThemeProvider
  const { theme } = useTheme();

  // Atualiza o texto traduzido quando a prop `translatedText` muda
  useEffect(() => {
    setTranslatedEditorValue(translatedText);
  }, [translatedText]);

  // Sincronização de scroll
  useEffect(() => {
    if (syncScroll && diffEditorRef.current) {
      const diffEditor = diffEditorRef.current;
      const originalEditor = diffEditor.getOriginalEditor();
      const modifiedEditor = diffEditor.getModifiedEditor();

      const updateScroll = () => {
        if (originalEditor && modifiedEditor) {
          const originalScrollTop = originalEditor.getScrollTop();
          const modifiedScrollTop = modifiedEditor.getScrollTop();

          if (Math.abs(originalScrollTop - modifiedScrollTop) > 1) {
            modifiedEditor.setScrollTop(originalScrollTop);
          }
        }
      };

      originalEditor.onDidScrollChange(updateScroll);
      modifiedEditor.onDidScrollChange(updateScroll);

      return () => {
        originalEditor.onDidScrollChange(() => {});
        modifiedEditor.onDidScrollChange(() => {});
      };
    }
  }, [syncScroll]);

  // Atualiza o texto traduzido e notifica o componente pai
  const handleTranslatedEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setTranslatedEditorValue(value);
      onTranslatedChange?.(value);
    }
  };

  // Scroll to line effect
  useEffect(() => {
    if (scrollToLine && diffEditorRef.current) {
      const diffEditor = diffEditorRef.current;
      const editor = searchType === 'original' ? diffEditor.getOriginalEditor() : diffEditor.getModifiedEditor();
      if (editor) {
        editor.revealLine(scrollToLine);
        editor.focus(); // Add focus to the editor
      }
    }
  }, [scrollToLine, searchType]);

  // Determina o tema do Monaco Editor com base no tema do site
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  return (
    <div className={`h-full flex gap-4 p-4 ${layout === 'vertical' ? 'flex-col' : 'flex-row'}`}>
      <Card className="flex-1 relative rounded-lg overflow-hidden"> {/* Adicionado rounded-lg e overflow-hidden */}
        <DiffEditor
          ref={diffEditorRef}
          height="100%"
          language="plaintext"
          original={originalText} // Texto original
          modified={translatedEditorValue} // Texto traduzido
          onChange={handleTranslatedEditorChange} // Atualiza o texto traduzido
          options={{
            readOnly: false, // Permite edição no texto traduzido
            renderSideBySide: layout === 'horizontal', // Define o layout (horizontal ou vertical)
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            minimap: { enabled: false },
            theme: monacoTheme, // Aplica o tema do Monaco Editor
          }}
        />
      </Card>
    </div>
  );
};

export default ComparisonPanel;
