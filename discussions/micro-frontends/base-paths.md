# Micro-frontend asset paths

This document describes some of the challenges faced around routing requests to assets when working with micro-frontends.

## Independent deployment

One of the goals of micro-frontends is that they can be developed and deployed independently of other parts of the application (other micro-frontends and the container application).
To achieve this, assets (code, images, stylesheets, etc) and APIs that the micro-frontend needs should be deployed in tandem with the micro-frontend itself.

In our "fragment architecture", we achieve this by deploying each micro-frontend (fragment) to its own Cloudflare Worker.
This Worker is responsible for handling all requests relevant to the fragment.

- HTML - this is the server-side rendered HTML of the fragment that is to be combined with other fragments in the container application.
- Static assets - client-side JavaScript, CSS stylesheets, images, and so on, which are needed/referenced by the fragment.
- Data - in some cases it is helpful for the fragment worker to also be responsible for providing the client-side code with access to data.

This approach means that the fragment and its assets are easily kept in sync whenever the fragment is deployed.
It also means that in development there is no need to set up complex build processes to deploy assets separately.

## Asset paths

In theory each fragment should be accessible directly as a self-contained application via its Worker's URL.
This is what happens in the cloud-gallery demo:

- Main app: https://cloud-gallery.web-experiments.workers.dev/
  - Body fragment: https://cloud-gallery-body.web-experiments.workers.dev/
    - Filter fragment: https://cloud-gallery-filter.web-experiments.workers.dev/

When accessing a fragment directly, the paths to its assets can simply be referenced in the generated HTML using relative paths. For example the cloud-gallery "header" fragment shows the Cloudflare logo:

```html
<img alt="Cloudflare logo" src="/cf-logo.png" width="74" height="35" />
```

Here we do not need to provide the full URL scheme as the logo is served from the same domain as the fragment HTML, e.g.

```
https://cloud-gallery-header.web-experiments.workers.dev/cf-logo.png.
        ^^^^^^^^^^^^^^^^^^^^
```

The challenge comes when a fragment is being used within another application.
In this case, the fragment HTML is being returned as part of the container application, which is served from a different URL to the fragment, e.g. https://cloud-gallery.web-experiments.workers.dev/.
If the same HTML for the header image is returned then the browser will try to load the logo from the wrong URL, e.g.

```
https://cloud-gallery.web-experiments.workers.dev/cf-logo.png.
        ^^^^^^^^^^^^^
```

(Note the missing `header` from the domain name.)

What we need is to ensure that the path to the logo will result in the correct asset being accessed.
There are two general approaches:

1. Always use full absolute URLs for all assets (such as hosting on a CDN), so that asset requests go directly to the URL hosting the fragment (and its assets).
2. Delegate requests for assets through the Worker that is hosting the container application.

### Absolute asset URLs

On the face of it this seems like a reasonable approach, and it is not that different to traditional approaches where assets are uploaded to a separate CDN.
For this to work, it is important that each fragment has the appropriate CORS configuration, to allow cross-origin requests from the application domain to the fragment domain.
It is not enough to hard-code absolute paths into templates and code since this restricts deploying to different domains, which is especially relevant when the fragment is in development.
The challenge therefore is to ensure that whatever tooling is used (e.g. meta-framework) it can be configured to render HTML and client-side code with the appropriate absolute path to the fragment.
In practice this is not always straightforward, since many tools will only provide relative paths to assets rather than full absolute URLs.

### Delegating asset requests

