import {
  component$,
  Resource,
  useClientEffect$,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import { RequestHandler, useEndpoint } from "@builder.io/qwik-city";
import {
  type Todo,
  getTodos,
  addTodo,
  editTodo,
  deleteTodo,
  validateTodoText,
  getOrCreateSessionId,
  getSessionIdFromRequest,
  saveSessionIdCookie,
} from "shared";

interface Platform {
  D1_TODOS_DB: D1Database;
}

export const onGet: RequestHandler<{ todos: Todo[] }, Platform> = async ({
  request,
  platform,
}) => {
  const todosDb = getTodosDb(platform);
  const sessionId = await getOrCreateSessionId(request as Request, todosDb);
  const todos = await getTodos(todosDb, sessionId);
  return {
    sessionId,
    todos,
  };
};

export const onPost: RequestHandler<
  { todos: Todo[]; error?: string },
  Platform
> = async ({ request, platform }) => {
  const sessionId = getSessionIdFromRequest(request as Request);

  const formData = await request.formData();
  const operation = formData.get("operation") as "add" | "edit" | "delete";
  let error: string | null = null;

  let todos: Todo[] = [];
  const db = getTodosDb(platform);

  if (!sessionId) {
    error = "Session id not provided";
  } else {
    try {
      const operationFn = operationFnsMap[operation];
      await operationFn(formData, db, sessionId);
      todos = await getTodos(db, sessionId);
    } catch (e: any) {
      error = e.message;
    }
  }

  return {
    todos,
    ...(error ? { error } : {}),
  };
};

const operationFnsMap = {
  add: handleTodoAdd,
  edit: handleTodoEdit,
  delete: handleTodoDelete,
} as const;

async function handleTodoAdd(
  formData: FormData,
  db: D1Database,
  sessionId: string
): Promise<void> {
  const text = formData.get("text") as string;
  const checkResult = validateTodoText(text);
  if (checkResult.valid) {
    try {
      await addTodo(db, sessionId, text);
    } catch {
      throw new Error("DataBase Internal Error");
    }
  } else {
    throw new Error(checkResult.reason!);
  }
}

async function handleTodoEdit(
  formData: FormData,
  db: D1Database,
  sessionId: string
): Promise<void> {
  const id = formData.get("todo-id") as string;
  const completed = (formData.get("completed") as string) === "true";
  try {
    await editTodo(db, sessionId, id, completed);
  } catch {
    throw new Error("DataBase Internal Error");
  }
}

async function handleTodoDelete(
  formData: FormData,
  db: D1Database,
  sessionId: string
): Promise<void> {
  const id = formData.get("todo-id") as string;
  try {
    await deleteTodo(db, sessionId, id);
  } catch {
    throw new Error("DataBase Internal Error");
  }
}

export default component$(() => {
  const data = useEndpoint<{
    sessionId: string;
    todos: Todo[];
    error?: string;
  }>();

  const newTodo = useSignal<string>("");
  const sessionState = useStore({ sessionId: "" });

  useClientEffect$(({ track }) => {
    track(sessionState);

    if (sessionState.sessionId) {
      saveSessionIdCookie(sessionState.sessionId);
    }
  });

  return (
    <Resource
      value={data}
      onPending={() => <div></div>}
      onRejected={() => <div></div>}
      onResolved={({ sessionId, todos, error }) => {
        if (sessionId) {
          sessionState.sessionId = sessionId;
        }

        return (
          <div class="todos-app">
            <h1>Todos</h1>
            <form method="post" class="add-todo-wrapper">
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
            </form>
            {error && <p class="backend-error">{error}</p>}
            <ul>
              {todos.map(({ id, text, completed }) => (
                <li key={id}>
                  <form method="post">
                    <input hidden name="operation" readOnly value="edit" />
                    <input hidden name="todo-id" readOnly value={id} />
                    <input
                      hidden
                      name="completed"
                      readOnly
                      value={`${!completed}`}
                    />
                    <button
                      role="checkbox"
                      aria-checked={completed}
                      aria-label={text}
                      class={`custom-checkbox ${completed ? "checked" : ""}`}
                    ></button>
                  </form>
                  <span class={completed ? "line-through" : ""}>{text}</span>
                  <form method="post">
                    <input hidden name="operation" readOnly value="delete" />
                    <input hidden name="todo-id" readOnly value={id} />
                    <button class="delete-btn" aria-label="delete"></button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    />
  );
});

function getTodosDb(platform: Platform): D1Database {
  return platform["D1_TODOS_DB"] as D1Database;
}
