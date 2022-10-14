import { ChangeEvent } from "react";
import { editTodo } from "shared";
import "./ToggleAllTodosButton.css";

export function ToggleAllTodosButton({
  activeTodos,
  completedTodos,
  currentUser,
  listName,
  onToggle,
}: {
  activeTodos: { text: string; done: boolean }[];
  completedTodos: { text: string; done: boolean }[];
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
          const allDone = event.target.checked;
          const todosToToggle = allDone ? activeTodos : completedTodos;
          for (const { text, done } of todosToToggle) {
            editTodo(currentUser, listName, text, {
              text,
              done: !done,
            });
          }
          onToggle(allDone ? "completed" : "active");
        }}
      />
      <label htmlFor="todo-mvc-toggle-all">Mark all as complete</label>
    </>
  );
}
