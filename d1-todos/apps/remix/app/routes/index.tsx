import { type AppLoadContext } from "@remix-run/cloudflare";
import { type DataFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { type ChangeEvent, useEffect, useState } from "react";
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
import styles from "shared/src/styles.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

// Note: for the loader and action we are not suing the LoaderFunction and ActionFunction
//       types but just DataFunctionArgs so that we can infer the return type and have good type safety
//       (see: https://jfranciscosousa.com/blog/typing-remix-loaders-with-confidence)

export async function loader({ request, context }: DataFunctionArgs) {
  const todosDb = getTodosDb(context);
  const sessionId = await getOrCreateSessionId(request, todosDb);
  const todos = await getTodos(todosDb, sessionId);
  return {
    sessionId,
    todos,
  };
}

type ActionResult = { success: boolean; errorMessage?: string };

export async function action({
  context,
  request,
}: DataFunctionArgs): Promise<ActionResult> {
  const sessionId = getSessionIdFromRequest(request);

  if (!sessionId) {
    return {
      success: false,
      errorMessage: "Session id not provided",
    };
  }

  // Note: we are using the method here since Remix provides it and the verbs here match
  //       nicely the various operations, we could have also used actions or hidden fields
  //       to distinguish the various operations
  if (request.method === "POST") {
    return handlePostAction(request, sessionId, context);
  }
  if (request.method === "PATCH") {
    return handlePutAction(request, sessionId, context);
  }
  if (request.method === "DELETE") {
    return handleDeleteAction(request, sessionId, context);
  }

  throw new Error("Method not supported");
}

async function handlePostAction(
  request: Request,
  sessionId: string,
  context: AppLoadContext
): Promise<ActionResult> {
  const formData = await request.formData();
  const text = formData.get("text") as string;

  if (!text) {
    return {
      success: false,
      errorMessage: "Todos can't be empty",
    };
  }

  const textValidation = validateTodoText(text);
  if (!textValidation.valid) {
    return {
      success: false,
      errorMessage: textValidation.reason,
    };
  }

  try {
    await addTodo(getTodosDb(context), sessionId, text as string);
  } catch {
    return {
      success: false,
      errorMessage: "DataBase Internal Error",
    };
  }

  return { success: true };
}

async function handlePutAction(
  request: Request,
  sessionId: string,
  context: AppLoadContext
): Promise<ActionResult> {
  const formData = await request.formData();
  const todoId = formData.get("todo-id");
  const completed = formData.get("completed");

  if (!todoId) {
    return {
      success: false,
      errorMessage: "the id of the todo must be provided",
    };
  }

  if (!completed) {
    return {
      success: false,
      errorMessage: "the completed status for the todo must be provided",
    };
  }

  try {
    await editTodo(
      getTodosDb(context),
      sessionId,
      todoId as string,
      completed === "true"
    );
  } catch {
    return {
      success: false,
      errorMessage: "DataBase Internal Error",
    };
  }

  return { success: true };
}

async function handleDeleteAction(
  request: Request,
  sessionId: string,
  context: AppLoadContext
): Promise<ActionResult> {
  const formData = await request.formData();
  const todoId = formData.get("todo-id");

  if (!todoId) {
    return {
      success: false,
      errorMessage: "the id of the todo must be provided",
    };
  }

  try {
    await deleteTodo(getTodosDb(context), sessionId, todoId as string);
  } catch {
    return {
      success: false,
      errorMessage: "DataBase Internal Error",
    };
  }

  return { success: true };
}

type LoaderType = Awaited<ReturnType<typeof loader>>;
type ActionType = Awaited<ReturnType<typeof action>>;

export default function Index() {
  const { sessionId, todos }: { sessionId: string; todos: Todo[] } =
    useLoaderData<LoaderType>();

  useEffect(() => saveSessionIdCookie(sessionId), [sessionId]);

  const transition = useTransition();

  const actionData = useActionData<ActionType>();
  let error = actionData?.errorMessage ?? null;

  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.submission?.method === "POST" &&
      !error
    ) {
      setNewTodo("");
    }
  }, [transition.state, transition.submission, error]);

  return (
    <div className="todos-app">
      <h1>Todos</h1>
      <div>
        <Form method="post">
          <div className="new-todo-input-form-control">
            <input
              className={
                !newTodo || validateTodoText(newTodo).valid ? "" : "invalid"
              }
              type="text"
              name="text"
              value={newTodo}
              onInput={(event: ChangeEvent<HTMLInputElement>) =>
                setNewTodo(event.target.value)
              }
            />
            <button disabled={!newTodo}>add todo</button>
          </div>
        </Form>
        {error && <p className="backend-error">{error}</p>}
      </div>
      <ul>
        {todos.map(({ id, text, completed }) => (
          <li key={id}>
            <Form method="patch">
              <input hidden name="todo-id" readOnly value={id} />
              <input hidden name="completed" readOnly value={`${!completed}`} />
              <button
                role="checkbox"
                aria-checked={completed}
                aria-label={text}
                className={`custom-checkbox ${completed ? "checked" : ""}`}
              ></button>
            </Form>
            <span className={completed ? "line-through" : ""}>{text}</span>
            <Form method="delete">
              <input hidden name="todo-id" readOnly value={id} />
              <button className="delete-btn" aria-label="delete"></button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getTodosDb(context: AppLoadContext): D1Database {
  return context["D1_TODOS_DB"] as D1Database;
}
