import { useContext, useState } from "react";
import { removeTodo, Todo } from "shared";
import "./App.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ListOfTodos } from "./components/ListOfTodos";
import { ToggleAllTodosButton } from "./components/ToggleAllTodosButton";
import { EnvContext } from "./env";
import { TodoType } from "./todoType";

const App: React.FC<{
  todosListDetails?: { name: string; todos: Todo[] };
}> = ({ todosListDetails }) => {
  const listName = todosListDetails?.name ?? null;

  const [todos, setTodos] = useState<Todo[]>(todosListDetails?.todos ?? []);

  const [todosSelection, setTodosSelection] = useState<TodoType>(TodoType.all);

  const { currentUser } = useContext(EnvContext);

  const activeTodos = todos.filter(({ completed }) => !completed);
  const completedTodos = todos.filter(({ completed }) => completed);

  const todosMap: Record<TodoType, Todo[]> = {
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
            setTodos([...todos, { text: newTodoText, completed: false }]);
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
                      completed: to === "completed" ? true : false,
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
                setTodos(todos.filter(({ completed }) => !completed));
              }}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default App;
