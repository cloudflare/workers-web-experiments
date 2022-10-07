import { useState } from "react";
import "./TodoLists.css";

export function TodoLists() {
  const [selectedList, setSelectedList] = useState<{
    name: string;
    todos: any[];
  }>();

  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet
        fragment-id="todo-lists"
        onTodoListClick={({
          detail: { list },
        }: {
          detail: { list: { name: string; todos: any[] } };
        }) => {
          setSelectedList(list);
        }}
      />
      {selectedList && <piercing-fragment-outlet fragment-id="todos" />}
    </div>
  );
}
