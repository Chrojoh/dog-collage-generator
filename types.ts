
export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
}

export interface SizeOption {
  id: string;
  name: string;
  promptText: string;
}
