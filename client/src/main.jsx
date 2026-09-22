// client/src/main.jsx
//
// Mounts the app. Like server/src/index.js, this is a thin entry point:
// it starts React and gets out of the way.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
