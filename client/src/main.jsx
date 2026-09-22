// client/src/main.jsx
//
// Mounts the app. Same idea as server/src/index.js: it starts React and
// nothing else.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
