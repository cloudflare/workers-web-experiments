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
    oldTodo: Todo;
    newTodoText: string;
    invalid: boolean;
    dirty: boolean;
  } | null>(null);

  return (
    <ul className="todo-mvc-todos-list">
      {todos.map((todo) => (
        <TodoItem todo={todo} />
      ))}
    </ul>
  );

  function TodoItem({ todo }: { todo: Todo }): JSX.Element {
    async function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
      const completed = event.target.checked;
      const newTodoValue = { ...todo, completed };
      const success = await editTodo(
        currentUser,
        listName,
        todo.text,
        newTodoValue
      );
      if (success) {
        onTodoEdited(todo.text, newTodoValue);
      }
    }

    function handleTodoTextClick(): void {
      setTimeout(() =>
        setEditingTodoDetails({
          oldTodo: todo,
          newTodoText: todo.text,
          invalid: false,
          dirty: false,
        })
      );
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
      const newTodoText = event.target.value;
      const trimmedNewTodoText = newTodoText.trim();
      const invalid = !trimmedNewTodoText
        ? true
        : editingTodoDetails!.oldTodo.text === trimmedNewTodoText
        ? false
        : !!todos.filter(({ text }) => text === trimmedNewTodoText).length;
      setEditingTodoDetails({
        oldTodo: editingTodoDetails!.oldTodo,
        newTodoText,
        invalid,
        dirty: true,
      });
    }

    async function editTodoTextIfValid() {
      if (editingTodoDetails?.dirty && !editingTodoDetails?.invalid) {
        const trimmedNewTodoText = editingTodoDetails.newTodoText.trim();
        const updatedTodo = {
          text: trimmedNewTodoText,
          completed: editingTodoDetails.oldTodo.completed,
        };
        const success = await editTodo(
          currentUser,
          listName,
          editingTodoDetails.oldTodo.text,
          updatedTodo
        );
        if (success) {
          onTodoEdited(editingTodoDetails.oldTodo.text, updatedTodo);
        }
        setEditingTodoDetails(null);
      }
    }

    function handleInputKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") {
        editTodoTextIfValid();
      }
    }

    function handleInputBlur() {
      editTodoTextIfValid();
      setEditingTodoDetails(null);
    }

    async function handleTodoDeletion() {
      const success = await removeTodo(currentUser, listName, todo.text);
      if (success) {
        onTodoRemoved(todo.text);
      }
    }

    return (
      <li
        key={todo.text}
        className={`${todo.completed ? "completed" : ""} ${
          editingTodoDetails?.oldTodo.text === todo.text ? "editing" : ""
        }`}
      >
        <div className="view">
          <label
            className="hidden-label"
            htmlFor={`checkbox-toggle-${todo.text}`}
          >
            Toggle for {todo.text}
          </label>
          <input
            className="toggle"
            type="checkbox"
            id={`checkbox-toggle-${todo.text}`}
            checked={todo.completed}
            onChange={handleCheckboxChange}
          />
          <button className="todo-text" onClick={handleTodoTextClick}>
            {todo.text}
          </button>
          <button
            className="destroy"
            onClick={handleTodoDeletion}
            aria-label="delete todo"
          ></button>
        </div>
        {editingTodoDetails?.oldTodo?.text === todo.text && (
          <input
            autoFocus
            className={`edit ${editingTodoDetails.invalid ? "invalid" : ""}`}
            value={editingTodoDetails.newTodoText}
            onInput={handleInputChange}
            onKeyUp={handleInputKeyUp}
            onBlur={handleInputBlur}
          />
        )}
      </li>
    );
  }
}
