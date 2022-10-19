import { ChangeEvent, useState } from "react";
import { editTodo, removeTodo, Todo } from "shared";
import "./ListOfTodos.css";

export function ListOfTodos({
  todos,
  currentUser,
  listName,
  onTodoEdited,
  onTodoRemoved,
}: {
  todos: Todo[];
  currentUser: string;
  listName: string;
  onTodoEdited: (oldTodoText: string, updatedTodo: Todo) => void;
  onTodoRemoved: (todoText: string) => void;
}) {
  const [editingTodoDetails, setEditingTodoDetails] = useState<{
    oldTodoText: string;
    newTodoText: string;
    invalid: boolean;
    dirty: boolean;
  } | null>(null);

  return (
    <ul className="todo-mvc-todos-list">
      {todos.map(({ text, completed }) => (
        <li
          key={text}
          className={`${completed ? "completed" : ""} ${
            editingTodoDetails?.oldTodoText === text ? "editing" : ""
          }`}
        >
          <div className="view">
            <label className="hidden-label" htmlFor={`checkbox-toggle-${text}`}>
              Toggle for {text}
            </label>
            <input
              className="toggle"
              type="checkbox"
              id={`checkbox-toggle-${text}`}
              checked={completed}
              onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                const completed = event.target.checked;
                const success = await editTodo(currentUser, listName, text, {
                  text,
                  completed,
                });
                if (success) {
                  onTodoEdited(text, {
                    text,
                    completed,
                  });
                }
              }}
            />
            <button
              className="todo-text"
              onClick={() =>
                setTimeout(() =>
                  setEditingTodoDetails({
                    oldTodoText: text,
                    newTodoText: text,
                    invalid: false,
                    dirty: false,
                  })
                )
              }
            >
              {text}
            </button>
            <button
              className="destroy"
              onClick={async () => {
                const success = await removeTodo(currentUser, listName, text);
                if (success) {
                  onTodoRemoved(text);
                }
              }}
            ></button>
          </div>
          {editingTodoDetails?.oldTodoText === text && (
            <input
              autoFocus
              className={`edit ${editingTodoDetails.invalid ? "invalid" : ""}`}
              value={editingTodoDetails.newTodoText}
              onInput={(event: ChangeEvent<HTMLInputElement>) => {
                const newTodoText = event.target.value;
                const trimmedNewTodoText = newTodoText.trim();
                const oldTodoText = editingTodoDetails.oldTodoText;
                const invalid = !trimmedNewTodoText
                  ? true
                  : oldTodoText === trimmedNewTodoText
                  ? false
                  : !!todos.filter(({ text }) => text === trimmedNewTodoText)
                      .length;
                setEditingTodoDetails({
                  oldTodoText,
                  newTodoText,
                  invalid,
                  dirty: true,
                });
              }}
              onKeyUp={async (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (
                  event.key === "Enter" &&
                  editingTodoDetails.dirty &&
                  !editingTodoDetails.invalid
                ) {
                  const trimmedNewTodoText =
                    editingTodoDetails.newTodoText.trim();
                  const updatedTodo = {
                    text: trimmedNewTodoText,
                    completed,
                  };
                  const success = await editTodo(
                    currentUser,
                    listName,
                    editingTodoDetails.oldTodoText,
                    updatedTodo
                  );
                  if (success) {
                    onTodoEdited(editingTodoDetails.oldTodoText, updatedTodo);
                  }
                  setEditingTodoDetails(null);
                }
              }}
              onBlur={() => {
                setEditingTodoDetails(null);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
