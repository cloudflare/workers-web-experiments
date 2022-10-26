import { useContext, useState } from "react";
import { removeTodo, Todo, TodoList } from "shared";
import "./App.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ListOfTodos } from "./components/ListOfTodos";
import { ToggleAllTodosButton } from "./components/ToggleAllTodosButton";
import { EnvContext } from "./env";
import { TodoType } from "./todoType";

const App: React.FC<{
  todoList: TodoList | null;
}> = ({ todoList }) => {
  const listName = todoList?.name ?? null;

  const [todos, setTodos] = useState<Todo[]>(todoList?.todos ?? []);

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

  function handleNewTodoAdded(newTodoText: string) {
    setTodos([...todos, { text: newTodoText, completed: false }]);
  }

  function handleAllTodosToggled(to: "completed" | "active") {
    setTodos(
      todos.map(({ text }) => ({
        text,
        completed: to === "completed" ? true : false,
      }))
    );
  }

  function handleTodoEdited(oldTodoText: string, updatedTodo: Todo) {
    setTodos(
      todos.map((todo) => (todo.text === oldTodoText ? updatedTodo : todo))
    );
  }

  function handleTodoRemoval(removedTodoText: string) {
    setTodos(todos.filter((todo) => todo.text !== removedTodoText));
  }

  function clearCompletedTodos() {
    for (const completedTodo of todosMap[TodoType.completed]) {
      removeTodo(currentUser!, listName!, completedTodo.text);
    }
    setTodos(todos.filter(({ completed }) => !completed));
  }

  return (
    <div className="todo-mvc-wrapper">
      <section className="todo-mvc">
        <Header
          todos={todos}
          currentUser={currentUser}
          listName={listName}
          onNewTodoAdded={handleNewTodoAdded}
        />
        {!!todos.length && (
          <>
            <section>
              <ToggleAllTodosButton
                activeTodos={todosMap[TodoType.active]}
                completedTodos={todosMap[TodoType.completed]}
                currentUser={currentUser}
                listName={listName}
                onToggle={handleAllTodosToggled}
              />
              <ListOfTodos
                todos={todosToShow}
                currentUser={currentUser}
                listName={listName}
                onTodoEdited={handleTodoEdited}
                onTodoRemoved={handleTodoRemoval}
              />
            </section>
            <Footer
              numOfActiveTodos={activeTodos.length}
              numOfCompletedTodos={completedTodos.length}
              todosSelection={todosSelection}
              setTodosSelection={setTodosSelection}
              clearCompletedTodos={clearCompletedTodos}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default App;
