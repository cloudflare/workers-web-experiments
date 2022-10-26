# Multi-worker runner

A simple wrapper around the Wrangler programmatic API to run multiple collaborating Workers.

Assuming that all your workers live in a mono-repo, you can run this tool in the root of the mono-repo,
and tell it the name of the root Worker that you want to debug.

The tool will work out (from the wrangler.toml files) what the service-binding dependencies are (including transitory).
It then runs `unstable_dev` on all these workers.

## Try it

For example in this mono-repo we could do:

```
cd multi-runner
npm i
npx tsc
cd ../cloud-gallery
node ../multi-runner/lib/index.js cloud-gallery-body
```

This will run the `cloud-gallery-body`, `cloud-gallery-filter` and `cloud-gallery-gallery`,
and then print the URL that can be accessed to run the "body" fragment.

## Known issues

- The custom builds get run twice; the seconds seems unnecessary.
- The `--watch` flag on `unstable_dev` does not seem to work - changes to src files do not trigger new builds
- There are potential problems with running custom builds in the correct directory;
  currently the workaround is multi-runner changes the current working directory before running `unstable_dev`.
