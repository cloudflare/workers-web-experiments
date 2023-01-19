import { getTodos } from "_tmpShared";
import { sessionId, tmpTodosD1Db } from "../../../_tmp";
import { createResponse } from "../../../api-utils";

export default async function handler(request: Request): Promise<Response> {
  const todos = await getTodos(tmpTodosD1Db, sessionId);
  return createResponse({
    todos,
  });
}
