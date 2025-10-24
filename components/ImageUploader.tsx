import React, { useState, useCallback, useRef } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, TrashIcon } from './Icons';

interface ImageUploaderProps {
  onImagesSelected: (images: ImageFile[]) => void;
}

// Compress image before converting to base64
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        // Remove the "data:image/jpeg;base64," prefix
        resolve(base64.split(',')[1]);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected }) => {
  const [previews, setPreviews] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList) => {
    const newImageFiles: ImageFile[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const base64 = await compressImage(file);
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