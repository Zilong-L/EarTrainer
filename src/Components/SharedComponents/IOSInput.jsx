import { motion } from 'framer-motion'
import { useState } from 'react'

function IOSInput({ value, setValue, min, max, width = 100, height = 200 }) {
  const boxHeight = height
  const [startValue, setStartValue] = useState(value)
  const [startY, setStartY] = useState(0)
  const [dragTransform, setDragTransform] = useState({ scaleX: 1, scaleY: 1 })
  const [dragOrigin, setDragOrigin] = useState('50% 50%')

  // 根据拖动距离更新 value（拖动向下 deltaY 正，则减少 value）
  // 先计算 rawValue（未 clamp）用于判断是否超出范围
  const updateValueFromDrag = (deltaY) => {
    const rawValue = startValue - (deltaY / boxHeight) * (max - min)
    let newValue = rawValue
    if (rawValue > max) newValue = max
    if (rawValue < min) newValue = min
    setValue(newValue)

    // 根据 overshoot 设置形变和 transformOrigin
    if (rawValue > max) {
      const overshoot = rawValue - max
      const factor = Math.min(overshoot / ((max - min) * 0.3), 1)
      setDragTransform({ scaleX: 1 - 0.02 * factor, scaleY: 1 +0.05 * factor })
      // 拖动向上时，底部固定
      setDragOrigin('50% 100%')
    } else if (rawValue < min) {
      const overshoot = min - rawValue
      const factor = Math.min(overshoot / ((max - min) * 0.3), 1)
      setDragTransform({ scaleX: 1 - 0.02 * factor, scaleY: 1 +0.05 * factor })
      // 拖动向下时，顶部固定
      setDragOrigin('50% 0%')
    } else {
      setDragTransform({ scaleX: 1, scaleY: 1 })
      setDragOrigin('50% 50%')
    }
  }

  return (
    <div className={`h-[${height}px] w-[${width}px] block`}>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        // 拖动过程中使用 dragTransform 和 dragOrigin，松开后恢复默认状态
        animate={{ y: 0, scaleX: dragTransform.scaleX, scaleY: dragTransform.scaleY, transformOrigin: dragOrigin }}
        transition={{ type: 'tween', duration: 0.2 }}
        style={{
          userSelect: 'none',
          width: `${width}px`,
          height: `${height}px`
        }}
        className="absolute block z-[1000] bg-gray-200 flex overflow-hidden rounded-[40px]"
        onDragStart={(e, info) => {
          setStartY(info.point.y)
          setStartValue(value)
        }}
        onDrag={(e, info) => {
          const deltaY = info.point.y - startY
          updateValueFromDrag(deltaY)
        }}
        onDragEnd={() => {
          // 拖动结束后恢复默认形变和 transformOrigin
          setDragTransform({ scaleX: 1, scaleY: 1 })
          setDragOrigin('50% 50%')
        }}
      >
        {/* 底层背景 */}
        <motion.div
          style={{ width: `${width}px`, height: `${height}px` }}
          className="absolute block z-[51] bg-white overflow-hidden rounded-[40px]"
        />
        {/* 填充区域：value 为 max 时高度为 0；value 为 min 时高度为 boxHeight */}
        <motion.div
          style={{
            width: `${width}px`,
            height: `${(1 - (value - min) / (max - min)) * boxHeight}px`
          }}
          className="absolute block z-[52] bg-gray-200 rounded-t-[40px]"
        />
      </motion.div>
    </div>
  )
}

export default IOSInput
