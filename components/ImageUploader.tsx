import React, { useState, useCallback, useRef } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, TrashIcon } from './Icons';

interface ImageUploaderProps {
  onImagesSelected: (images: ImageFile[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the "data:mime/type;base64," part
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected }) => {
  const [previews, setPreviews] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Abstract file processing to a separate function to handle both change and drop events.
  // This ensures consistent and type-safe handling of FileList objects, fixing errors where
  // `file` was being inferred as `unknown`.
  const processFiles = useCallback(async (files: FileList) => {
    const newImageFiles: ImageFile[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        newImageFiles.push({
          file,
          preview: URL.createObjectURL(file),
          base64,
        });
      }
    }
    
    if (newImageFiles.length > 0) {
      const allFiles = [...previews, ...newImageFiles];
      setPreviews(allFiles);
      onImagesSelected(allFiles);
    }
  }, [onImagesSelected, previews]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await processFiles(event.target.files);
    }
  }, [processFiles]);

  const removeImage = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onImagesSelected(updatedPreviews);
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(previews[index].preview);
  };

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      await processFiles(event.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div>
      <label
        htmlFor="image-upload"
        className="block text-sm font-semibold mb-2 text-gray-300"
      >
        Upload Images
      </label>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex justify-center w-full h-32 px-4 transition bg-gray-900 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
      >
        <span className="flex items-center space-x-2">
          <UploadIcon />
          <span className="font-medium text-gray-400">
            Drop files to attach, or{' '}
            <span className="text-cyan-400 underline">browse</span>
          </span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previews.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`preview ${index}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;