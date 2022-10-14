import { ChangeEvent, useState } from "react";
import { editTodo, removeTodo } from "shared";
import "./ListOfTodos.css";

export function ListOfTodos({
  todos,
  currentUser,
  listName,
  onTodoEdited,
  onTodoRemoved,
}: {
  todos: { text: string; done: boolean }[];
  currentUser: string;
  listName: string;
  onTodoEdited: (
    oldTodoText: string,
    updatedTodo: { text: string; done: boolean }
  ) => void;
  onTodoRemoved: (todoText: string) => void;
}) {
  const [editingTodoDetails, setEditingTodoDetails] = useState<{
    oldTodoText: string;
    newTodoText: string;
    invalid: boolean;
  } | null>(null);

  return (
    <ul className="todo-mvc-todos-list">
      {todos.map(({ text, done }) => (
        <li
          key={text}
          className={`${done ? "completed" : ""} ${
            editingTodoDetails?.oldTodoText === text ? "editing" : ""
          }`}
        >
          <div className="view">
            <input
              className="toggle"
              type="checkbox"
              checked={done}
              onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                const done = event.target.checked;
                const success = await editTodo(currentUser, listName, text, {
                  text,
                  done,
                });
                if (success) {
                  onTodoEdited(text, {
                    text,
                    done,
                  });
                }
              }}
            />
            <label
              onClick={() =>
                setEditingTodoDetails({
                  oldTodoText: text,
                  newTodoText: text,
                  invalid: false,
                })
              }
            >
              {text}
            </label>
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
                });
              }}
              onKeyUp={async (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter" && !editingTodoDetails.invalid) {
                  const trimmedNewTodoText =
                    editingTodoDetails.newTodoText.trim();
                  const updatedTodo = {
                    text: trimmedNewTodoText,
                    done,
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
