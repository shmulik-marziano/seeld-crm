import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import '@fontsource/playfair-display/700.css'; // Forbes-style bold serif
import '@fontsource/inter/200.css'; // Ultra-thin sans-serif

createRoot(document.getElementById("root")!).render(<App />);
