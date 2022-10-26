import { getBus } from "piercing-library";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TodoList } from "shared";
import "./TodoLists.css";

export function TodoLists() {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);

  const [todoEnteringAnimation, setTodoEnteringAnimation] = useState<
    "previous" | "next" | undefined
  >();

  useEffect(() => {
    if (ref.current) {
      return getBus(ref.current).listen({
        eventName: "todo-list-selected",
        callback: ({ list }: { list: TodoList }) =>
          updateSelectedListName(list.name),
      });
    }
  }, [ref.current]);

  const navigate = useNavigate();

  function updateSelectedListName(newListName: string) {
    setSelectedListName(newListName);
    navigate(`/todos/${newListName}`, { replace: true });
  }

  return (
    <div className="todo-lists-page" ref={ref}>
      <piercing-fragment-outlet fragment-id="todo-lists" />
      <piercing-fragment-outlet
        className={`todos ${
          todoEnteringAnimation ? `todos-${todoEnteringAnimation}` : ""
        }`}
        fragment-id="todos"
      />
    </div>
  );
}
