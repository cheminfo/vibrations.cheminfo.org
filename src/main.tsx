import { createRoot } from 'react-dom/client';
import { installVibrationalAnalyser } from 'xtb-wasm';

import { App } from './App.tsx';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-science/styles/preflight.css';
import './index.css';

// The engine reaches Raman activities and the RRHO block through a seam, so
// that the worker bundle carries the wasm driver alone. Nothing else installs
// it, and a run without it silently reports neither.
installVibrationalAnalyser();

const container = document.querySelector('#root');
if (container === null) throw new Error('missing #root element');

createRoot(container).render(<App />);
