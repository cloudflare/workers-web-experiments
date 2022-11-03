import { getBus } from "piercing-library";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TodoLists.css";

export function TodoLists() {
  const ref = useRef<HTMLDivElement>(null);
  const selectedListName = useRef<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const listName = getListNameFromPath(location.pathname);
    if (listName && ref.current) {
      if (listName !== selectedListName.current) {
        selectedListName.current = listName;
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
        getBus(ref.current).listen<{ name: string; noNavigation: boolean }>(
          "todo-list-selected",
          (listDetails) => {
            if (
              listDetails.name &&
              listDetails.name !== selectedListName.current
            ) {
              selectedListName.current = listDetails.name;
              if (!listDetails.noNavigation) {
                navigate(`/todos/${listDetails.name}`, {
                  replace: !getListNameFromPath(location.pathname),
                });
              }
            }
          }
        ) ?? undefined
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

function getListNameFromPath(pathname: string) {
  const path = pathname.includes("%") ? decodeURIComponent(pathname) : pathname;
  const match = path.match(/^\/todos\/([^\/]+)$/);
  const listName = match?.[1];
  return listName;
}
