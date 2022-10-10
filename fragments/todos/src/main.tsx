import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

(async () => {
  const match = /\/todos\/([^/]+)/.exec(window.location.pathname);

  const todosListDetails = {
    listName: match?.[1] ?? null,
  };

  const application = (
    <React.StrictMode>
      <App todosListDetails={todosListDetails} />
    </React.StrictMode>
  );

  const rootElement = document.getElementById(
    "todos-fragment-root"
  ) as HTMLElement;

  const appWasSSRed = rootElement.children.length > 0;

  if (appWasSSRed) {
    ReactDOM.hydrateRoot(rootElement, application);
  } else {
    ReactDOM.createRoot(rootElement).render(application);
  }
})();
