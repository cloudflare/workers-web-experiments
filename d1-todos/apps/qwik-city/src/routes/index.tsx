import {
  component$,
  useClientEffect$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
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
  }>
>(async ({ request, platform }) => {
  const db = getTodosDb(platform);
  const sessionId = await getOrCreateSessionId(request as Request, db);
  const todos = await getTodos(db, sessionId);
  return {
    sessionId,
    todos,
  };
});

export const addAction = action$(async (formData, { request, platform }) => {
  const db = getTodosDb(platform as Platform);
  const timestamp = new Date().getTime();
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
      return { error: "DataBase Internal Error", timestamp };
    }
  } else {
    return { error: checkResult.reason!, timestamp };
  }
  return { addedTodo: text, timestamp };
});

export const editAction = action$(async (formData, { request, platform }) => {
  const db = getTodosDb(platform as Platform);
  const sessionId = getSessionIdFromRequest(request as Request);
  const timestamp = new Date().getTime();

  if (!sessionId) {
    return { error: "Session Id not defined!", timestamp };
  }
  const id = formData.get("todo-id") as string;
  const completed = (formData.get("completed") as string) === "true";
  try {
    await editTodo(db, sessionId, id, completed);
  } catch {
    return { error: "DataBase Internal Error", timestamp };
  }

  return { timestamp };
});

export const deleteAction = action$(async (formData, { request, platform }) => {
  const db = getTodosDb(platform as Platform);
  const sessionId = getSessionIdFromRequest(request as Request);
  const timestamp = new Date().getTime();

  if (!sessionId) {
    return { error: "Session Id not defined!", timestamp };
  }
  const id = formData.get("todo-id") as string;
  try {
    await deleteTodo(db, sessionId, id);
  } catch {
    return { error: "DataBase Internal Error", timestamp };
  }

  return { timestamp };
});

export default component$(() => {
  const data = dataLoader.use();
  const { sessionId, todos } = data.value;

  const newTodo = useSignal<string>("");
  const error = useSignal<string | undefined>();

  useClientEffect$(() => {
    if (sessionId) {
      saveSessionIdCookie(sessionId);
    }
  });

  const addActionUtils = addAction.use();
  const editActionUtils = editAction.use();
  const deleteActionUtils = deleteAction.use();

  useTask$(({ track }) => {
    track(() => addActionUtils.value);
    track(() => editActionUtils.value);
    track(() => deleteActionUtils.value);

    const latestActionUtilsValue = [
      addActionUtils.value,
      editActionUtils.value,
      deleteActionUtils.value,
    ].reduce((acc, curr) =>
      (curr?.timestamp ?? 0) > (acc?.timestamp ?? 0) ? curr : acc
    );

    const latestError = latestActionUtilsValue?.error;

    error.value = latestError;

    if (!latestError && latestActionUtilsValue === addActionUtils.value) {
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
      {error.value && <p class="backend-error">{error.value}</p>}
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
