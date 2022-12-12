import { getBus } from "piercing-library";
import { MessageBus } from "piercing-library/dist/message-bus/message-bus";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TodoLists.css";

type TodoListSelectedEvent = {
  name: string;
};

export function TodoLists() {
  const location = useLocation();
  const navigate = useNavigate();
  const elementRef = useRef<HTMLDivElement>(null);
  const selectedListRef = useRef<string>();
  const busRef = useRef<MessageBus>();

  useEffect(() => {
    if (elementRef.current) {
      busRef.current = getBus(elementRef.current);
    }
  }, [elementRef]);

  useEffect(() => {
    if (busRef.current && selectedListRef.current === undefined) {
      const selectedListName =
        busRef.current.latestValue<TodoListSelectedEvent>(
          "todo-list-selected"
        )?.name;
      if (
        selectedListName !== undefined &&
        selectedListRef.current !== selectedListName
      ) {
        selectedListRef.current = selectedListName;
        document.head.title = `Todos: ${selectedListRef.current}`;
        navigate(`/todos/${selectedListRef.current}`);
      }
    }
  }, [busRef.current]);

  useEffect(() => {
    if (busRef.current) {
      const name = getListNameFromPath(location.pathname);
      if (name !== undefined && name !== selectedListRef.current) {
        selectedListRef.current = name;
        busRef.current.dispatch("todo-list-selected", {
          name,
        });
      }
    }
  }, [busRef, location.pathname]);

  useEffect(() => {
    if (busRef.current) {
      const remover = busRef.current.listen<TodoListSelectedEvent>(
        "todo-list-selected",
        (listEvent) => {
          if (listEvent.name && listEvent.name !== selectedListRef.current) {
            selectedListRef.current = listEvent.name;
            document.head.title = `Todos: ${selectedListRef.current}`;
            navigate(`/todos/${listEvent.name}`);
          }
        }
      );
      return remover;
    }
  }, [busRef]);

  return (
    <div className="todo-lists-page" ref={elementRef}>
      <piercing-fragment-outlet fragment-id="todo-lists" />
      <piercing-fragment-outlet fragment-id="todos" />
    </div>
  );
}

function getListNameFromPath(pathname: string) {
  const path = pathname.includes("%") ? decodeURIComponent(pathname) : pathname;
  const match = path.match(/^\/todos\/([^\/]+)$/);
  const listName = match?.[1];
  return listName;
}
