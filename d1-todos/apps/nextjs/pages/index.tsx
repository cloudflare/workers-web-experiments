import "shared/src/styles.css";
import { type Todo } from "shared";

export default function Home() {
  const todos: Todo[] = [];

  let error: string | undefined;

  return (
    <div className="todos-app">
      <h1>Todos</h1>
      <div>
        <form method="post">
          <div className="new-todo-input-form-control">
            <input
              // className={
              // !newTodo || validateTodoText(newTodo).valid ? "" : "invalid"
              // }
              type="text"
              name="text"
              // value={newTodo}
              // onInput={(event: ChangeEvent<HTMLInputElement>) =>
              //   setNewTodo(event.target.value)
              // }
            />
            <button
              disabled={
                false
                // !newTodo
              }
            >
              add todo
            </button>
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
            <form method="delete">
              <input hidden name="todo-id" readOnly value={id} />
              <button className="delete-btn" aria-label="delete"></button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
