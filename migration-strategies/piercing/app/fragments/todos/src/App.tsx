import { useContext, useState } from "react";
import { removeTodo } from "shared";
import "./App.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ListOfTodos } from "./components/ListOfTodos";
import { ToggleAllTodosButton } from "./components/ToggleAllTodosButton";
import { EnvContext } from "./env";
import { TodoType } from "./todoType";

const App: React.FC<{
  todosListDetails?: { name: string; todos: { text: string; done: boolean }[] };
}> = ({ todosListDetails }) => {
  const listName = todosListDetails?.name ?? null;

  const [todos, setTodos] = useState<{ text: string; done: boolean }[]>(
    todosListDetails?.todos ?? []
  );

  const [todosSelection, setTodosSelection] = useState<TodoType>(TodoType.all);

  const { currentUser } = useContext(EnvContext);

  const activeTodos = todos.filter(({ done }) => !done);
  const completedTodos = todos.filter(({ done }) => done);

  const todosMap: Record<TodoType, { text: string; done: boolean }[]> = {
    [TodoType.all]: todos,
    [TodoType.active]: activeTodos,
    [TodoType.completed]: completedTodos,
  };

  const todosToShow = todosMap[todosSelection];

  if (!currentUser || !listName) return <></>;

  return (
    <div className="todo-mvc-wrapper">
      <section className="todo-mvc">
        <Header
          todos={todos}
          currentUser={currentUser}
          listName={listName}
          onNewTodoAdded={(newTodoText: string) => {
            setTodos([...todos, { text: newTodoText, done: false }]);
          }}
        />
        {!!todos.length && (
          <>
            <section>
              <ToggleAllTodosButton
                activeTodos={todosMap[TodoType.active]}
                completedTodos={todosMap[TodoType.completed]}
                currentUser={currentUser}
                listName={listName}
                onToggle={(to) => {
                  setTodos(
                    todos.map(({ text }) => ({
                      text,
                      done: to === "completed" ? true : false,
                    }))
                  );
                }}
              />
              <ListOfTodos
                todos={todosToShow}
                currentUser={currentUser}
                listName={listName}
                onTodoEdited={(oldTodoText, updatedTodo) => {
                  setTodos(
                    todos.map((todo) =>
                      todo.text === oldTodoText ? updatedTodo : todo
                    )
                  );
                }}
                onTodoRemoved={(removedTodoText: string) => {
                  setTodos(
                    todos.filter((todo) => todo.text !== removedTodoText)
                  );
                }}
              />
            </section>
            <Footer
              numOfActiveTodos={activeTodos.length}
              numOfCompletedTodos={completedTodos.length}
              todosSelection={todosSelection}
              setTodosSelection={setTodosSelection}
              clearCompletedTodos={() => {
                for (const completedTodo of todosMap[TodoType.completed]) {
                  removeTodo(currentUser, listName, completedTodo.text);
                }
                setTodos(todos.filter(({ done }) => !done));
              }}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default App;
