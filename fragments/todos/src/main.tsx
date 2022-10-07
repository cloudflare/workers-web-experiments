import { parse } from "cookie";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

(async () => {
  const todosListDetails = {
    listName: "Todo List",
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
