# Cloud Gallery demo

This project demonstrates how we can architect an application built from
a tree of "fragments", each independently deployed to Cloudflare Workers.

See it in action: https://cloud-gallery.web-experiments.workers.dev.
Read about it: https://blog.cloudflare.com/better-micro-frontends

## Installation

The project uses Wrangler running on Node.js.
Each fragment is inside an "npm workspace".
Use npm at the root of the repository to install the dependencies for all the workspaces in one go:

```sh
npm install
```

## Deployment

Run the npm `deploy` scripts to deploy the Workers.

```sh
npm run deploy
```

This script will deploy each of fragments to their Worker in the correct order to ensure dependencies are valid.

## Development

Use Wrangler in local dev mode to try out Workers locally when developing.
For example to run the `gallery` fragment locally:

```
npm start -w gallery
```

To open the web-page that points to the gallery fragment press `B`.

Note that if you want to run a fragment that contains other fragments, then it is best to start all the descendant fragments first in separate terminals.
For example if you want to run the `body` fragment, open three terminals and run:

**Terminal 1:**

```
npm start -w gallery
```

**Terminal 2:**

```
npm start -w filter
```

**Terminal 3:**

```
npm start -w body
```

To open the web-page that points to the body fragment press `B` in terminal 3.
