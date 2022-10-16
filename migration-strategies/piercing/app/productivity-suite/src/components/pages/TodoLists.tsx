import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TodoLists.css";

export function TodoLists() {
  const [selectedListName, setSelectedListName] = useState<string | null>(null);

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

  const updateSelectedList = (list: { name: string; todos: any[] }) => {
    setShowTodos(false);
    setTimeout(() => {
      setShowTodos(true);
      updateSelectedListName(list.name);
    }, 50);
  };

  const handleListRenamed = (oldListName: string, newListName: string) => {
    if (selectedListName === oldListName) {
      updateSelectedListName(newListName);
    }
  };

  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet
        fragment-id="todo-lists"
        fragment-fetch-params={fragmentFetchParams}
        onTodoListSelected={(event: {
          detail: {
            list: { name: string; todos: any[] };
            initialListSelection?: boolean;
          };
        }) => updateSelectedList(event.detail.list)}
        onTodoListRenamed={(event: {
          detail: {
            oldListName: string;
            newListName: string;
          };
        }) =>
          handleListRenamed(event.detail.oldListName, event.detail.newListName)
        }
      />
      {showTodos && (
        <piercing-fragment-outlet
          fragment-id="todos"
          fragment-fetch-params={fragmentFetchParams}
        />
      )}
    </div>
  );
}
