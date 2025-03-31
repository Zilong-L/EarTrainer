import { motion, useMotionValue, useTransform } from 'motion/react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash-es'
function HorizontalSlider({
  height = 10,
  min = 0,
  max = 1000,
  step = 100,
  value = 0,
  mapFunction = (value) => (value * 100).toFixed(0),
  setState = () => { console.log() },
}) {
  // Calculate initial percentage
  const initialPercentage = ((value - min) / (max - min)) * 100
  const containerRef = useRef(null)
  // Create motion value for tracking position in percentage (0 to 100)
  const x = useMotionValue(initialPercentage)
  const debouncedSetState = useCallback(debounce(setState, 100), [setState])
  const [displayValue, setDisplayValue] = useState(value)

  // Flag to track panning
  const [isPanning, setIsPanning] = useState(false)

  // Convert percentage (0-100) to actual value (min-max)
  const sliderValue = useTransform(x, [0, 100], [min, max])

  // Store the last value for step-based emitting
  const lastEmittedValueRef = useRef(value)

  // Update x when value changes
  useEffect(() => {
    const percentage = ((value - min) / (max - min)) * 100
    x.set(percentage)
    setDisplayValue(value)
  }, [value, min, max])

  // Subscribe to sliderValue changes and emit onChange if difference >= step
  useEffect(() => {
    const unsubscribe = sliderValue.on("change", (newVal) => {
      if (Math.abs(newVal - lastEmittedValueRef.current) >= step) {
        debouncedSetState(newVal)
        setDisplayValue(newVal)
        lastEmittedValueRef.current = newVal
      }
    })
    return () => unsubscribe()
  }, [sliderValue, step, debouncedSetState])

  // Handle pan gesture to update x
  const handlePan = (_, info) => {
    const currentX = x.get()
    const containerWidth = containerRef.current?.offsetWidth || 1
    const deltaPercentage = (info.delta.x / containerWidth) * 100
    const newX = currentX + deltaPercentage
    // Clamp position in [0, 100]
    x.set(Math.max(Math.min(newX, 100), 0))
  }

  const handleMouseDown = (e) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = (clickX / rect.width) * 100
    x.set(percentage)
  }

  return (
    <div
      ref={containerRef}
      className="relative my-8 flex w-full"
      style={{ height }}
    >
      {/* Base bar */}
      <motion.div
        className={`absolute overflow-hidden rounded-full bg-gray-600 cursor-pointer ${isPanning ? "shadow-md" : ""
          }`}
        style={{
          width: "100%",
          height: "100%",
        }}
        onPanStart={() => {
          setIsPanning(true)
        }}
        whileHover={{ scaleY: 1.5, scaleX: 1.0 }}
        transition={{ duration: 0.3, type: "spring" }}
        onPan={handlePan}
        onMouseDown={handleMouseDown}
        onPanEnd={() => {
          setIsPanning(false)
        }}
      >
        {/* Fill bar */}
        <motion.div
          className="absolute bg-white pointer-events-none"
          style={{
            height: "100%",
            width: `${x.get()}%`,
            left: 0,
            borderRadius: "9999px 0 0 9999px",
          }}
        />
      </motion.div>
      <div className="absolute right-0 top-[-3rem] text-text-primary text-3xl">
        {mapFunction(displayValue)}
      </div>
    </div>
  )
}

export default HorizontalSlider