import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SPRING } from './springs.js';

const THUMB = 28;
/**
 * Stop slider. A real range input sits on top (keyboard, VoiceOver, native dragging and step
 * snapping); the visible track, thumb and floating label spring toward the current stop.
 */
export function StopSlider({ id, stops, index, onIndex, valueText, label }) {
  const track = useRef(null),
    pill = useRef(null);
  const [width, setWidth] = useState(0),
    [pillWidth, setPillWidth] = useState(0);
  useLayoutEffect(() => {
    const element = track.current;
    const measure = () => setWidth(element.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    setPillWidth(pill.current.getBoundingClientRect().width);
  }, [valueText]);
  const progress = stops > 1 ? index / (stops - 1) : 0;
  const thumbX = progress * Math.max(width - THUMB, 0);
  const center = thumbX + THUMB / 2;
  const pillX = Math.min(Math.max(center - pillWidth / 2, 0), Math.max(width - pillWidth, 0));
  return (
    <div className="ios-slider" ref={track}>
      <motion.output
        ref={pill}
        htmlFor={id}
        className="ios-slider-pill"
        initial={false}
        animate={{ x: pillX }}
        transition={SPRING}
      >
        {valueText}
      </motion.output>
      <div className="ios-slider-rail" aria-hidden="true">
        <motion.span
          className="ios-slider-fill"
          initial={false}
          animate={{ scaleX: width ? center / width : 0 }}
          transition={SPRING}
        />
        {Array.from({ length: stops }, (_, i) => (
          <i
            key={i}
            data-passed={i <= index}
            style={{
              left: `calc(${(i / (stops - 1)) * 100}% + ${THUMB / 2 - (i / (stops - 1)) * THUMB}px)`,
            }}
          />
        ))}
      </div>
      <motion.span
        className="ios-slider-thumb"
        aria-hidden="true"
        initial={false}
        animate={{ x: thumbX }}
        transition={SPRING}
      />
      <input
        id={id}
        type="range"
        min="0"
        max={stops - 1}
        step="1"
        value={index}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(event) => onIndex(Number(event.target.value))}
      />
    </div>
  );
}
