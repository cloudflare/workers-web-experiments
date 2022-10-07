import { parse } from "cookie";

/**
 * Note: the functions in this file save and retrieve data from cookies, in a real scenario
 *       they could communicated with a proper backend instead.
 */

export async function addTodoList(user: string, listName: string) {
  const cookieName = `piercingDemoSuite_userData_${user}`;
  const data = getUserData(user);
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
  const data = getUserData(user);
  data.todoLists = data.todoLists.filter(({ name }) => name !== listName);

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
  document.cookie = `${cookieName}=${value}; expires=${expirationDate}; path=/`;
}

function getUserData(user: string) {
  const cookieName = `piercingDemoSuite_userData_${user}`;
  const cookies = parse(document.cookie || "");
  const cookie = cookies[`${cookieName}`];
  const data: { todoLists: { name: string; todos: any[] }[] } = JSON.parse(
    cookie ?? '{ "todoLists": [] }'
  );
  return data;
}
