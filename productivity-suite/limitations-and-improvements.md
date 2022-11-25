# Limitations and Areas of Improvements

In this document we discuss various limitations and possible improvements - either related to the Productivity Suite implementation or the piercing strategy as a whole.

## Pre Piercing Positioning

One of the basic challenges for the strategy is making the piercing operation unobtrusive and not jarring for the user.

In order to do so the pre-pierced fragments need to be positioned as close as possible to their final location inside the legacy application.

We’ve accomplished this by setting pre-piercing styles to the fragments which absolutely position the fragments in the appropriate locations.

You can see the `prePiercingStyles` present in the `productivity-suite/app/legacy-app/src/worker/script.ts` file.

What these styles do is to place the fragments in the right position before the application bootstraps. Since there are different media queries and dynamic contents in the legacy application, media queries need to be added to the pre-piecing styles so that the fragments' vertical alignment can be accordingly adjusted.

This method is very manual and error prone, it doesn’t work well with different browser font-sizes and it is unlikely to produce pixel-perfect results for any screen resolution and window size.

An alternative solution we considered is to add some scaffolding/placeholder HTML around the fragment, which can be styled to mimic the legacy app’s elements and their styles.

Such a method could provide a more robust positioning solution but it would also introduce new challenges which would need to be addressed, such as dx related concerns (e.g. how can the html be added in a simple way which doesn’t promote code duplication?) and issues related to dynamic content present in the legacy application (e.g. how can the scaffolding elements reflect the side of elements in the legacy application which sizes derive from dynamic content).
Although not foolproof, this is definitely be worth exploring, and which could provide a nicer and more robust solution to the positioning issue. It could also provide a way to show static placeholder content for the legacy app while it is loading.

## JavaScript module scripts with side-effects

We’ve noticed that many frameworks produce scripts that are included in the final document as Javascript module script. Such scripts (as for the specs) are only ever executed once, including any side-effects.

This is not normally an issue, but when we want to reload a fragment, that was previously unloaded, the side-effects are never re-executed. This can be a problem if the framework relies upon the side-effect to initialize the state of the fragment.

Our current workaround for this is to modify the build of the fragment's client-side code to wrap the side-effects in a function which is both called and exported:

```ts
function moduleFn() {
  // side-effectful code...
}
moduleFn();
export default moduleFn;
```

See the `addDefaultFnExportToBundle` Vite plugin in the `productivity-suite/app/fragments/todos/vite.config.client.ts` file.

When fetching a fragment, the fragment-outlet custom element (`productivity-suite/piercing-library/src/piercing-fragment-outlet.ts`) tries to call such a default exported function so that the side-effect code is re-executed.

This method requires the fragments’ authors to be in control and tweak the build application in order for its type module scripts to follow the required convention, this not only can be difficult and different for different technologies but can even sometimes be unfeasible in situations where complex and non configurable bundling solutions are in place.

## Fragments’ base paths

Our fragments are implemented and deployed as standalone applications, and as any other web application when they need to access assets that is done based on the base path of their url.

For example, if a web application is deployed at `https://www.example.com` and requires the `/images/logo.png` asset (e.g. it includes such an HTML tag: `<img src=”/images/logo.png”>`) the browser will try to fetch the asset from `https://www.example.com/images/logo.png`.

This is of course the correct behavior when accessing the fragment standalone.

This is problematic for our strategy since asset requests are proxied through the Gateway Worker, which expects the path to fragment assets to be prefixed with a path that identifies the fragment (e.g. `/_fragment/header/images/logo.png`. We need to ensure that the HTML that arrives at the browser includes these prefixes (or fragment base paths) whenever an asset is referenced.

Our current solution for generated JS is to modify the build (or render-time) configuration so the fragment generates HTML that prefixes the paths with an appropriate fragment base path. This approach has the downside of the fragment no longer working standalone, since in that case the assets are not actually hosted at the prefixed path.

There is a further issue, which we have not needed to address in this demo. A fragment can contain other type of assets such as images and stylesheets that are not controlled by the build process. These need to have their asset paths manually adjusted.

We’ve thought of different solutions for this issues, which include:

- Always providing assets via external absolute paths (e.g. using CDNs)
- Modifying the HTML, JS and CSS imports at the fragment build time
- Using appropriate conventions so that the gateway worker can discern which asset belongs to which fragment and forwarding the requests to the proper workers

This problem is not specific to our demo or even specific to fragment piercing. It will be a common problem for any micro-frontend architecture to address.

This issue is discussed more generally [here](../discussions/micro-frontends/base-paths.md).

## Current frameworks’ assumptions

During our experimentations we discovered that most modern frameworks, although compatible with fragments, can make different assumptions about the state and scope of ownership of the HTML document.

Such assumptions can include:

- all the rest of the document is populated solely by fragments implemented by the framework (no other JavaScript code, unrelated to the framework runs on on the page)
- it is valid to manipulate the document itself and add/edit variables in the global scope
- the fragments will always be present in the page (not being dynamically added and removed)

Those assumptions are problematic when the fragments need to be very dynamic and self contained and can cause different types of unexpected behaviors and breakages.

For example the last assumption listed is a very common and problematic one, causing issues with cleanly up/unloading fragments from the page and also initializing (or re-initializing) dynamically loaded fragments.

Such dynamic use of fragments is not typical in modern application which is one of the leading causes as to why such wrong assumptions can be found in the wild.

Sometimes workarounds can be found but more often than not the frameworks themselves need to solve these types of issues in order for their fragment to be suitable for such use cases. We’ve worked with different frameworks’ authors showcasing these type of shortcomings, we’ve found solutions to some and workaround for others, overall we are very optimistic that as time goes by and micro frontend technologies become more prominent such assumptions will tend to decrease allowing for more easy and powerful adoptions of micro frontend and fragments usages.
