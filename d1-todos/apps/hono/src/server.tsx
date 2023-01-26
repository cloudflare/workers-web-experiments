import { Hono } from "hono";
import { Bindings } from "hono/dist/types/types";
import {
  addTodo,
  deleteTodo,
  editTodo,
  getSessionIdFromRequest,
  validateTodoText,
} from "shared";
import { serverSideRenderTodoApp } from "./index";
import { getTodosDb } from "./utils";

const app = new Hono();

app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req);
});

app.get("/*", async (c) => serverSideRenderTodoApp(c));

app.post("/*", async (c) => {
  let error: string | undefined;
  try {
    const sessionId = getSessionIdFromRequest(c.req);

    if (!sessionId) {
      throw new Error("to handle");
    }

    const formData = await c.req.formData();
    const action = formData.get("action");

    switch (action) {
      case "add":
        await handleAddTodo(c.env, formData, sessionId);
        break;
      case "edit":
        await handleEditTodo(c.env, formData, sessionId);
        break;
      case "delete":
        await handleDeleteTodo(c.env, formData, sessionId);
        break;
    }
  } catch (e) {
    const err = e as Error;
    error = err.message;
  }

  return serverSideRenderTodoApp(c, error);
});

async function handleAddTodo(
  env: Bindings,
  requestFormData: FormData,
  sessionId: string
): Promise<void> {
  const text = requestFormData.get("text") as string;

  if (!text) {
    throw new Error("Todos can't be empty");
  }

  const textValidation = validateTodoText(text);
  if (!textValidation.valid) {
    throw new Error(textValidation.reason);
  }

  try {
    const db = getTodosDb(env);
    await addTodo(db, sessionId, text);
  } catch {
    throw new Error("DataBase Internal Error");
  }
}

async function handleEditTodo(
  env: Bindings,
  requestFormData: FormData,
  sessionId: string
): Promise<void> {
  const todoId = requestFormData.get("todo-id");
  const completed = requestFormData.get("completed");

  if (!todoId) {
    throw new Error("the id of the todo must be provided");
  }

  if (!completed) {
    throw new Error("the completed status for the todo must be provided");
  }

  try {
    const db = getTodosDb(env);
    await editTodo(db, sessionId, todoId as string, completed === "true");
  } catch {
    throw new Error("DataBase Internal Error");
  }
}

async function handleDeleteTodo(
  env: Bindings,
  requestFormData: FormData,
  sessionId: string
): Promise<void> {
  const todoId = requestFormData.get("todo-id");

  if (!todoId) {
    throw new Error("the id of the todo must be provided");
  }

  try {
    const db = getTodosDb(env);
    await deleteTodo(db, sessionId, todoId as string);
  } catch {
    throw new Error("DataBase Internal Error");
  }
}

export default app;
