import React from 'react';
import { motion } from 'motion/react';

/** A thin strip on the left edge: swipe right to go back, like UINavigationController. */
export function SwipeBack({ onBack }) {
  return (
    <motion.div
      className="swipe-edge"
      aria-hidden="true"
      onPanEnd={(_, info) => {
        if (info.offset.x > 64 && Math.abs(info.offset.y) < 90) onBack();
      }}
    />
  );
}
