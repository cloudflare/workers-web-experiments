import { sessionId } from "../../../_tmp";
import { deleteTodo } from "../../../_tmpShared";
import { createResponse } from "../../../api-utils";

export default async function handler(request: Request): Promise<Response> {
  const { todoId } = (await request.json()) as { todoId: string };

  if (!todoId) {
    return createResponse(
      {
        success: false,
        errorMessage: "the id of the todo must be provided",
      },
      400
    );
  }

  try {
    await deleteTodo(null, sessionId, todoId);
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
