import "shared/src/styles.css";
import { type Todo, validateTodoText } from "shared";
import { ChangeEvent, FormEventHandler, useState } from "react";

import { getTodos } from "../_tmpShared";
import { sessionId, tmpTodosD1Db } from "../_tmp";

export type HandlerResult = { success: boolean; errorMessage?: string };

export async function getServerSideProps() {
  const todos = await getTodos(tmpTodosD1Db, sessionId);
  return {
    props: {
      todos,
    },
  };
}

export default function Home({ todos: initialTodos }: { todos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos ?? []);
  const [newTodo, setNewTodo] = useState<string>("");
  const [error, setError] = useState<string>("");

  const updateUiOnResult = async (result: HandlerResult) => {
    if (result.success) {
      const todos = await fetchTodos();
      setTodos(todos);
      setNewTodo("");
      setError("");
    } else {
      setError(result.errorMessage!);
    }
  };

  const handleNewTodoSubmit: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const response = await sendTodosRequest("add", { text: newTodo });
    const result = (await response.json()) as HandlerResult;
    updateUiOnResult(result);
  };

  const handleTodoDeletion = async (todoId: string) => {
    const response = await sendTodosRequest("delete", { todoId });
    const result = (await response.json()) as HandlerResult;
    updateUiOnResult(result);
  };

  const handleTodoEditing = async (todoId: string, completed: boolean) => {
    const response = await sendTodosRequest("edit", { todoId, completed });
    const result = (await response.json()) as HandlerResult;
    updateUiOnResult(result);
  };

  return (
    <div className="todos-app">
      <h1>Todos</h1>
      <div>
        <form onSubmit={handleNewTodoSubmit}>
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
        </form>
        {error && <p className="backend-error">{error}</p>}
      </div>
      <ul>
        {todos.map(({ id, text, completed }) => (
          <li key={id}>
            <button
              role="checkbox"
              aria-checked={completed}
              aria-label={text}
              className={`custom-checkbox ${completed ? "checked" : ""}`}
              onClick={() => handleTodoEditing(id, !completed)}
            ></button>
            <span className={completed ? "line-through" : ""}>{text}</span>
            <button
              className="delete-btn"
              aria-label="delete"
              onClick={() => handleTodoDeletion(id)}
            ></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function fetchTodos(): Promise<Todo[]> {
  const todosFetchResp = await fetch("/api/todos");

  if (todosFetchResp.status !== 200) {
    throw new Error("Todos fetching failed");
  }

  const { todos } = (await todosFetchResp.json()) as {
    todos: Todo[];
  };

  return todos;
}

const todosRequestTypeMethodMap = {
  list: "GET",
  add: "POST",
  edit: "PATCH",
  delete: "DELETE",
} as const;

async function sendTodosRequest(
  type: keyof typeof todosRequestTypeMethodMap,
  body: object
) {
  return await fetch("/api/todos", {
    method: todosRequestTypeMethodMap[type],
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
