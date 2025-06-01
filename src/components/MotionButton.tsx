import React from 'react';
import { motion } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';

import type { VariantLabels, AnimationControls } from 'framer-motion';

interface MotionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  initial?: TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels | AnimationControls;
  exit?: TargetAndTransition | VariantLabels;
  whileHover?: TargetAndTransition | VariantLabels;
  whileTap?: TargetAndTransition | VariantLabels;
  drag?: boolean;
  dragConstraints?: { left?: number; right?: number; top?: number; bottom?: number };
  title?: string;
}

const MotionButton: React.FC<MotionButtonProps> = ({
  onClick,
  children,
  className = '',
  isDisabled = false,
  initial = { scale: 0 } as TargetAndTransition,
  animate = { x: 0, scale: 1, transition: { duration: 0.5, bounce: 0.3, type: 'spring' } } as TargetAndTransition,
  exit = { scale: 0 } as TargetAndTransition,
  whileHover = { scale: 1.05 } as TargetAndTransition,
  whileTap = { scale: 0.95 } as TargetAndTransition,
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
