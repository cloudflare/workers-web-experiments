<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";
  import type { ActionResult } from "@sveltejs/kit";
  import type { PageData } from './$types';
  import { saveSessionIdCookie, validateTodoText } from "shared";
  import 'shared/src/styles.css';

  export let data: PageData;

  export let form: ActionResult;

  let newTodo = '';
  let error = '';

  if (data.sessionId) {
    saveSessionIdCookie(data.sessionId);
  }

  if(form) {
    if(form.type === 'success' && form.data?.text) {
      newTodo = form.data.text;
    }
    if(form.type === 'error') {
      error = form.error;
    }
  }
</script>

<main class="todos-app">
    <h1>Todos</h1>
	<form method="post" action="?/add" use:enhance={() => ({result}) => {
            if(result?.type === 'success') {
                newTodo = '';
                error = '';
                invalidate('todos')
            }

            if(result?.type === 'error') {
                error = result?.error?.message ?? 'Invalid Todo Text';
            }
        }}>
			<div class="new-todo-input-form-control">
				<input
					class={!newTodo || validateTodoText(newTodo).valid ? "" : "invalid"}
					type="text"
					name="text"
					bind:value={newTodo}
				/>
				<button disabled={newTodo ? false : true}>
					add todo
				</button>
			</div>
        </form>
        {#if error}
            <p class="backend-error">{error}</p>
        {/if}
    <ul>
        {#each data.todos as { id, text, completed }}
            <li>
                <form method="post" action="?/edit" use:enhance={() => () => invalidate('todos')}>
                    <input hidden name="todo-id" readOnly value={id} />
                    <input hidden name="completed" readOnly value={`${!completed}`} />
					<button
						role="checkbox"
						aria-checked={completed}
						aria-label={text}
						class={`custom-checkbox ${completed ? "checked" : ""}`}
				  ></button>
                </form>
                <span class={completed ? "line-through" : ""}>{text}</span>
                <form method="post" action="?/delete" use:enhance={() => () => invalidate('todos')}>
                    <input hidden name="todo-id" readOnly value={id} />
					<button class="delete-btn" aria-label="delete"></button>
                </form>
            </li>
        {/each}
    </ul>
</main>