import { useCallback, useRef, useEffect } from 'react';
import './rangeSlider.css';

interface RangeSliderProps {
    value: [number, number];
    onChange: (next: [number, number]) => void;
    min: number;
    max: number;
    step?: number;
    minDistance?: number;
    label?: string;
    displayFunction?: (n: number) => string | number;
}

function RangeSlider({ value, onChange, min, max, step = 1, minDistance = 1, label, displayFunction }: RangeSliderProps) {
    const [minVal, maxVal] = value;
    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);

    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    useEffect(() => {
        if (maxValRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(+maxValRef.current.value);

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, getPercent]);

    useEffect(() => {
        if (minValRef.current) {
            const minPercent = getPercent(+minValRef.current.value);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(maxVal);

            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, maxVal, getPercent]);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-text-primary">{label}</label>
                <span className="text-sm text-text-secondary">
                    {displayFunction ? displayFunction(minVal) : minVal} - {displayFunction ? displayFunction(maxVal) : maxVal}
                </span>
            </div>

            <div className="range-slider-container">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    step={step}
                    ref={minValRef}
                    onChange={(event) => {
                        const value = Math.min(+event.target.value, maxVal - minDistance);
                        onChange([value, maxVal]);
                    }}
                    className="range-slider range-slider--left"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    step={step}
                    ref={maxValRef}
                    onChange={(event) => {
                        const value = Math.max(+event.target.value, minVal + minDistance);
                        onChange([minVal, value]);
                    }}
                    className="range-slider range-slider--right"
                />

                <div className="range-slider__track" />
                <div ref={range} className="range-slider__range" />
            </div>
        </div>
    );
}

export default RangeSlider;