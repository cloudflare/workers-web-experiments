import { getBus } from "piercing-library";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TodoLists.css";

export function TodoLists() {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const path = pathname.includes("%")
      ? decodeURIComponent(pathname)
      : pathname;
    const match = path.match(/^\/todos\/([^\/]+)$/);
    const listName = match?.[1];
    if (listName) {
      if (listName !== selectedListName) {
        setSelectedListName(listName);
        getBus(ref.current).dispatch("todo-list-selected", {
          name: listName,
          noNavigation: true,
        });
      }
    }
  }, [location]);

  useEffect(() => {
    if (ref.current) {
      return (
        getBus(ref.current).listen({
          eventName: "todo-list-selected",
          callback: ({
            name,
            noNavigation,
          }: {
            name: string;
            noNavigation: boolean;
          }) => {
            if (name !== selectedListName) {
              const previousNameNotProvided = !selectedListName;
              setSelectedListName(name);
              setTimeout(() => {
                if (!noNavigation) {
                  navigate(`/todos/${name}`, {
                    replace: previousNameNotProvided,
                  });
                }
              }, 1);
            }
          },
        }) ?? undefined
      );
    }
  }, [ref.current]);

  const navigate = useNavigate();

  return (
    <div className="todo-lists-page" ref={ref}>
      <piercing-fragment-outlet fragment-id="todo-lists" />
      <piercing-fragment-outlet fragment-id="todos" />
    </div>
  );
}
