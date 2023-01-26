# D1 Todos

<!-- TODO: add screenshot and description of the experiment here -->

## Local Setup

Install all the node module via `npm i` at the root (`d1-todos`) directory.

### Development

To start any app simply run: `npm run dev`.

A prompt will let you choose what application to run.

(Note: if you'll also want to make changes to the code present in the shared package, open a separate terminal and in the `shared` directory run either `npm run build` for a one-time change or `npm run build.watch` for the watch mode build).

### Deployment

In order to be able to deploy any of the applications you'll need to set up their name and provide your Cloudflare account id, you can do so by simply running `npm run deploy-setup` and following the instructions.

> Alternatively you can manually update the `deploy` scripts of the package.json files of each application.

> Note: you need to use project names different from the current onces since different pages projects cannot have the same names (and the current onces are already used by us).

After having set the id and project names, to deploy any app simply run: `npm run deploy`

A prompt will let you choose what application to deploy (or all of them).

## Deployed applications

You can view the various demo applications at the following URLs:

- QwikCity: https://d1-todos-qwik-city.pages.dev

- Remix: https://d1-todos-remix.pages.dev

- SolidStart: https://d1-todos-solid-start.pages.dev

- SvelteKit: https://d1-todos-svelte-kit.pages.dev

- Hono: https://d1-todos-hono.pages.dev
