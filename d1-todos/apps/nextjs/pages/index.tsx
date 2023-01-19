import "shared/src/styles.css";
import { type Todo, validateTodoText } from "shared";
import { ChangeEvent, FormEventHandler, useState } from "react";

import { getTodos } from "../_tmpShared";
import { sessionId, tmpTodosD1Db } from "../_tmp";
import { HandlerResult } from "api-utils";

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

    const text = (event.target as unknown as { text: { value: string } }).text
      .value;

    const response = await fetch("/api/todos/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    });

    const result = (await response.json()) as HandlerResult;
    updateUiOnResult(result);
  };

  const handleTodoDeletion = async (todoId: string) => {
    const response = await fetch("/api/todos/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        todoId,
      }),
    });

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
            <form method="put">
              <input hidden name="todo-id" readOnly value={id} />
              <input hidden name="completed" readOnly value={`${!completed}`} />
              <button
                role="checkbox"
                aria-checked={completed}
                aria-label={text}
                className={`custom-checkbox ${completed ? "checked" : ""}`}
              ></button>
            </form>
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
  const todosFetchResp = await fetch("/api/todos/list");

  if (todosFetchResp.status !== 200) {
    throw new Error("Todos fetching failed");
  }

  const { todos } = (await todosFetchResp.json()) as {
    todos: Todo[];
  };

  return todos;
}
