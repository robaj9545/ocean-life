// ─── Suppress Three.js & EXGL warnings BEFORE any module loads ───────────────
// This MUST execute before Three.js, R3F, or any 3D module is imported.
import './src/utils/suppressWarnings';

import registerRootComponent from 'expo/src/launch/registerRootComponent';
import App from './App';

registerRootComponent(App);
