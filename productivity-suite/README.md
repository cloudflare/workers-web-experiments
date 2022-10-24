# Productivity Suite Demo

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

Alternatively you can run all the processes manually in the following way:

- Build all the necessary packages:

  ```
  npm run build
  ```

  (if you want to work on the libraries you can go into `/piercing-library` and/or `/app/shared` and run `npm run build.watch` to have them build in watch mode)

- Run the legacy app:

  ```
  cd app/legacy-app
  npm run dev.react
  npm run dev.worker (in a separate terminal)
  ```

- Run the fragments:

  ```
  cd app/fragments/fragmentName
  npm run dev
  ```

  where `fragmentName` is `login`, `todo-lists` and `todos`

- Open the browser at: http://localhost:8987
