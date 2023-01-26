import type { Context } from "hono";
import type { Bindings, Environment } from "hono/dist/types/types";
import {
  blogPostUrl,
  getOrCreateSessionId,
  getTodos,
  stylesStr,
  generateSessionIdCookie,
} from "shared";
import { App } from "./app";
import { getTodosDb } from "./utils";
import type { HtmlEscapedString } from "hono/utils/html";

export async function serverSideRenderTodoApp(
  c: Context<string, Environment, unknown>,
  backendError?: string
) {
  const { sessionId, todos } = await loader(c.req, c.env);

  const styles = new String(`<style>${stylesStr}</style>`) as HtmlEscapedString;
  styles.isEscaped = true;

  const response = c.html(
    <html>
      <head>
        <title>D1 Todos Hono</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="public/favicon.ico" />
        {styles}
      </head>
      <header class="app-header">
        <a href="https://honojs.dev/" target="_blank" rel="noreferrer">
          <img src="public/hono-logo.png" alt="Hono logo" />
        </a>
      </header>
      <App todos={todos} backendError={backendError} />
      <footer class="app-footer">
        <span>
          D1 todos demo. For more details check out the{" "}
          <a href={blogPostUrl} target="_blank" rel="noreferrer">
            blog post
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48"
              width="48"
              viewBox="0 0 48 48"
            >
              <path d="M9.9 41q-1.2 0-2.05-.85Q7 39.3 7 38.1V9.9q0-1.2.85-2.05Q8.7 7 9.9 7h12.55v2.25H9.9q-.25 0-.45.2t-.2.45v28.2q0 .25.2.45t.45.2h28.2q.25 0 .45-.2t.2-.45V25.55H41V38.1q0 1.2-.85 2.05-.85.85-2.05.85Zm9.3-10.6-1.6-1.6L37.15 9.25H26.5V7H41v14.5h-2.25V10.9Z" />
            </svg>
          </a>
          .
        </span>
        <span class="copyright">&copy; 2023 Cloudflare.com</span>
      </footer>
    </html>
  );
  response.headers.append("Set-Cookie", generateSessionIdCookie(sessionId));
  return response;
}

async function loader(request: Request, env: Bindings) {
  const db = getTodosDb(env);
  const sessionId = await getOrCreateSessionId(request, db);
  const todos = await getTodos(db, sessionId);
  return {
    sessionId,
    todos,
  };
}
