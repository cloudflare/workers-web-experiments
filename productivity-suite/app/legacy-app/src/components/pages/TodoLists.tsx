import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TodoList } from "shared";
import "./TodoLists.css";

export function TodoLists() {
  const [selectedListName, setSelectedListName] = useState<string | null>(null);

  const [todoEnteringAnimation, setTodoEnteringAnimation] = useState<
    "previous" | "next" | undefined
  >();
  const [showTodos, setShowTodos] = useState<boolean>(true);

  useEffect(() => {
    const match = /\/todos\/([^/]+)/.exec(window.location.pathname);
    if (match) {
      setSelectedListName(decodeURIComponent(match[1]));
    }
  }, []);

  const navigate = useNavigate();

  const fragmentFetchParams = selectedListName
    ? JSON.stringify({
        listName: selectedListName,
      })
    : "null";

  const updateSelectedListName = (newListName: string) => {
    setSelectedListName(newListName);
    navigate(`/todos/${newListName}`, { replace: true });
  };

  const updateSelectedList = (list: TodoList, which?: "previous" | "next") => {
    setShowTodos(false);
    setTodoEnteringAnimation(which);
    setTimeout(() => {
      setShowTodos(true);
      updateSelectedListName(list.name);
    }, 50);
    setTimeout(() => setTodoEnteringAnimation(undefined), 250);
  };

  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet
        fragment-id="todo-lists"
        fragment-fetch-params={fragmentFetchParams}
        onTodoListSelected={(event: {
          detail: {
            list: TodoList;
            which?: "previous" | "next";
          };
        }) => updateSelectedList(event.detail.list, event.detail.which)}
      />
      {showTodos && (
        <piercing-fragment-outlet
          className={`todos ${
            todoEnteringAnimation ? `todos-${todoEnteringAnimation}` : ""
          }`}
          fragment-id="todos"
          fragment-fetch-params={fragmentFetchParams}
        />
      )}
    </div>
  );
}
