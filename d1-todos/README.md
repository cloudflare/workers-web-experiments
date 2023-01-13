# D1 Todos

<!-- TODO: add screenshot and description of the experiment here -->

## Local Setup

Install all the node module via `npm i` at the root (`d1-todos`) directory.

### Development

To start any app simply run: `npm run dev`.

A prompt will let you choose what application to run.

(Note: if you'll also want to make changes to the code present in the shared package, open a separate terminal and in the `shared` directory run either `npm run build` for a one-time change or `npm run build.watch` for the watch mode build).

### Deployment

In order to be able to deploy any of the applications you'll need to modify their `deploy` script by replacing the `CLOUDFLARE_ACCOUNT_ID` value with your own and by also choosing a different project name (you need a different project name because different pages projects cannot have the same name).

After that, to deploy any app simply run: `npm run deploy`

A prompt will let you choose what application to deploy (or all of them).

## Deployed applications

You can view the various demo applications at the following URLs:

- QwikCity: https://d1-todos-qwik-city.pages.dev

- Remix: https://d1-todos-remix.pages.dev

- SolidStart: https://d1-todos-solid-start.pages.dev

- SvelteKit: https://d1-todos-svelte-kit.pages.dev
