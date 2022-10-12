import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TodoLists.css";

export function TodoLists() {
  const [selectedList, setSelectedList] = useState<{
    name: string;
    todos: any[];
  } | null>();

  useEffect(() => {
    const match = /\/todos\/([^/]+)/.exec(window.location.pathname);
    if (match) {
      setSelectedList({
        name: decodeURIComponent(match[1]),
        todos: [],
      });
    }
  }, []);

  const navigate = useNavigate();

  const fragmentFetchParams = JSON.stringify({
    listName: selectedList?.name ?? null,
  });

  const updateSelectedList = (list: { name: string; todos: any[] }) => {
    // Set the selected list to null so to destroy the todo fragment
    setSelectedList(null);
    // After a short delay re-set the selected list, which triggers a refetch for the fragment
    setTimeout(() => {
      setSelectedList(list);
      navigate(`/todos/${list.name}`, { replace: true });
    }, 50);
  };

  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet
        fragment-id="todo-lists"
        fragment-fetch-params={fragmentFetchParams}
        onTodoListClick={(event: {
          detail: { list: { name: string; todos: any[] } };
        }) => updateSelectedList(event.detail.list)}
      />
      {selectedList && (
        <piercing-fragment-outlet
          fragment-id="todos"
          fragment-fetch-params={fragmentFetchParams}
        />
      )}
    </div>
  );
}
