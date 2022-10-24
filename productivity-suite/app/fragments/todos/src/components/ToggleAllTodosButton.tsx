import { ChangeEvent } from "react";
import { editTodo, Todo } from "shared";
import "./ToggleAllTodosButton.css";

export function ToggleAllTodosButton({
  activeTodos,
  completedTodos,
  currentUser,
  listName,
  onToggle,
}: {
  activeTodos: Todo[];
  completedTodos: Todo[];
  currentUser: string;
  listName: string;
  onToggle: (to: "completed" | "active") => void;
}) {
  return (
    <>
      <input
        id="todo-mvc-toggle-all"
        className="todo-mvc-toggle-all"
        type="checkbox"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const allCompleted = event.target.checked;
          const todosToToggle = allCompleted ? activeTodos : completedTodos;
          for (const { text } of todosToToggle) {
            editTodo(currentUser, listName, text, {
              text,
              completed: allCompleted,
            });
          }
          onToggle(allCompleted ? "completed" : "active");
        }}
      />
      <label htmlFor="todo-mvc-toggle-all">Mark all as complete</label>
    </>
  );
}
