import React from 'react';
import { createRoot } from 'react-dom/client';
import { Workspace } from './Workspace.jsx';
import { Brand } from './Evidence.jsx';
import './styles.css';
import './workspace.css';

class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <div className="load-screen"><Brand/><h1>The scenario could not be displayed.</h1><p>The frozen data may be incomplete. Reload to try again.</p><button className="button" onClick={() => window.location.reload()}>Reload</button></div> : this.props.children; }
}
const root = createRoot(document.getElementById('root'));
root.render(<div className="load-screen" role="status"><Brand/><h1>Loading the planning workspace…</h1><p>Reading frozen public data.</p></div>);
fetch('/data/app.json').then(response => { if (!response.ok) throw new Error('Frozen data unavailable'); return response.json(); })
  .then(data => root.render(<ErrorBoundary><Workspace data={data}/></ErrorBoundary>))
  .catch(() => root.render(<div className="load-screen" role="alert"><Brand/><h1>The scenario data is unavailable.</h1><p>Reload to try again. If this continues, the deployment needs its frozen data export rebuilt.</p><button className="button" onClick={() => window.location.reload()}>Reload</button></div>));