Rather than asking the browser to make requests for assets directly to the fragment we could delegate the request through the container application's Worker.
This is particularly useful if, as in our cloud-gallery demo, the fragments are connected to the container application via [Cloudflare service bindings](https://developers.cloudflare.com/workers/platform/bindings/about-service-bindings/).
This avoids making real HTTP fetch requests between Workers.
For delegation to work, the paths for fragment assets must include some information that the container application's Worker can use to select the fragment to which the request should be delegated.
For example, we could use a path-prefix convention - if an asset such as `/logo.gif` needs to be served by the "header" fragment, then the request from the browser could be `/_fragment/header/logo.gif`.
This would result in a request to `https://cloud-gallery.web-experiments.workers.dev/_fragment/header/cf-logo.png`.
The container application Worker would parse the path to identify that this is an asset request for the `header` fragment and forward the request through to the `header` fragment Worker, possibly having stripped the `_fragment/header/` prefix.

## Configuring asset paths

Asset paths are only problematic if they are requested in the context of the container application rather than the micro-frontend.
For example the source of an image tag ( <img src="/images/logo.gif"> ) will have the wrong context if it was generated by a fragment (it would need to be something like <img src="https://cdn.mydomain.com/images/logo.gif"> or <img src="/_fragment/header/images/logo.gif"> ).
The primary places this can happen are:

- HTML elements that reference asset paths such as `img`, `link`, `a`, `style`, and `script`.
  This can include CSS `url()` paths that are referenced in inline styles.
- Dynamic JavaScript path references:
  - imports of code from a top level HTML `script` tag - these imports are made relative to the path of the HTML document;
  - runtime "fetches" of data from API endpoints.

There are other situations where a relative path is not problematic because the context is already set to the fragment:

- CSS `@imports` or `url()` references in stylesheets loaded from a fragment - these imports are made relative to the path of the stylesheet;
- Dynamic JavaScript `import()` expressions running in a script that was loaded from a fragment - these imports are made relative to the path of the script being run.

There are a few possible approaches to ensure that these assets are given the correct path.
Each of them requires configuration of build-time tooling or run-time code (or both).

- Configure the build tooling to set path to assets at build-time
- Configure the path to assets when server-side rendering
- Use some special token for the asset path in source and then add a build step / runtime configuration to replace it

### Build time base path prefixing

We can configure the build tooling to prefix all asset paths in generated HTML and JavaScript.
For example:

```ts
export default defineConfig({
  ...
  base: "/_fragment/todos/",
  ...
});
```

This is effective for ensuring that generated client side JS code is correctly prefixed; but it can miss asset paths that the build tooling is not aware of.
The build tooling can be made aware of asset paths if the developer ensures that they are accessed via ESM imports.
For example:

```ts
import "./App.css";
```

Paths to assets that are not known to the build tooling, such as image `src` tags, or dynamically generated import paths can be missed.

This approach does not allow for the asset path to be determined at runtime based on how a fragment is being used.
Since the path to assets may be different in each case, this can cause the fragment to work in only standalone or within the context of a container, but not both.

One solution to this is to actually host the assets at a prefixed path even when the fragment is standalone.
If the assets are always hosted at `/_fragment/todos/...` then the fragment can always reference these consistently wherever it is running.
This requires the prefix is unique across all container applications that use the fragment.

### Dynamic base path prefixing

Some frameworks, such as Qwik, allow the "base path" to be configured at runtime, when server-side rendering the HTML.
This approach is equivalent to the build-time configuration, but gives more flexibility to change the base path depending upon usage of the fragment.
When requesting a fragment's HTML a parameter could be added to the request specifying the asset path, which can be used when server-side rendering the HTML.
For example:

```ts
	const url = new URL(request.url);
	const fragmentBase = url.searchParams.get("base") ?? "/";
	renderToStream(RootNode, {
		...
		envData: { request, env, fragmentBase },
		base: fragmentBase + "build/",
	})
```

Here the Qwik `renderToStream()` function accepts a `base` property which it uses to ensure that paths to client-side JavaScript files are correct.
In the above example the `fragmentBase` is also added to the `envData`, which is then available via the `useEnvData()` hook in components to use when rendering asset paths in templates.

### Magic base-path token

If the framework does not provide a mechanism to resolve the base path at runtime, it might be possible to use a "magic token" (a unique string) for the base path to assets.
This string will appear in the built JavaScript and the rendered HTML.
The magic token can be replaced with the appropriate path at runtime on the server (in a Worker) when it is found in the generated HTML or JavaScript when it is served.

## What next?

As we discuss these approaches with application developers and framework maintainers, we hope to converge on one or more common approaches to solving these problems.
If you are interested in joining these conversations come chat with on our [web-research Discord channel](https://discord.com/channels/595317990191398933/1041751020340002907).
