import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { addTodo, editTodo, removeTodo } from "./api";
import "./App.css";
import { EnvContext } from "./env";

const App: React.FC<{
  todosListDetails?: { name: string; todos: { text: string; done: boolean }[] };
}> = ({ todosListDetails }) => {
  const [{ listName, todos }, setTodosListDetails] = useState({
    listName: todosListDetails?.name ?? null,
    todos: todosListDetails?.todos ?? [],
  });

  const [newTodoText, setNewTodoText] = useState("");

  const { currentUser } = useContext(EnvContext);

  return (
    <>
      {currentUser && listName && todos && (
        <div>
          <h3>{listName}</h3>
          <ul>
            {todos.map(({ text, done }) => (
              <li key={text}>
                <span>{text}</span>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                    const done = event.target.checked;
                    await editTodo(currentUser, listName, text, { text, done });
                    setTodosListDetails({
                      listName,
                      todos: todos.map((todo) =>
                        todo.text !== text ? todo : { text, done }
                      ),
                    });
                  }}
                />
                <button
                  onClick={async () => {
                    await removeTodo(currentUser, listName, text);
                    setTodosListDetails({
                      listName,
                      todos: todos.filter((todo) => todo.text !== text),
                    });
                  }}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          <form
            onSubmit={async (event: FormEvent) => {
              event.preventDefault();
              await addTodo(currentUser, listName, newTodoText);
              setTodosListDetails({
                listName,
                todos: [...todos, { text: newTodoText, done: false }],
              });
              setNewTodoText("");
            }}
          >
            <label htmlFor="new-todo"></label>
            <input
              id="new-todo"
              type="test"
              value={newTodoText}
              onInput={(event: ChangeEvent<HTMLInputElement>) => {
                setNewTodoText(event.target.value);
              }}
            />
            <button
              disabled={
                !newTodoText || todos.some(({ text }) => text === newTodoText)
              }
            >
              Add Todo
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default App;
