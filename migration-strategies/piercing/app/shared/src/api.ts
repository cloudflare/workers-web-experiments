// Note:
//  The following file, for the purposed of this demo just interact with cookies instead
//  of properly communicate with a real backend. In a real scenarios the logic present
//  in this file would communicate and have the data saved in a proper persistent database.

import { parse } from "cookie";

const cookiesPrefix = "piercingDemoSuite_";

export async function getTodoLists(user: string, cookieToUse?: string) {
  return getDefinedUserData(user, cookieToUse).todoLists;
}

export async function getTodoList(
  user: string,
  listName: string,
  cookieToUse?: string
) {
  return (await getTodoLists(user, cookieToUse))?.find(
    ({ name }) => name === listName
  );
}

export async function addTodoList(user: string, listName: string) {
  const cookieName = `${cookiesPrefix}userData_${user}`;
  const data = getDefinedUserData(user);
  data.todoLists.push({
    name: listName,
    todos: [],
  });

  const newDataStr = JSON.stringify(data);

  if (new Blob([cookieName, newDataStr]).size > cookieBytesLimit) {
    alert(
      "Error: The cookie bytes limit is not enough for the new list," +
        " addition failed"
    );
    return false;
  }

  saveCookie(cookieName, newDataStr);
  return true;
}

export async function removeTodoList(user: string, listName: string) {
  const data = getDefinedUserData(user);
  data.todoLists = data.todoLists.filter(({ name }) => name !== listName);

  const newDataStr = JSON.stringify(data);

  saveCookie(`${cookiesPrefix}userData_${user}`, newDataStr);
  return true;
}

export async function editTodoList(
  user: string,
  oldListName: string,
  newListName: string
) {
  const data = getDefinedUserData(user);
  const list = data.todoLists.find(({ name }) => name === oldListName);

  if (!list) {
    throw new Error(`Todo List Not found: ${oldListName}`);
  }

  data.todoLists = data.todoLists.map((list) => {
    if (list.name !== oldListName) return list;
    return { ...list, name: newListName };
  });

  const newDataStr = JSON.stringify(data);

  saveCookie(`${cookiesPrefix}userData_${user}`, newDataStr);
  return true;
}

export async function addTodo(
  user: string,
  listName: string,
  todoText: string
) {
  const cookieName = `${cookiesPrefix}userData_${user}`;
  const data = getDefinedUserData(user);
  const list = data.todoLists.find(({ name }) => name === listName);

  if (!list) {
    throw new Error(`Todo List Not found: ${listName}`);
  }

  list.todos.push({ text: todoText, done: false });

  const newDataStr = JSON.stringify(data);

  if (new Blob([cookieName, newDataStr]).size > cookieBytesLimit) {
    alert(
      "Error: The cookie bytes limit is not enough for the new todo," +
        " addition failed"
    );
    return false;
  }

  saveCookie(cookieName, newDataStr);
  return true;
}

export async function removeTodo(
  user: string,
  listName: string,
  todoText: string
) {
  const data = getDefinedUserData(user);
  const list = data.todoLists.find(({ name }) => name === listName);

  if (!list) {
    throw new Error(`Todo List Not found: ${listName}`);
  }

  list.todos = list.todos.filter(({ text }) => text !== todoText);

  const newDataStr = JSON.stringify(data);

  saveCookie(`${cookiesPrefix}userData_${user}`, newDataStr);
  return true;
}

export async function editTodo(
  user: string,
  listName: string,
  oldTodoText: string,
  todoDetails: { text: string; done: boolean }
) {
  const cookieName = `${cookiesPrefix}userData_${user}`;
  const data = getDefinedUserData(user);
  const list = data?.todoLists.find(({ name }) => name === listName);

  if (!list) {
    throw new Error(`Todo List Not found: ${listName}`);
  }

  const todo = list.todos.find(({ text }) => text === oldTodoText);

  if (!todo) {
    throw new Error(`Todo Not found: ${oldTodoText} (in list ${listName})`);
  }

  todo.text = todoDetails.text;
  todo.done = todoDetails.done;

  const newDataStr = JSON.stringify(data);

  if (new Blob([cookieName, newDataStr]).size > cookieBytesLimit) {
    alert(
      "Error: The cookie bytes limit is not enough for the edited todo," +
        " editing failed"
    );
    return false;
  }

  saveCookie(cookieName, newDataStr);
  return true;
}

function getDefinedUserData(user: string, cookieToUse?: string) {
  const data = getUserData(user, cookieToUse);
  if (!data) {
    throw new Error(`User data not found for user ${user}`);
  }
  return data;
}

export function getUserData(user: string, cookieToUse?: string) {
  const cookie = getCookie(`${cookiesPrefix}userData_${user}`, cookieToUse);
  const data: {
    todoLists: { name: string; todos: { text: string; done: boolean }[] }[];
  } | null = (cookie && JSON.parse(cookie)) ?? null;
  return data;
}

export async function getCurrentUser(cookieToUse?: string) {
  return getCookie(`${cookiesPrefix}currentUser`, cookieToUse);
}

export async function saveCurrentUser(username: string) {
  return saveCookie(`${cookiesPrefix}currentUser`, username);
}

export async function deleteCurrentUser() {
  return deleteCookie(`${cookiesPrefix}currentUser`);
}

export async function setUserData(user: string, dataStr: string) {
  saveCookie(`${cookiesPrefix}userData_${user}`, dataStr);
}

const cookieBytesLimit = 4096;
const millisInAMonth = 2628e6;

function saveCookie(cookieName: string, value: string) {
  const expirationDate = new Date(
    new Date().getTime() + millisInAMonth
  ).toUTCString();
  document.cookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(
    value
  )}; expires=${expirationDate}; path=/`;
}

function getCookie(cookieName: string, cookieToUse?: string): string | null {
  const cookie = parse(
    cookieToUse || (typeof document !== "undefined" && document.cookie) || ""
  );
  console.log(`\x1b[43m ${JSON.stringify({ cookie })} \x1b[0m`);

  return (
    (cookie && decodeURIComponent(cookie[encodeURIComponent(cookieName)])) ??
    null
  );
}

function deleteCookie(cookieName: string) {
  const expirationDate = new Date(0).toUTCString();
  document.cookie = `${cookieName}=; expires=${expirationDate}; path=/`;
}
