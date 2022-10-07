import "./TodoLists.css";

export function TodoLists() {
  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet fragment-id="todo-lists" />
      <piercing-fragment-outlet fragment-id="todos" />
    </div>
  );
}
