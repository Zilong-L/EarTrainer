import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

function HorizontalSlider({
  width = 600,
  height = 10,
  min = 0,
  max = 1000,
  step = 100,
  value,
  initialValue = 0,
  mapFunction = (value) => (value*100).toFixed(0),
  setState=()=>{console.log()},
}) {
  // Create motion value for tracking position in pixels (0 to width)
  const x = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState(value ?? initialValue)

  // Flag to track panning
  const [isPanning, setIsPanning] = useState(false)

  // Convert x (in [0, width]) to a real value (in [min, max])
  const sliderValue = useTransform(x, [0, width], [min, max])

  // Fill width transform (for the visual fill bar)
  const fillWidth = useTransform(x, [0, width], ["0%", "100%"])

  // Store the last value for step-based emitting
  const lastEmittedValueRef = useRef(min)

  // Update x when value changes
  useEffect(() => {
    if (value !== undefined) {
      const newX = ((value - min) / (max - min)) * width
      x.set(newX)
      setDisplayValue(value)
    } else if (initialValue !== undefined) {
      const newX = ((initialValue - min) / (max - min)) * width
      x.set(newX)
      setDisplayValue(initialValue)
    }
  }, [value, initialValue, min, max, width])
  
  // Subscribe to sliderValue changes and emit onChange if difference >= step
  useEffect(() => {
    const unsubscribe = sliderValue.on("change", (newVal) => {
      if (Math.abs(newVal - lastEmittedValueRef.current) >= step) {
        setState(newVal)
        setDisplayValue(newVal)
        lastEmittedValueRef.current = newVal
      }
    })
    return () => unsubscribe()
  }, [sliderValue, step, setState])

  // Handle pan gesture to update x
  const handlePan = (_, info) => {
    const newX = x.get() + info.delta.x
    // Clamp position in [0, width]
    x.set(Math.max(Math.min(newX, width), 0))
  }

  const handleMouseDown = (e) => {
    // calculate the click position
    const clickPosition = e.clientX
    // get target element
    const target = e.target
    const left = target.getBoundingClientRect().left
    const value = clickPosition - left
    x.set(value)
  }

  return (
    <div
      className="relative my-8 flex"
      style={{ width, height }}
    >
      {/* Base bar */}
      <motion.div
        className={`absolute overflow-hidden rounded-full bg-gray-600 cursor-pointer ${
          isPanning ? "shadow-md" : ""
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
            width: fillWidth,
            left: 0,
            borderRadius: "9999px 0 0 9999px",
          }}
        />
      </motion.div>
      <div className="absolute right-0 -top-10">
        {mapFunction(displayValue)}
      </div>
    </div>
  )
}

export default HorizontalSlider