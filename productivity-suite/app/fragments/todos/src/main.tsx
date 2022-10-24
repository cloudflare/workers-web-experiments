import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentUser, getTodoList, getTodoLists } from "shared";
import App from "./App";
import { EnvContext } from "./env";

(async () => {
  const match = /\/todos\/([^/]+)/.exec(window.location.pathname);
  const listName = match?.[1] ?? null;
  let todosListDetails = undefined;

  const currentUser = getCurrentUser();

  if (currentUser) {
    if (listName) {
      const list = await getTodoList(currentUser, decodeURIComponent(listName));
      if (list) {
        todosListDetails = list;
      }
    } else {
      const lists = await getTodoLists(currentUser);
      todosListDetails = lists[lists.length - 1];
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
