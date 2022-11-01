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

  const { name: todoListName }: { name: string } =
    getBus().latestValue("todo-list-selected");
  const { username: currentUser }: { username: string } =
    getBus().latestValue("authentication");

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
