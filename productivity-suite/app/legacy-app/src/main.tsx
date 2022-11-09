import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerPiercingFragmentOutlet } from "piercing-library";

registerPiercingFragmentOutlet();

setTimeout(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}, +(window.sessionStorage.getItem("legacyAppDelay") ?? 2) * 1000);
