import { LogoMark } from '../components/LogoMark.jsx';
import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

/** Large title that collapses into the bar while a frosted material fades in (see .ios-nav-*). */
export function LargeTitleBar({ title, actions, brand = true }) {
  const { scrollY } = useScroll();
  const inline = useTransform(scrollY, [34, 62], [0, 1]);
  const large = useTransform(scrollY, [0, 40], [1, 0]);
  const wordmark = useTransform(scrollY, [0, 28], [1, 0]);
  const material = useTransform(scrollY, [4, 34], [0, 1]);
  return (
    <header className="ios-nav">
      <div className="ios-nav-bar">
        <motion.div className="ios-nav-material" style={{ opacity: material }} aria-hidden="true" />
        {brand ? (
          <motion.span className="ios-nav-brand hearth-wordmark" style={{ opacity: wordmark }}>
            <LogoMark />
            HEARTH
          </motion.span>
        ) : (
          <span />
        )}
        <motion.span className="ios-nav-title" style={{ opacity: inline }} aria-hidden="true">
          {title}
        </motion.span>
        <div className="ios-nav-actions">{actions}</div>
      </div>
      <motion.div className="ios-large-title" style={{ opacity: large }}>
        <h1>{title}</h1>
      </motion.div>
    </header>
  );
}
