import type { Todo } from "shared";

export function App({
  todos,
  backendError: error,
}: {
  todos: Todo[];
  backendError?: string;
}) {
  return (
    <div class="todos-app">
      <h1>Todos</h1>
      <div>
        <form method="post">
          <div class="new-todo-input-form-control">
            <input hidden name="action" readOnly value="add" />
            <input type="text" name="text" />
            <button>add todo</button>
          </div>
        </form>
        {error && <p class="backend-error">{error}</p>}
      </div>
      <ul>
        {todos.map(({ id, text, completed }) => (
          <li key={id}>
            <form method="post">
              <input hidden name="action" readOnly value="edit" />
              <input hidden name="todo-id" readOnly value={id} />
              <input hidden name="completed" readOnly value={`${!completed}`} />
              <button
                role="checkbox"
                aria-checked={completed}
                aria-label={text}
                class={`custom-checkbox ${completed ? "checked" : ""}`}
              ></button>
            </form>
            <span class={completed ? "line-through" : ""}>{text}</span>
            <form method="post">
              <input hidden name="action" readOnly value="delete" />
              <input hidden name="todo-id" readOnly value={id} />
              <button class="delete-btn" aria-label="delete"></button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
