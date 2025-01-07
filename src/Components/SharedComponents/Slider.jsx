import React from 'react';

const Slider = ({ 
  value, 
  onChange, 
  min, 
  max, 
  label, 
  displayValue,
  className = '',
  thumbClassName = '',
  disabled = false,
  step = 1
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
          {displayValue && (
            <span className="text-sm text-text-primary">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="slider">
        <div className="slider__track bg-bg-secondary" />
        <div 
          className="slider__range bg-bg-accent" 
          style={{ width: `${percentage}%` }} 
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`thumb ${thumbClassName} bg-text-primary`}
        />
      </div>
    </div>
  );
};

export default Slider;
