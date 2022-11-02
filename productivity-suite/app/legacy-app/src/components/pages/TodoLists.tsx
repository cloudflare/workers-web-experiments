import { getBus } from "piercing-library";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TodoLists.css";

export function TodoLists() {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const selectedListName =
      getBus().latestValue<{ name: string }>("todo-list-selected")?.name ??
      null;

    if (selectedListName && ref.current) {
      if (selectedListName !== selectedListName) {
        setSelectedListName(selectedListName);
        getBus(ref.current).dispatch("todo-list-selected", {
          name: selectedListName,
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
            if (listDetails?.name && listDetails.name !== selectedListName) {
              const previousNameNotProvided = !selectedListName;
              setSelectedListName(listDetails.name);
              if (!listDetails?.noNavigation) {
                navigate(`/todos/${listDetails.name}`, {
                  replace: previousNameNotProvided,
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
