export type Todo = {
  text: string;
  completed: boolean;
};

export type TodoList = {
  name: string;
  todos: Todo[];
};
