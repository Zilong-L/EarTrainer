import React from "react";

const ThresholdSlider = ({ threshold, setThreshold, currentRMS }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* 显示当前阈值 */}
      <label className="text-sm text-text-secondary">
        阈值: {threshold.toFixed(3)} (当前响度: {currentRMS.toFixed(3)})
      </label>

      {/* 滑动条 */}
      <input
        type="range"
        min="0"
        max="0.1"
        step="0.001"
        value={threshold}
        onChange={(e) => setThreshold(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
};

export default ThresholdSlider;
