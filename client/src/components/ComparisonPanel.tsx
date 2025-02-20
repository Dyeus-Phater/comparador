import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import { useTheme } from "./theme-provider"; // Importação corrigida

interface ComparisonPanelProps {
  originalText: string;
  translatedText: string;
  syncScroll: boolean;
  layout: 'horizontal' | 'vertical';
  onTranslatedChange?: (text: string) => void;
  scrollToLine?: number;
  searchHighlight?: string;
  searchType: 'original' | 'translated';
}

const ComparisonPanel = React.forwardRef<HTMLDivElement, ComparisonPanelProps>(({
  originalText,
  translatedText,
  syncScroll,
  layout,
  onTranslatedChange,
  scrollToLine,
  searchHighlight,
  searchType,
}, ref) => {
  const [translatedEditorValue, setTranslatedEditorValue] = useState(translatedText);
  const diffEditorRef = useRef<any>(null);

  // Obtém o tema atual do ThemeProvider
  const { theme } = useTheme();

  useEffect(() => {
    setTranslatedEditorValue(translatedText);
  }, [translatedText]);

  const handleEditorMount = (editor: any, monaco: any) => {
    diffEditorRef.current = editor;
  };

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

  const handleTranslatedEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setTranslatedEditorValue(value);
      onTranslatedChange?.(value);
    }
  };

  useEffect(() => {
    if (scrollToLine && diffEditorRef.current) {
      const diffEditor = diffEditorRef.current;
      const editor = searchType === 'original' ? diffEditor.getOriginalEditor() : diffEditor.getModifiedEditor();
      if (editor) {
        editor.revealLine(scrollToLine);
        editor.focus();
      }
    }
  }, [scrollToLine, searchType]);

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  return (
    <div ref={ref} className={`h-full flex gap-4 p-4 ${layout === 'vertical' ? 'flex-col' : 'flex-row'}`}>
      <Card className="flex-1 relative rounded-lg overflow-hidden">
        <MonacoDiffEditor
          height="100%"
          language="plaintext"
          original={originalText}
          modified={translatedEditorValue}
          onChange={handleTranslatedEditorChange}
          onMount={handleEditorMount}
          options={{
            readOnly: false,
            renderSideBySide: layout === 'horizontal',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            minimap: { enabled: false },
            theme: monacoTheme,
          }}
        />
      </Card>
    </div>
  );
});

export default ComparisonPanel;
