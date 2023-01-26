import { v4 as uuidv4 } from "uuid";
import { parse } from "cookie";
import { addTodos } from "./todos";

const sessionIdCookieName = "d1TodosSessionId";

export async function getOrCreateSessionId(
  request: Request,
  TODOS_DB: D1Database
): Promise<string> {
  const existingSessionId = getSessionIdFromRequest(request);
  if (existingSessionId) {
    return existingSessionId;
  }
  const sessionId = uuidv4();

  await addTodos(TODOS_DB, sessionId, newSessionTodos);

  return sessionId;
}

export function getSessionIdFromRequest(request: Request): string | undefined {
  const cookie = parse(request.headers.get("cookie") ?? "");
  const sessionId = cookie[sessionIdCookieName];
  return sessionId;
}

const millisInAWeek = 6.048e8;
export function saveSessionIdCookie(sessionId: string) {
  if (typeof document === "undefined") return;

  document.cookie = generateSessionIdCookie(sessionId);
}

export function generateSessionIdCookie(sessionId: string) {
  const expirationDate = new Date(
    new Date().getTime() + millisInAWeek
  ).toUTCString();
  return `d1TodosSessionId=${sessionId}; expires=${expirationDate}; path=/`;
}

const newSessionTodos = [
  "Create D1 database",
  "Write Cloudflare Worker",
  "Deploy to the SuperCloud",
];
