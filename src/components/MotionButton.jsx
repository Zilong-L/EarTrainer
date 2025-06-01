import React from 'react';
import { motion } from 'motion/react';

const MotionButton = ({
  onClick,
  children,
  className = '',
  isDisabled = false,
  initial = { scale: 0 },
  animate = { x: 0, scale: 1, transition: { duration: 0.5, bounce: 0.3, type: 'spring' } },
  exit = { scale: 0 },
  whileHover = { scale: 1.05, duration: 0.5 },
  whileTap = { scale: 0.95 },
  drag = false,
  dragConstraints = { left: 0, right: 0, top: 0, bottom: 0 },
  title = ''
}) => {
  return (
    <motion.button
      initial={initial}
      animate={animate}
      exit={exit}
      whileHover={isDisabled ? { scale: 1 } : whileHover}
      whileTap={isDisabled ? { scale: 1 } : whileTap}
      drag={drag}
      dragConstraints={dragConstraints}
      onClick={isDisabled ? undefined : onClick}
      className={`rounded-full shadow-md flex items-center justify-center transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={title}
    >
      {children}
    </motion.button>
  );
};

export default MotionButton;
