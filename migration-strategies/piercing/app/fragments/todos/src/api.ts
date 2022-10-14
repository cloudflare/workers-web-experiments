import { parse } from "cookie";

/**
 * Note: the functions in this file save and retrieve data from cookies, in a real scenario
 *       they could communicated with a proper backend instead.
 */

export async function addTodo(
  user: string,
  listName: string,
  todoText: string
) {
  const cookieName = `piercingDemoSuite_userData_${user}`;
  const data = getUserData(user);
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
  const data = getUserData(user);
  const list = data.todoLists.find(({ name }) => name === listName);

  if (!list) {
    throw new Error(`Todo List Not found: ${listName}`);
  }

  list.todos = list.todos.filter(({ text }) => text !== todoText);

  const newDataStr = JSON.stringify(data);

  saveCookie(`piercingDemoSuite_userData_${user}`, newDataStr);
  return true;
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

export async function getLists(user: string, cookieToUse?: string) {
  return getUserData(user, cookieToUse).todoLists;
}

export async function getList(
  user: string,
  listName: string,
  cookieToUse?: string
) {
  return (await getLists(user, cookieToUse)).find(
    ({ name }) => name === listName
  );
}

export async function editTodo(
  user: string,
  listName: string,
  oldTodoText: string,
  todoDetails: { text: string; done: boolean }
) {
  const cookieName = `piercingDemoSuite_userData_${user}`;
  const data = getUserData(user);
  const list = data.todoLists.find(({ name }) => name === listName);

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

function getUserData(user: string, cookieToUse?: string) {
  const cookieName = `piercingDemoSuite_userData_${encodeURIComponent(user)}`;
  const cookies = parse(
    cookieToUse || (typeof document !== "undefined" && document.cookie) || ""
  );
  const cookie = cookies[`${cookieName}`];
  const data: {
    todoLists: { name: string; todos: { text: string; done: boolean }[] }[];
  } = JSON.parse(
    (cookie && decodeURIComponent(cookie)) ?? '{ "todoLists": [] }'
  );
  return data;
}
