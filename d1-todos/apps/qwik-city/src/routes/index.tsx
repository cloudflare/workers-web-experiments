import { component$, useClientEffect$, useSignal } from "@builder.io/qwik";
import { loader$, action$, Form } from "@builder.io/qwik-city";
import {
  type Todo,
  getTodos,
  addTodo,
  editTodo,
  deleteTodo,
  validateTodoText,
  saveSessionIdCookie,
  getOrCreateSessionId,
  getSessionIdFromRequest,
} from "shared";

interface Platform {
  D1_TODOS_DB?: D1Database;
}

export const dataLoader = loader$<
  Platform,
  Promise<{
    sessionId: string;
    todos: Todo[];
    latestActionError?: string;
    resetTodoInput: boolean;
  }>
>(async ({ request, platform, getData }) => {
  const db = getTodosDb(platform);
  const sessionId = await getOrCreateSessionId(request as Request, db);
  const todos = await getTodos(db, sessionId);

  const addActionData = await getData(addAction);
  const editActionData = await getData(editAction);
  const deleteActionData = await getData(deleteAction);

  const latestActionValue = [
    addActionData,
    editActionData,
    deleteActionData,
  ].find(Boolean);

  const latestActionError = latestActionValue?.error;

  const resetTodoInput = !!(
    latestActionValue &&
    latestActionValue === addActionData &&
    !latestActionError
  );

  return {
    sessionId,
    todos,
    latestActionError,
    resetTodoInput,
  };
});

export const addAction = action$(async (formData, { request, platform }) => {
  const db = getTodosDb(platform as Platform);
  const sessionId = getSessionIdFromRequest(request as Request);
  if (!sessionId) {
    return { error: "Session Id not defined!" };
  }
  const text = formData.get("text") as string;
  const checkResult = validateTodoText(text);
  if (checkResult.valid) {
    try {
      await addTodo(db, sessionId, text);
    } catch {
      return { error: "DataBase Internal Error" };
    }
  } else {
    return { error: checkResult.reason! };
  }
  return { addedTodo: text };
});

export const editAction = action$(async (formData, { request, platform }) => {
  const db = getTodosDb(platform as Platform);
  const sessionId = getSessionIdFromRequest(request as Request);

  if (!sessionId) {
    return { error: "Session Id not defined!" };
  }
  const id = formData.get("todo-id") as string;
  const completed = (formData.get("completed") as string) === "true";
  try {
    await editTodo(db, sessionId, id, completed);
  } catch {
    return { error: "DataBase Internal Error" };
  }

  return {};
});

export const deleteAction = action$(async (formData, { request, platform }) => {
  const db = getTodosDb(platform as Platform);
  const sessionId = getSessionIdFromRequest(request as Request);

  if (!sessionId) {
    return { error: "Session Id not defined!" };
  }
  const id = formData.get("todo-id") as string;
  try {
    await deleteTodo(db, sessionId, id);
  } catch {
    return { error: "DataBase Internal Error" };
  }

  return {};
});

export default component$(() => {
  const data = dataLoader.use();
  const { sessionId, todos, latestActionError: error } = data.value;

  const newTodo = useSignal<string>("");

  useClientEffect$(() => {
    if (sessionId) {
      saveSessionIdCookie(sessionId);
    }
  });

  const addActionUtils = addAction.use();
  const editActionUtils = editAction.use();
  const deleteActionUtils = deleteAction.use();

  useClientEffect$(({ track }) => {
    track(() => data.value.resetTodoInput);

    if (data.value.resetTodoInput) {
      newTodo.value = "";
    }
  });

  return (
    <div class="todos-app">
      <h1>Todos</h1>
      <Form action={addActionUtils} class="add-todo-wrapper">
        <div class="new-todo-input-form-control">
          <input hidden name="operation" readOnly value="add" />
          <input
            class={
              !newTodo.value || validateTodoText(newTodo.value).valid
                ? ""
                : "invalid"
            }
            type="text"
            name="text"
            value={newTodo.value}
            onInput$={(event) => {
              newTodo.value = (
                event.target as unknown as { value: string }
              ).value;
            }}
          />
          <button disabled={!newTodo.value}>add todo</button>
        </div>
      </Form>
      {error && <p class="backend-error">{error}</p>}
      <ul>
        {todos.map(({ id, text, completed }) => (
          <li key={id}>
            <Form action={editActionUtils}>
              <input hidden name="todo-id" readOnly value={id} />
              <input hidden name="completed" readOnly value={`${!completed}`} />
              <button
                role="checkbox"
                aria-checked={completed}
                aria-label={text}
                class={`custom-checkbox ${completed ? "checked" : ""}`}
              ></button>
            </Form>
            <span class={completed ? "line-through" : ""}>{text}</span>
            <Form action={deleteActionUtils}>
              <input hidden name="todo-id" readOnly value={id} />
              <button class="delete-btn" aria-label="delete"></button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
});

export function getTodosDb(platform: Platform): D1Database {
  const db = platform["D1_TODOS_DB"] as D1Database;
  if (!db) {
    throw new Error("No binding found for the D1_TODOS_DB database");
  }

  return db;
}
