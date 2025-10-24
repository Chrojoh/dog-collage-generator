
import React from 'react';
import { SizeOption } from '../types';

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string;
  onSizeChange: (sizeId: string) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ sizes, selectedSize, onSizeChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {sizes.map((size) => (
        <div key={size.id}>
          <input
            type="radio"
            id={size.id}
            name="size-option"
            value={size.id}
            checked={selectedSize === size.id}
            onChange={() => onSizeChange(size.id)}
            className="hidden peer"
          />
          <label
            htmlFor={size.id}
            className="inline-flex items-center justify-center w-full p-4 text-gray-300 bg-gray-700/50 rounded-lg cursor-pointer peer-checked:ring-2 peer-checked:ring-cyan-500 peer-checked:bg-cyan-800/50 hover:text-gray-200 hover:bg-gray-700 transition-all"
          >
            <div className="block text-center">
              <div className="w-full text-md font-semibold">{size.name}</div>
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

export default SizeSelector;
