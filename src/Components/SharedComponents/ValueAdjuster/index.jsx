import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';

function ValueAdjuster({
  title,
  value,
  setValue,
  min,
  max,
  step = 1,
  displayFunction = (value) => value.toString(),
}) {
  const handleIncrement = () => {
    if (value + step <= max) {
      setValue(value + step);
    }
  };

  const handleDecrement = () => {
    if (value - step >= min) {
      setValue(value - step);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {title && (
        <label className="block text-sm font-medium text-text-primary">
          {title}
        </label>
      )}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
            ${value <= min 
              ? 'bg-bg-accent text-text-secondary cursor-not-allowed' 
              : 'bg-bg-main text-text-primary hover:bg-bg-hover'
            }`}
        >
          <MinusIcon className="w-5 h-5" />
        </button>
        
        <div className="min-w-[60px] text-center text-text-primary font-medium">
          {displayFunction(value)}
        </div>
        
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
            ${value >= max 
              ? 'bg-bg-accent text-text-secondary cursor-not-allowed' 
              : 'bg-bg-main text-text-primary hover:bg-bg-hover'
            }`}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ValueAdjuster; 