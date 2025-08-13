import React from 'react';
import './rangeSlider.css';

interface RangeSliderProps {
    value: [number, number];
    onChange: (next: [number, number]) => void;
    min: number;
    max: number;
    step?: number;
    label?: string;
    displayFunction?: (n: number) => string | number;
}

function RangeSlider({ value, onChange, min, max, step = 1, label, displayFunction }: RangeSliderProps) {
    const [start, end] = value;

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = parseInt(e.target.value, 10);
        if (Math.abs(newStart - end) >= step && newStart < end) {
            onChange([newStart, end]);
        }
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = parseInt(e.target.value, 10);
        if (Math.abs(newEnd - start) >= step && newEnd > start) {
            onChange([start, newEnd]);
        }
    };

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-text-primary">{label}</label>
                <span className="text-sm text-text-secondary">
                    {displayFunction ? displayFunction(start) : start} - {displayFunction ? displayFunction(end) : end}
                </span>
            </div>

            <div className="range-container">
                <div className="slider" style={{ position: 'relative', height: '4px', width: '100%' }}>
                    <div className="slider__track bg-bg-accent" style={{ position: 'absolute', width: '100%', height: '100%' }} />
                    <div
                        className="slider__range bg-notification-bg"
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: `${getPercentage(end) - getPercentage(start)}%`,
                            left: `${getPercentage(start)}%`,
                        }}
                    />
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={start}
                        onChange={handleStartChange}
                        className="thumb thumb--left"
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: getPercentage(start) > 75 ? 5 : 3 }}
                    />
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={end}
                        onChange={handleEndChange}
                        className="thumb thumb--right"
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default RangeSlider;
