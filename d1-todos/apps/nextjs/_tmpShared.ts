/** This file mocks what the shared lib does using D1, it is being
 *  used here just temporarily until Nextjs can access the D1 bindings
 */

import { Todo } from "shared";

const firebaseBaseUrl =
  "https://firestore.googleapis.com/v1/projects/nextjs-d1-todos-tmp-db/databases/(default)/documents/todos";

type FirebaseDoc = {
  fields: {
    completed: {
      booleanValue: boolean;
    };
    text: {
      stringValue: string;
    };
    id: {
      stringValue: string;
    };
    sessionId: {
      stringValue: string;
    };
  };
};

export async function getTodos(
  _TODOS_DB: null,
  sessionId: string
): Promise<Todo[]> {
  return (
    (
      (await (await fetch(firebaseBaseUrl)).json()) as {
        documents: FirebaseDoc[];
      }
    ).documents ?? []
  )
    .filter((doc) => doc.fields.sessionId.stringValue === sessionId)
    .map((doc) => ({
      id: doc.fields.id.stringValue,
      text: doc.fields.text.stringValue,
      completed: doc.fields.completed.booleanValue,
    }));
}

export async function addTodo(
  TODOS_DB: null,
  sessionId: string,
  text: string
): Promise<Todo> {
  const id = `todo_${Math.round(Math.random() * 999999)}`;
  const newTodo: Todo = {
    id,
    text,
    completed: false,
  };

  await fetch(`${firebaseBaseUrl}/${id}`, {
    method: "POST",
    body: JSON.stringify({
      fields: {
        id: { stringValue: newTodo.id },
        text: { stringValue: newTodo.text },
        completed: { booleanValue: false },
        sessionId: { stringValue: sessionId },
      },
    }),
  });
  return newTodo;
}

export async function editTodo(
  TODOS_DB: null,
  sessionId: string,
  todoId: string,
  completed: boolean
): Promise<void> {
  await fetch(`${firebaseBaseUrl}/${todoId}?updateMask.fieldPaths=completed`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        id: { stringValue: todoId },
        completed: { booleanValue: completed },
      },
    }),
  });
}

export async function deleteTodo(
  TODOS_DB: null,
  sessionId: string,
  todoId: string
): Promise<void> {
  await fetch(`${firebaseBaseUrl}/${todoId}`, {
    method: "DELETE",
  });
}
