# Productivity Suite Demo

![app](./app-screenshot.png)

This project demonstrates what we've called the "Migration Piercing Strategy", which consists in a strategy aimed to the incremental migration of a legacy application to a server side rendering model implemented at the edge via Cloudflare Workers.

To read more about it see the [_TITLE TBD_ blog post](https://blog.cloudflare.com/better-micro-frontends).

To view the application visit: https://productivity-suite.web-experiments.workers.dev.

## How to run the app locally

- Install the workspace:

  ```
  npm i
  ```

- Run the whole app for local development:
  ```
  npm start
  ```

---

The above script runs all the necessary processes and opens the browser to the specific port where the app is served.

Alternatively you can run all the processes manually in separate terminals in the following way:

- Build all the necessary packages:

  ```
  npm run build
  ```

  (if you want to work on the libraries you can go into `/piercing-library` and/or `/app/shared` and run `npm run build.watch` to have them build in watch mode)

- Serve the legacy app:

  ```
  cd app/legacy-app
  npm run dev.react
  npm run dev.worker (in a separate terminal)
  ```

- Serve the fragments:

  ```
  cd app/fragments/fragmentName
  npm run dev
  ```

  where `fragmentName` is `login`, `todo-lists` and `todos`

- Open the browser at: http://localhost:8987
