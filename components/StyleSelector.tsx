
import React from 'react';
import { StyleOption } from '../types';

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyles: string[];
  onStyleChange: (styleId: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyles, onStyleChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {styles.map((style) => (
        <div
          key={style.id}
          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedStyles.includes(style.id)
              ? 'bg-cyan-800/50 ring-2 ring-cyan-500'
              : 'bg-gray-700/50 hover:bg-gray-700'
          }`}
          onClick={() => onStyleChange(style.id)}
        >
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedStyles.includes(style.id)}
              onChange={() => onStyleChange(style.id)}
              className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 bg-gray-900"
            />
            <span className="ml-3 text-white font-semibold">{style.name}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default StyleSelector;
