import {
  validateTodoText,
  getOrCreateSessionId,
  getTodos,
  addTodo,
  editTodo,
  deleteTodo,
} from "shared";
import { getTodosDb } from "utils";

export default async function handler(request: Request): Promise<Response> {
  const db = getTodosDb();
  const sessionId = await getOrCreateSessionId(request as Request, db);
  if (!sessionId) {
    return createBadRequestResponse("Session id not provided");
  }

  // Note: we are using the method here, we could have also just
  //       implemented different todo endpoints instead
  if (request.method === "GET") {
    return handleListTodos(request, sessionId);
  }
  if (request.method === "POST") {
    return handleAddTodo(request, sessionId);
  }
  if (request.method === "PATCH") {
    return handleEditTodo(request, sessionId);
  }
  if (request.method === "DELETE") {
    return handleDeleteTodo(request, sessionId);
  }

  throw new Error("Method not supported");
}

async function handleListTodos(
  request: Request,
  sessionId: string
): Promise<Response> {
  const db = getTodosDb();
  const todos = await getTodos(db, sessionId);
  return createResponse({
    todos,
  });
}

async function handleAddTodo(
  request: Request,
  sessionId: string
): Promise<Response> {
  const { text } = (await request.json()) as { text: string };

  if (!text) {
    return createBadRequestResponse("Todos can't be empty");
  }

  const textValidation = validateTodoText(text);
  if (!textValidation.valid) {
    return createBadRequestResponse(textValidation.reason);
  }

  try {
    const db = getTodosDb();
    await addTodo(db, sessionId, text);
  } catch {
    return createDbErrorResponse();
  }

  return createResponse({ success: true });
}

async function handleEditTodo(
  request: Request,
  sessionId: string
): Promise<Response> {
  const { todoId, completed } = (await request.json()) as {
    todoId: string;
    completed: boolean;
  };

  if (!todoId) {
    return createBadRequestResponse("the id of the todo must be provided");
  }

  if (completed === undefined) {
    return createBadRequestResponse(
      "the completed status for the todo must be provided"
    );
  }

  try {
    const db = getTodosDb();
    await editTodo(db, sessionId, todoId, completed);
  } catch {
    return createDbErrorResponse();
  }

  return createResponse({ success: true });
}

async function handleDeleteTodo(
  request: Request,
  sessionId: string
): Promise<Response> {
  const { todoId } = (await request.json()) as { todoId: string };

  if (!todoId) {
    return createBadRequestResponse("the id of the todo must be provided");
  }

  try {
    const db = getTodosDb();
    await deleteTodo(db, sessionId, todoId);
  } catch {
    return createDbErrorResponse();
  }

  return createResponse({ success: true });
}

function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
  });
}

function createBadRequestResponse(errorMessage: string) {
  return createResponse(
    {
      success: false,
      errorMessage,
    },
    400
  );
}

function createDbErrorResponse() {
  return createResponse(
    {
      success: false,
      errorMessage: "DataBase Internal Error",
    },
    500
  );
}
