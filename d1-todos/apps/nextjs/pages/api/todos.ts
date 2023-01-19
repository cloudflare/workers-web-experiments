import { addTodo, deleteTodo, editTodo, getTodos } from "_tmpShared";
import { sessionId, tmpTodosD1Db } from "../../_tmp";
import { validateTodoText } from "shared";

export default async function handler(request: Request): Promise<Response> {
  // Note: we are using the method here, we could have also just
  //       implemented different todo endpoints instead
  if (request.method === "GET") {
    return handleListTodos(request);
  }
  if (request.method === "POST") {
    return handleAddTodo(request);
  }
  if (request.method === "PATCH") {
    return handleEditTodo(request);
  }
  if (request.method === "DELETE") {
    return handleDeleteTodo(request);
  }

  throw new Error("Method not supported");
}

async function handleListTodos(request: Request): Promise<Response> {
  const todos = await getTodos(tmpTodosD1Db, sessionId);
  return createResponse({
    todos,
  });
}

async function handleAddTodo(request: Request): Promise<Response> {
  const { text } = (await request.json()) as { text: string };

  if (!text) {
    return createBadRequestResponse("Todos can't be empty");
  }

  const textValidation = validateTodoText(text);
  if (!textValidation.valid) {
    return createBadRequestResponse(textValidation.reason);
  }

  try {
    await addTodo(tmpTodosD1Db, sessionId, text);
  } catch {
    return createDbErrorResponse();
  }

  return createResponse({ success: true });
}

async function handleEditTodo(request: Request): Promise<Response> {
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
    await editTodo(tmpTodosD1Db, sessionId, todoId, completed);
  } catch {
    return createDbErrorResponse();
  }

  return createResponse({ success: true });
}

async function handleDeleteTodo(request: Request): Promise<Response> {
  const { todoId } = (await request.json()) as { todoId: string };

  if (!todoId) {
    return createBadRequestResponse("the id of the todo must be provided");
  }

  try {
    await deleteTodo(tmpTodosD1Db, sessionId, todoId);
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
