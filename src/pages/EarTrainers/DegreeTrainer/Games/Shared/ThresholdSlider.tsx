interface ThresholdSliderProps {
  threshold: number;
  setThreshold: (v: number) => void;
  currentRMS: number;
}

const ThresholdSlider = ({
  threshold,
  setThreshold,
  currentRMS,
}: ThresholdSliderProps) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <label className="text-sm text-text-secondary">
        阈值: {threshold.toFixed(3)} (当前响度: {currentRMS.toFixed(3)})
      </label>
      <input
        type="range"
        min={0}
        max={0.1}
        step={0.001}
        value={threshold}
        onChange={e => setThreshold(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
};

export default ThresholdSlider;
