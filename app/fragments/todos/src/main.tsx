import { parse } from "cookie";
import React from "react";
import ReactDOM from "react-dom/client";
import { getList } from "./api";
import App from "./App";
import { EnvContext } from "./env";

(async () => {
  const match = /\/todos\/([^/]+)/.exec(window.location.pathname);
  const listName = match?.[1] ?? null;
  let todosListDetails = undefined;

  const cookie = parse(document.cookie);
  const currentUser = cookie["piercingDemoSuite_currentUser"] ?? null;

  if (currentUser && listName) {
    const list = await getList(currentUser, decodeURIComponent(listName));
    if (list) {
      todosListDetails = list;
    }
  }

  const application = (
    <React.StrictMode>
      <EnvContext.Provider value={{ currentUser }}>
        <App todosListDetails={todosListDetails} />
      </EnvContext.Provider>
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
