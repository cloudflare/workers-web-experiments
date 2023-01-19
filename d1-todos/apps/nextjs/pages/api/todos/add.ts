import { sessionId, tmpTodosD1Db } from "../../../_tmp";
import { validateTodoText } from "shared";
import { addTodo } from "../../../_tmpShared";
import { createResponse } from "../../../api-utils";

export default async function handler(request: Request): Promise<Response> {
  const { text } = (await request.json()) as { text: string };

  if (!text) {
    return createResponse(
      {
        success: false,
        errorMessage: "Todos can be empty",
      },
      400
    );
  }

  const textValidation = validateTodoText(text);
  if (!textValidation.valid) {
    return createResponse(
      {
        success: false,
        errorMessage: textValidation.reason,
      },
      400
    );
  }

  try {
    await addTodo(tmpTodosD1Db, sessionId, text);
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
