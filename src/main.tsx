import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeConsentScripts } from '@/utils/consentManager'

// Initialize consent-based scripts before app renders
initializeConsentScripts();

createRoot(document.getElementById("root")!).render(<App />);
