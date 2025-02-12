import JSZip from 'jszip';

export async function generateZip(files: { name: string; content: string }[]): Promise<JSZip> {
  const zip = new JSZip();

  files.forEach(({ name, content }) => {
    zip.file(name, content);
  });

  return zip;
}

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
