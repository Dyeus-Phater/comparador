import { useState } from 'react';
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import ComparisonPanel from '@/components/ComparisonPanel';
import FileUploader from '@/components/FileUploader';
import Statistics from '@/components/Statistics';
import ControlPanel from '@/components/ControlPanel';
import VersionHistory from '@/components/VersionHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollText, ChevronDown, ChevronRight, Search, Replace, ChevronLeft, Sun, Moon } from 'lucide-react';
import type { FileVersion, Version } from '@/lib/versionHistory';
import { createNewVersion, undo, redo, getCurrentVersion } from '@/lib/versionHistory';
import { useTheme } from '@/components/theme-provider';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FileData {
  name: string;
  content: string;
}

interface SearchResult {
  fileIndex: number;
  fileName: string;
  lineNumber: number;
  text: string;
  searchType: 'original' | 'translated';
}

export default function Home() {
  const [originalFiles, setOriginalFiles] = useState<FileData[]>([]);
  const [translatedFiles, setTranslatedFiles] = useState<FileData[]>([]);
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [syncScroll, setSyncScroll] = useState(true);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isFileListExpanded, setIsFileListExpanded] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentScrollLine, setCurrentScrollLine] = useState<number | undefined>();
  const [searchAllFiles, setSearchAllFiles] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [searchType, setSearchType] = useState<'original' | 'translated'>('original'); // Added searchType state

  const handleTranslatedChange = (newText: string) => {
    if (currentFileIndex >= 0 && currentFileIndex < translatedFiles.length) {
      const newTranslatedFiles = [...translatedFiles];
      newTranslatedFiles[currentFileIndex] = {
        ...newTranslatedFiles[currentFileIndex],
        content: newText
      };
      setTranslatedFiles(newTranslatedFiles);

      // Update version history
      const newFileVersions = [...fileVersions];
      if (!newFileVersions[currentFileIndex]) {
        newFileVersions[currentFileIndex] = {
          fileName: newTranslatedFiles[currentFileIndex].name,
          versions: [],
          currentIndex: -1
        };
      }

      const currentFileVersion = newFileVersions[currentFileIndex];
      const newVersions = createNewVersion(
        currentFileVersion.versions.slice(0, currentFileVersion.currentIndex + 1),
        newText
      );

      newFileVersions[currentFileIndex] = {
        ...currentFileVersion,
        versions: newVersions,
        currentIndex: newVersions.length - 1
      };

      setFileVersions(newFileVersions);
    }
  };

  const handleFileUpload = ({ type, files }: { type: 'original' | 'translated'; files: FileData[] }) => {
    if (type === 'original') {
      setOriginalFiles(files);
    } else {
      setTranslatedFiles(files);
      setFileVersions(files.map(file => ({
        fileName: file.name,
        versions: [{
          timestamp: Date.now(),
          content: file.content,
          description: "Initial version"
        }],
        currentIndex: 0
      })));
    }
  };

  const handleSearch = () => {
    if (!searchText) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const filesToSearch = searchAllFiles
      ? (searchType === 'original' ? originalFiles : translatedFiles)
      : (searchType === 'original' ? [originalFiles[currentFileIndex]] : [translatedFiles[currentFileIndex]]);

    filesToSearch.forEach((file, fileIndex) => {
      const lines = file.content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchText.toLowerCase())) {
          results.push({
            fileIndex: searchAllFiles ? fileIndex : currentFileIndex,
            fileName: file.name,
            lineNumber: index + 1,
            text: line,
            searchType: searchType
          });
        }
      });
    });

    setSearchResults(results);
  };

  const handleReplace = () => {
    if (!searchText || !replaceText) return;

    const newTranslatedFiles = [...translatedFiles];
    const currentFile = newTranslatedFiles[currentFileIndex];
    if (!currentFile) return;

    currentFile.content = currentFile.content.replaceAll(searchText, replaceText);
    setTranslatedFiles(newTranslatedFiles);
    handleTranslatedChange(currentFile.content);
  };

  const handleUndo = () => {
    const currentFileVersion = fileVersions[currentFileIndex];
    if (!currentFileVersion) return;

    const newFileVersions = [...fileVersions];
    newFileVersions[currentFileIndex] = undo(currentFileVersion);
    setFileVersions(newFileVersions);

    const version = getCurrentVersion(newFileVersions[currentFileIndex]);
    if (version) {
      const newTranslatedFiles = [...translatedFiles];
      newTranslatedFiles[currentFileIndex] = {
        ...newTranslatedFiles[currentFileIndex],
        content: version.content
      };
      setTranslatedFiles(newTranslatedFiles);
    }
  };

  const handleRedo = () => {
    const currentFileVersion = fileVersions[currentFileIndex];
    if (!currentFileVersion) return;

    const newFileVersions = [...fileVersions];
    newFileVersions[currentFileIndex] = redo(currentFileVersion);
    setFileVersions(newFileVersions);

    const version = getCurrentVersion(newFileVersions[currentFileIndex]);
    if (version) {
      const newTranslatedFiles = [...translatedFiles];
      newTranslatedFiles[currentFileIndex] = {
        ...newTranslatedFiles[currentFileIndex],
        content: version.content
      };
      setTranslatedFiles(newTranslatedFiles);
    }
  };

  const handleVersionSelect = (version: Version) => {
    const newTranslatedFiles = [...translatedFiles];
    newTranslatedFiles[currentFileIndex] = {
      ...newTranslatedFiles[currentFileIndex],
      content: version.content
    };
    setTranslatedFiles(newTranslatedFiles);

    const newFileVersions = [...fileVersions];
    newFileVersions[currentFileIndex] = {
      ...newFileVersions[currentFileIndex],
      currentIndex: newFileVersions[currentFileIndex].versions.findIndex(
        v => v.timestamp === version.timestamp
      )
    };
    setFileVersions(newFileVersions);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    if (currentFileIndex !== result.fileIndex) {
      setCurrentFileIndex(result.fileIndex);
    }
    setCurrentScrollLine(result.lineNumber);
    setSearchType(result.searchType);
  };

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-gray-800 text-foreground dark:text-gray-200">
      <header className="border-b p-4 flex justify-between items-center dark:border-gray-600">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent">
          ROM Translation Tool
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}>
          <ResizablePanel defaultSize={20} className="relative dark:bg-gray-700" style={{ minWidth: isMenuCollapsed ? '48px' : '240px' }}>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute ${isMenuCollapsed ? 'left-2' : 'right-2'} top-2 z-10 bg-background shadow-sm hover:bg-muted dark:bg-gray-700 dark:hover:bg-gray-600`}
              onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            >
              {isMenuCollapsed ? (
                <ChevronRight className="h-4 w-4 dark:text-gray-200" />
              ) : (
                <ChevronLeft className="h-4 w-4 dark:text-gray-200" />
              )}
            </Button>
            <ScrollArea className={`h-full transition-all duration-200 ${isMenuCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="p-4">
                <FileUploader 
                  onFilesUploaded={handleFileUpload}
                  currentFile={translatedFiles[currentFileIndex]}
                  translatedFiles={translatedFiles}
                />

                <div className="mt-4 space-y-2">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search in current file..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        onFocus={() => setSearchResults([])}
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                      />
                      <Button variant="outline" onClick={handleSearch} className="dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Replace with..."
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                      />
                      <Button variant="outline" onClick={handleReplace} className="dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600">
                        <Replace className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => setSearchAllFiles(!searchAllFiles)}
                      >
                        {searchAllFiles ? "Search in Current File" : "Search in All Files"}
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label htmlFor="search-type" className="text-sm">Search In:</Label>
                      <RadioGroup defaultValue="original" value={searchType} onValueChange={setSearchType} className="flex space-x-2">
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="original" id="original" />
                          <Label htmlFor="original">Original</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="translated" id="translated" />
                          <Label htmlFor="translated">Translated</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <h4 className="font-medium dark:text-gray-200">Search Results:</h4>
                      <div className="space-y-1">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-2 text-sm hover:bg-muted/50 rounded dark:text-gray-200 dark:hover:bg-gray-600"
                            onClick={() => handleSearchResultClick(result)}
                          >
                            {searchAllFiles && (
                              <div className="text-xs text-muted-foreground mb-1 dark:text-gray-300">
                                {result.fileName} ({result.searchType})
                              </div>
                            )}
                            <span className="font-mono text-muted-foreground dark:text-gray-300">
                              Line {result.lineNumber}:
                            </span>{' '}
                            {result.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between px-2 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={() => setIsFileListExpanded(!isFileListExpanded)}
                  >
                    <span className="font-medium">Original Files</span>
                    {isFileListExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {isFileListExpanded && (
                    <div className="space-y-1">
                      {originalFiles.map((file, index) => (
                        <Button
                          key={file.name}
                          variant={index === currentFileIndex ? "default" : "outline"}
                          className="w-full justify-start dark:text-gray-200 dark:hover:bg-gray-600"
                          onClick={() => {
                            setCurrentFileIndex(index);
                            setSearchType('original');
                          }}
                        >
                          <ScrollText className="h-4 w-4 mr-2" />
                          {file.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {fileVersions[currentFileIndex] && (
                  <VersionHistory
                    fileVersion={fileVersions[currentFileIndex]}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onVersionSelect={handleVersionSelect}
                  />
                )}

                <ControlPanel
                  layout={layout}
                  setLayout={setLayout}
                  syncScroll={syncScroll}
                  setSyncScroll={setSyncScroll}
                />

                {originalFiles[currentFileIndex] && translatedFiles[currentFileIndex] && (
                  <Statistics 
                    original={originalFiles[currentFileIndex].content}
                    translated={translatedFiles[currentFileIndex].content}
                  />
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizablePanel defaultSize={80}>
            <ComparisonPanel
              originalText={originalFiles[currentFileIndex]?.content || ''}
              translatedText={translatedFiles[currentFileIndex]?.content || ''}
              syncScroll={syncScroll}
              layout={layout}
              onTranslatedChange={handleTranslatedChange}
              scrollToLine={currentScrollLine}
              searchHighlight={searchText}
              searchType={searchType} // Pass searchType to ComparisonPanel
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
