import "./TodoLists.css";

export function TodoLists() {
  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet fragment-id="todo-lists" />
      <div className="placeholder">todos go here</div>
    </div>
  );
}
