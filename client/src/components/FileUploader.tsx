import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateZip, downloadText } from '@/lib/fileUtils';

interface FileData {
  name: string;
  content: string;
}

interface FileUploaderProps {
  onFilesUploaded: (files: { type: 'original' | 'translated'; files: FileData[] }) => void;
  currentFile?: FileData | null;
  translatedFiles: FileData[];
}

export default function FileUploader({
  onFilesUploaded,
  currentFile,
  translatedFiles,
}: FileUploaderProps) {
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'translated') => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (!uploadedFiles.length) return;

    const fileData = await Promise.all(
      uploadedFiles.map(async (file) => ({
        name: file.name,
        content: await file.text(),
      }))
    );

    onFilesUploaded({ type, files: fileData });

    toast({
      title: "Files uploaded successfully",
      description: `${uploadedFiles.length} ${type} files loaded`,
    });
  };

  const handleSaveAll = async () => {
    if (!translatedFiles.length) return;

    try {
      const zip = await generateZip(translatedFiles);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translated_scripts.zip';
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Files saved successfully",
        description: "All translated files have been downloaded as ZIP"
      });
    } catch (error) {
      toast({
        title: "Error saving files",
        description: "Failed to generate ZIP file",
        variant: "destructive"
      });
    }
  };

  const handleSaveCurrent = () => {
    if (!currentFile) return;
    downloadText(currentFile.content, currentFile.name);
    toast({
      title: "File saved successfully",
      description: `${currentFile.name} has been downloaded`
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Original Scripts</label>
        <div className="flex gap-2">
          <Input
            type="file"
            multiple
            accept=".txt"
            onChange={(e) => handleFileUpload(e, 'original')}
          />
          <Button variant="outline" size="icon">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Translated Scripts</label>
        <div className="flex gap-2">
          <Input
            type="file"
            multiple
            accept=".txt"
            onChange={(e) => handleFileUpload(e, 'translated')}
          />
          <Button variant="outline" size="icon">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleSaveAll}
          disabled={!translatedFiles.length}
        >
          <Save className="h-4 w-4 mr-2" />
          Save All
        </Button>

        <Button
          variant="outline"
          onClick={handleSaveCurrent}
          disabled={!currentFile}
        >
          <Download className="h-4 w-4 mr-2" />
          Save Current
        </Button>
      </div>
    </div>
  );
}
