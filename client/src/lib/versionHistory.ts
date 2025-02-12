import { produce } from "immer";

export interface Version {
  timestamp: number;
  content: string;
  description: string;
}

export interface FileVersion {
  fileName: string;
  versions: Version[];
  currentIndex: number;
}

export function createNewVersion(
  versions: Version[], 
  content: string, 
  description: string = "Update translation"
): Version[] {
  return [...versions, {
    timestamp: Date.now(),
    content,
    description
  }];
}

export function canUndo(fileVersion: FileVersion): boolean {
  return fileVersion.currentIndex > 0;
}

export function canRedo(fileVersion: FileVersion): boolean {
  return fileVersion.currentIndex < fileVersion.versions.length - 1;
}

export function undo(fileVersion: FileVersion): FileVersion {
  if (!canUndo(fileVersion)) return fileVersion;
  
  return produce(fileVersion, draft => {
    draft.currentIndex--;
  });
}

export function redo(fileVersion: FileVersion): FileVersion {
  if (!canRedo(fileVersion)) return fileVersion;
  
  return produce(fileVersion, draft => {
    draft.currentIndex++;
  });
}

export function getCurrentVersion(fileVersion: FileVersion): Version | null {
  return fileVersion.versions[fileVersion.currentIndex] || null;
}
