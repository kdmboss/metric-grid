import '@fontsource-variable/plus-jakarta-sans';
import { initializeNativeShell } from './platform.js';
import './app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion } from 'motion/react';
import { App } from './App.jsx';
import { Brand } from './Evidence.jsx';
import { LogoMark } from './components/LogoMark.jsx';
class ErrorBoundary extends React.Component {
  state = {
    error: false,
  };
  static getDerivedStateFromError() {
    return {
      error: true,
    };
  }
  render() {
    return this.state.error ? (
      <div className="load-screen">
        <Brand />
        <h1>The scenario could not be displayed.</h1>
        <p>The frozen data may be incomplete. Reload to try again.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
/** Reduced-motion users get fades instead of movement everywhere; the first screen rises 8px. */
function Shell({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="launch-rise"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
initializeNativeShell();
const root = createRoot(document.getElementById('root'));
root.render(
  <div className="load-screen is-loading" role="status">
    <LogoMark />
    <h1>Loading HEARTH…</h1>
    <p>Preparing the scenario comparison.</p>
  </div>,
);
fetch('data/app.json')
  .then((response) => {
    if (!response.ok) throw new Error('Frozen data unavailable');
    return response.json();
  })
  .then((data) =>
    root.render(
      <Shell>
        <ErrorBoundary>
          <App data={data} />
        </ErrorBoundary>
      </Shell>,
    ),
  )
  .catch(() =>
    root.render(
      <div className="load-screen" role="alert">
        <Brand />
        <h1>The scenario data is unavailable.</h1>
        <p>Reload to try again. If the problem continues, please try again later.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>,
    ),
  );
