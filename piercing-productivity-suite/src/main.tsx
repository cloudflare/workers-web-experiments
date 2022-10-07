import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerPiercingFragmentOutlet } from "piercing-lib";

registerPiercingFragmentOutlet();

setTimeout(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}, +(window.sessionStorage.getItem("spaDelay") ?? 0) * 1000);
