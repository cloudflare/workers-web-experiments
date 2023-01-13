import { error, type Actions } from '@sveltejs/kit';
import {
	addTodo,
	deleteTodo,
	editTodo,
	getOrCreateSessionId,
	getSessionIdFromRequest,
	getTodos,
	validateTodoText,
	type Todo
} from 'shared';
import type { PageServerLoad } from './$types';
import 'shared/src/styles.css';

export const actions: Actions = {
	async add({ request, platform }) {
		const todosDb = getTodosDb(platform);
		const sessionId = getSessionId(request);
		const formData = await request.formData();
		const text = formData.get('text') as string;
		const textValidation = validateTodoText(text);
		if (textValidation.valid) {
			await runDbOperation(() => addTodo(todosDb, sessionId, text));
		} else {
			throw error(400, {
				message: textValidation.reason
			});
		}
	},
	async delete({ request, platform }) {
		const sessionId = getSessionId(request);
		const todosDb = getTodosDb(platform);
		const formData = await request.formData();
		const id = formData.get('todo-id') as string;
		await runDbOperation(() => deleteTodo(todosDb, sessionId, id));
	},
	async edit({ request, platform }) {
		const sessionId = getSessionId(request);
		const todosDb = getTodosDb(platform);
		const formData = await request.formData();
		const id = formData.get('todo-id') as string;
		const completed = (formData.get('completed') as string) === 'true';
		await runDbOperation(() => editTodo(todosDb, sessionId, id, completed));
	}
};

async function runDbOperation(fn: () => Promise<unknown>): Promise<void> {
	try {
		await fn();
	} catch {
		throw error(500, {
			message: 'DataBase Internal Error'
		});
	}
}

export const load: PageServerLoad = async ({ request, platform, depends }) => {
	depends('todos');

	let todos: Todo[] = [];

	const todosDb = getTodosDb(platform);
	const sessionId = await getOrCreateSessionId(request, todosDb);
	if (todosDb) {
		todos = await getTodos(todosDb, sessionId);
	}

	return {
		todos,
		sessionId
	};
};

function getTodosDb(platform: Readonly<App.Platform>): D1Database {
	const db = platform.env?.D1_TODOS_DB;
	platform;
	if (!db) {
		throw error(404, {
			message: `No binding found for the D1_TODOS_DB database`
		});
	}
	return db;
}

function getSessionId(request: Request): string {
	const sessionId = getSessionIdFromRequest(request);
	if (!sessionId) {
		throw error(400, {
			message: 'Session id not provided'
		});
	}
	return sessionId;
}
