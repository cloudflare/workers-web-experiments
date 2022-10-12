import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { addTodo, editTodo, removeTodo } from "./api";
import "./App.css";
import { EnvContext } from "./env";

enum TodoSelection {
  all = "all",
  active = "active",
  completed = "completed",
}

const App: React.FC<{
  todosListDetails?: { name: string; todos: { text: string; done: boolean }[] };
}> = ({ todosListDetails }) => {
  const [{ listName, todos }, setTodosListDetails] = useState({
    listName: todosListDetails?.name ?? null,
    todos: todosListDetails?.todos ?? [],
  });

  const [todosSelection, setTodosSelection] = useState<TodoSelection>(
    TodoSelection.all
  );

  const [newTodoDetails, setNewTodoDetails] = useState<{
    text: string;
    invalid: boolean;
  }>({ text: "", invalid: true });

  const { currentUser } = useContext(EnvContext);

  const activeTodos = todos.filter(({ done }) => !done);
  const completedTodos = todos.filter(({ done }) => done);

  const todosMap: Record<TodoSelection, { text: string; done: boolean }[]> = {
    [TodoSelection.all]: todos,
    [TodoSelection.active]: activeTodos,
    [TodoSelection.completed]: completedTodos,
  };

  const todosToShow = todosMap[todosSelection];

  const [editingTodoDetails, setEditingTodoDetails] = useState<{
    oldTodoText: string;
    newTodoText: string;
    invalid: boolean;
  } | null>(null);

  return (
    <>
      {currentUser && listName && (
        <section className="todoapp">
          <header className="header">
            <h2>{listName}</h2>
            <input
              className={`new-todo ${
                newTodoDetails.text !== "" && newTodoDetails.invalid
                  ? "invalid"
                  : ""
              }`}
              placeholder="What needs to be done?"
              autoFocus
              value={newTodoDetails.text}
              onInput={(event: ChangeEvent<HTMLInputElement>) => {
                const text = event.target.value;
                const trimmedText = text.trim();
                const invalid =
                  !trimmedText ||
                  !!todos.find((todo) => todo.text === trimmedText);
                setNewTodoDetails({
                  text,
                  invalid,
                });
              }}
              onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter" && !newTodoDetails.invalid) {
                  const trimmedNewTodoText = newTodoDetails.text.trim();
                  addTodo(currentUser, listName, trimmedNewTodoText);
                  setTodosListDetails({
                    listName,
                    todos: [
                      ...todos,
                      { text: trimmedNewTodoText, done: false },
                    ],
                  });
                  setNewTodoDetails({
                    text: "",
                    invalid: true,
                  });
                }
              }}
            />
          </header>
          {!!todos.length && (
            <>
              <section className="main">
                <input
                  id="toggle-all"
                  className="toggle-all"
                  type="checkbox"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const allDone = event.target.checked;
                    const todosToToggle = allDone
                      ? todosMap[TodoSelection.active]
                      : todosMap[TodoSelection.completed];
                    for (const { text, done } of todosToToggle) {
                      editTodo(currentUser, listName, text, {
                        text,
                        done: !done,
                      });
                    }
                    setTodosListDetails({
                      listName,
                      todos: todos.map(({ text }) => ({ text, done: allDone })),
                    });
                  }}
                />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul className="todo-list">
                  {todosToShow.map(({ text, done }) => (
                    <li
                      key={text}
                      className={`${done ? "completed" : ""} ${
                        editingTodoDetails?.oldTodoText === text
                          ? "editing"
                          : ""
                      }`}
                    >
                      <div className="view">
                        <input
                          className="toggle"
                          type="checkbox"
                          checked={done}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const done = event.target.checked;
                            editTodo(currentUser, listName, text, {
                              text,
                              done,
                            });
                            setTodosListDetails({
                              listName,
                              todos: todos.map((todo) =>
                                todo.text !== text ? todo : { text, done }
                              ),
                            });
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
                          onClick={() => {
                            removeTodo(currentUser, listName, text);
                            setTodosListDetails({
                              listName,
                              todos: todos.filter((todo) => todo.text !== text),
                            });
                          }}
                        ></button>
                      </div>
                      {editingTodoDetails?.oldTodoText === text && (
                        <input
                          autoFocus
                          className={`edit ${
                            editingTodoDetails.invalid ? "invalid" : ""
                          }`}
                          value={editingTodoDetails.newTodoText}
                          onInput={(event: ChangeEvent<HTMLInputElement>) => {
                            const newTodoText = event.target.value;
                            const trimmedNewTodoText = newTodoText.trim();
                            const oldTodoText = editingTodoDetails.oldTodoText;
                            const invalid = !trimmedNewTodoText
                              ? true
                              : oldTodoText === trimmedNewTodoText
                              ? false
                              : !!todos.filter(
                                  ({ text }) => text === trimmedNewTodoText
                                ).length;
                            setEditingTodoDetails({
                              oldTodoText,
                              newTodoText,
                              invalid,
                            });
                          }}
                          onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (
                              event.key === "Enter" &&
                              !editingTodoDetails.invalid
                            ) {
                              const trimmedNewTodoText =
                                editingTodoDetails.newTodoText.trim();
                              editTodo(
                                currentUser,
                                listName,
                                editingTodoDetails.oldTodoText,
                                {
                                  text: trimmedNewTodoText,
                                  done,
                                }
                              );
                              setTodosListDetails({
                                listName,
                                todos: todos.map(({ text, done }) => ({
                                  text:
                                    text === editingTodoDetails.oldTodoText
                                      ? trimmedNewTodoText
                                      : text,
                                  done,
                                })),
                              });
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
              </section>
              <footer className="footer">
                <span className="todo-count">
                  <strong>{activeTodos.length}</strong> item
                  {activeTodos.length !== 1 ? "s" : ""} left
                </span>
                <ul className="filters">
                  {Object.values(TodoSelection).map((selection) => (
                    <li key={`selection-${selection}`}>
                      <button
                        className={
                          todosSelection === selection ? "selected" : ""
                        }
                        onClick={() => setTodosSelection(selection)}
                      >
                        {selection}
                      </button>
                    </li>
                  ))}
                </ul>
                {!!completedTodos.length && (
                  <button
                    className="clear-completed"
                    onClick={() => {
                      for (const completedTodo of todosMap[
                        TodoSelection.completed
                      ]) {
                        removeTodo(currentUser, listName, completedTodo.text);
                      }
                      setTodosListDetails({
                        listName,
                        todos: todos.filter(({ done }) => !done),
                      });
                    }}
                  >
                    Clear completed
                  </button>
                )}
              </footer>
            </>
          )}
        </section>
      )}
    </>
  );
};

export default App;
