import { getBus } from "piercing-library";
import React from "react";
import ReactDOM from "react-dom/client";
import { getTodoLists } from "shared";
import App from "./App";
import { EnvContext } from "./env";

(async () => {
  const rootElement = document.getElementById(
    "todos-fragment-root"
  ) as HTMLElement;

  const todoListName =
    getBus().latestValue<{ name: string }>("todo-list-selected")?.name ?? null;
  const currentUser =
    getBus().latestValue<{ username: string }>("authentication")?.username ??
    null;

  const lists = currentUser ? await getTodoLists(currentUser) : [];
  const todoList = lists.find(({ name }) => todoListName === name);

  if (!todoList) {
    throw new Error(`todoList "${todoListName}" not found`);
  }

  const application = (
    <React.StrictMode>
      <EnvContext.Provider value={{ currentUser }}>
        <App todoList={todoList} />
      </EnvContext.Provider>
    </React.StrictMode>
  );

  const appWasSSRed = rootElement.children.length > 0;

  if (appWasSSRed) {
    ReactDOM.hydrateRoot(rootElement, application);
  } else {
    ReactDOM.createRoot(rootElement).render(application);
  }
})();
