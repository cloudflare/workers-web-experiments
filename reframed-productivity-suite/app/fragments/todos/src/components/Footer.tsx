import { TodoType } from "../todoType";
import "./Footer.css";

export function Footer({
  numOfActiveTodos,
  numOfCompletedTodos,
  todosSelection,
  setTodosSelection,
  clearCompletedTodos,
}: {
  numOfActiveTodos: number;
  numOfCompletedTodos: number;
  todosSelection: TodoType;
  setTodosSelection: (selection: TodoType) => void;
  clearCompletedTodos: () => void;
}) {
  return (
    <footer className="todo-mvc-footer">
      <span className="todo-count">
        <strong>{numOfActiveTodos}</strong> item
        {numOfActiveTodos !== 1 ? "s" : ""} left
      </span>
      <ul className="filters">
        {Object.values(TodoType).map((selection) => (
          <li key={`selection-${selection}`}>
            <button
              className={todosSelection === selection ? "selected" : ""}
              onClick={() => setTodosSelection(selection)}
            >
              {selection}
            </button>
          </li>
        ))}
      </ul>
      {!!numOfCompletedTodos && (
        <button className="clear-completed" onClick={clearCompletedTodos}>
          Clear completed
        </button>
      )}
    </footer>
  );
}
