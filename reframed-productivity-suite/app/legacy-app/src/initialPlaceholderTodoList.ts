import { TodoList } from "shared";

export const initialPlaceholderTodoList: TodoList = {
  name: "Your Important Tasks",
  todos: [
    {
      text: "Create Cloudflare account",
      completed: false,
    },
    {
      text: "Experience Cloudflare Workers",
      completed: false,
    },
    {
      text: "Read the Micro-Front-End Cloudflare blog posts",
      completed: true,
    },
    {
      text: "Help build a better Internet",
      completed: false,
    },
  ],
};
