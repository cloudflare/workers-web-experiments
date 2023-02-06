export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export async function getTodos(
  TODOS_DB: D1Database,
  sessionId: string
): Promise<Todo[]> {
  const stmt = TODOS_DB.prepare(
    `SELECT * from TODOS WHERE sessionId = ?1;`
  ).bind(sessionId);
  const { results } = await stmt.all();

  const todos: Todo[] = (
    (results ?? []) as { id: string; text: string; completed: string }[]
  ).map(({ id, text, completed }) => ({
    id,
    text,
    completed: completed === "true",
  }));

  return todos;
}

export async function addTodo(
  TODOS_DB: D1Database,
  sessionId: string,
  text: string
): Promise<Todo> {
  const id = crypto.randomUUID();
  const newTodo: Todo = {
    id,
    text,
    completed: false,
  };

  const stmt = TODOS_DB.prepare(
    "INSERT INTO TODOS (id, text, completed, sessionId, date) VALUES (?1, ?2, 'false', ?3, ?4);"
  ).bind(id, text, sessionId, new Date().toISOString());
  await stmt.run();
  return newTodo;
}

export async function addTodos(
  TODOS_DB: D1Database,
  sessionId: string,
  texts: string[]
): Promise<Todo[]> {
  const newTodos: Todo[] = texts.map((text) => ({
    id: crypto.randomUUID(),
    text,
    completed: false,
  }));

  const { statement, values } = newTodos.reduce(
    ({ valueIdx, statement, values }, todo, arrayIdx, array) => ({
      statement: `${statement} (?${++valueIdx}, ?${++valueIdx} ,'false', ?1, ?2)${
        arrayIdx === array.length - 1 ? ";" : ","
      }`,
      valueIdx,
      values: [...values, todo.id, todo.text],
    }),
    {
      valueIdx: 2,
      statement:
        "INSERT INTO TODOS (id, text, completed, sessionId, date) VALUES",
      values: [sessionId, new Date().toISOString()],
    }
  );

  const stmt = TODOS_DB.prepare(statement).bind(...values);
  await stmt.run();

  return newTodos;
}

export async function editTodo(
  TODOS_DB: D1Database,
  sessionId: string,
  todoId: string,
  completed: boolean
): Promise<void> {
  const stmt = TODOS_DB.prepare(
    `UPDATE TODOS
         SET completed = ?1
         WHERE id = ?2 AND sessionId = ?3;`
  ).bind(`${completed}`, todoId, sessionId);
  await stmt.run();
}

export async function deleteTodo(
  TODOS_DB: D1Database,
  sessionId: string,
  todoId: string
): Promise<void> {
  const stmt = TODOS_DB.prepare(
    "DELETE FROM TODOS WHERE id = ?1 AND sessionId = ?2;"
  ).bind(todoId, sessionId);
  await stmt.run();
}

const todoTextInvalidReasons = {
  empty: "A todo can't be empty or contain only spaces",
  wrongFormat: "only letters, spaces and numbers are allowed",
} as const;
type TodoTextInvalidReasons = typeof todoTextInvalidReasons;
type TodoTextInvalidReason =
  TodoTextInvalidReasons[keyof TodoTextInvalidReasons];

export function validateTodoText(text: string):
  | {
      valid: true;
    }
  | {
      valid: false;
      reason: TodoTextInvalidReason;
    } {
  if (!text?.trim())
    return { valid: false, reason: todoTextInvalidReasons.empty };
  if (/[^a-zA-Z0-9 ]/.test(text)) {
    return {
      valid: false,
      reason: todoTextInvalidReasons.wrongFormat,
    };
  }
  return { valid: true };
}
