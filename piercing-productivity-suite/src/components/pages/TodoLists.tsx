import "./TodoLists.css";

export function TodoLists() {
  return (
    <div className="todo-lists-page">
      <piercing-fragment-outlet
        fragment-id="todo-lists"
        onTodoListClick={({
          detail: { listName },
        }: {
          detail: { listName: string };
        }) => {
          alert(`${listName} list clicked`);
        }}
      />
      <piercing-fragment-outlet fragment-id="todos" />
    </div>
  );
}
