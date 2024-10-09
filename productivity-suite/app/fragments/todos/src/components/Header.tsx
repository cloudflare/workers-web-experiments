import { ChangeEvent, useState } from "react";
import { addTodo, Todo } from "shared";
import "./Header.css";

export function Header({
  todos,
  currentUser,
  listName,
  onNewTodoAdded,
}: {
  todos: Todo[];
  currentUser: string;
  listName: string;
  onNewTodoAdded: (newTodoText: string) => void;
}) {
  const [newTodoDetails, setNewTodoDetails] = useState<{
    text: string;
    invalid: boolean;
  }>({ text: "", invalid: true });

  return (
    <header>
      <input
        className={`new-todo ${
          newTodoDetails.text !== "" && newTodoDetails.invalid ? "invalid" : ""
        }`}
        placeholder="What needs to be done?"
        autoFocus
        // Spellcheck set to false to work around a memory leak issue in chrome:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1410394
        spellCheck={false}
        value={newTodoDetails.text}
        onInput={(event: ChangeEvent<HTMLInputElement>) => {
          const text = event.target.value;
          const trimmedText = text.trim();
          const invalid =
            !trimmedText || !!todos.find((todo) => todo.text === trimmedText);
          setNewTodoDetails({
            text,
            invalid,
          });
        }}
        onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" && !newTodoDetails.invalid) {
            const trimmedNewTodoText = newTodoDetails.text.trim();
            addTodo(currentUser, listName, trimmedNewTodoText);
            onNewTodoAdded(trimmedNewTodoText);
            setNewTodoDetails({
              text: "",
              invalid: true,
            });
          }
        }}
      />
    </header>
  );
}
