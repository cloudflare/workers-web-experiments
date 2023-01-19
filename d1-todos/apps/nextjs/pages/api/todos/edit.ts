import { sessionId, tmpTodosD1Db } from "../../../_tmp";
import { editTodo } from "../../../_tmpShared";
import { createResponse } from "../../../api-utils";

export default async function handler(request: Request): Promise<Response> {
  const { todoId, completed } = (await request.json()) as {
    todoId: string;
    completed: boolean;
  };

  if (!todoId) {
    return createResponse(
      {
        success: false,
        errorMessage: "the id of the todo must be provided",
      },
      400
    );
  }

  if (completed === undefined) {
    return createResponse(
      {
        success: false,
        errorMessage: "the completed status for the todo must be provided",
      },
      400
    );
  }

  try {
    await editTodo(tmpTodosD1Db, sessionId, todoId, completed);
  } catch {
    return createResponse(
      {
        success: false,
        errorMessage: "DataBase Internal Error",
      },
      500
    );
  }

  return createResponse({ success: true });
}
