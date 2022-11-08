# Limitations and Areas of Improvements

In this document we discuss various limitations and are of improvements either related to the Productivity Suite implementation or the piercing strategy as a whole.

## Pre Piercing Positioning

One of the basic challenges provided by the strategy consists in making the piercing operation unobtrusive and not jarring for the user.

In order to do so the fragments present before the application bootstraps (the ones included in the initial server-side rendered stream) need to be positioned as close as possible to their final location inside the legacy application.

We’ve accomplished this by setting pre-piercing styles to the fragments which absolutely position the fragments in the appropriate locations.

You can see the `prePiercingStyles` present in the `productivity-suite/app/legacy-app/src/worker/script.ts` file.

What these styles do is to place the fragments in the right position before the application bootstraps, and, since there are different media queries and dynamic contents in the legacy application, media queries needed to be added to these styles so that the fragments' vertical alignment can be accordingly adjusted.

This method is very manual and error prone, it doesn’t work well with different browser font-sizes and it is unlikely to produce pixel-perfect results for any screen resolution and window size.

An alternative solution that we’ve thought of consists in instead providing a means to add some scaffolding/placeholder html around the fragment so that such html can be styled to mimic the legacy app’s elements and their styles.

Such a method could provide a more robust positioning solution but it would also introduce new challenges which would need to be addressed, such as dx related concerns (e.g. how can the html be added in a simple way which doesn’t promote code duplication?) and issues related to dynamic content present in the legacy application (e.g. how can the scaffolding elements reflect the side of elements in the legacy application which sizes derive from dynamic content).
Although not fail proof this is a different avenue for the fragments positioning which would definitely be worth exploring and which could provide a nicer and more robust solution to the positioning issue.

## Side-Effectful Module Type Scripts

During our experimentations we’ve noticed that modern frameworks and toolings such as Vite and Solid, produce scripts that are included in the final document as type module scripts. This would not be an issue on its own but it is when such scripts contain side-effectful code that runs as soon as they are evaluated by the browser.
The problem being that browsers do not re-evaluate/run type module scripts when they are re-added to a page based on the fact that their code is already present and saved in memory.

In our experiment this has the negative effect of not re-running the side-effectful code when a fragment which was previously loaded is re-fetched and applied to the document. If those side effects needed to set up something related to the fragment’s view itself (as they often do) then the fragment can lose functionality and in many cases even become completely non-interactive.

The way in which we’ve moved around this issue in our demo application is to tweak the fragment’s building behaviors in such a way that side-effectful code present in such type module scripts would be wrapped into a function and exposed through the script itself as a default export (see for example the `addDefaultFnExportToBundle` Vite plugin in the `productivity-suite/app/fragments/todos/vite.config.client.ts` file). The outlet component (`productivity-suite/piercing-library/src/piercing-fragment-outlet.ts`) upon fetching a fragment would then try calling such default exported function so that all the necessary code would be run as needed.

This method requires the fragments’ authors to be in control and tweak the build application in order for its type module scripts to follow the required convention, this not only can be difficult and different for different technologies but can even sometimes be unfeasible in situations where complex and non configurable bundling solutions are in place.

## Fragments’ base paths

Our fragments are implemented and deployed as standalone applications, and as any other web application when they need to access assets that is done based on the base path of their url.

For example, if a web application is deployed at `https://www.example.com` and requires the `images/logo.png` asset (e.g. it includes such an HTML tag: `<img src=”images/logo.png” >`) the browser will try to fetch such asset from `https://www.example.com/images/logo.png`.

This is of course the correct behavior, but it is problematic for our strategy since when we use fragment content in the application we create a misalignment between the base paths (in our example above, the gateway worker would be the one receiving the `images/logo.png` request instead of the fragment worker itself and it wouldn’t know how to handle it).

We’ve thought of different solutions for this issues, which include:

- Always providing assets via external absolute paths (e.g. using CDNs)
- Modifying the HTML, JS and CSS imports at the fragment build time
- Using appropriate conventions so that the gateway worker can discern which asset belongs to which fragment and forwarding the requests to the proper workers

We haven’t had the need to use such assets in our demo’s fragments, so we haven’t yet specifically decided on a solution to this problem.

We will however need to address and decide on the best approach for this issue soon as it impacts not only this specific strategy but micro frontend fragment based applications in general.

## Current frameworks’ assumptions

During our experimentations we discovered that most modern frameworks, although compatible with fragments, can make different assumptions about the state and scope of ownership of the HTML document.

They can assume that all the rest of the document is populated solely by fragments implemented by the framework, that it is valid to manipulate the document itself and add variables to the global scope or that they will always be present in the page (not being dynamically added and removed).

Those assumptions are problematic when the fragments need to be very dynamic and self contained and can cause different types of unexpected behaviors and breakages.

Such dynamic use of fragments is not typical in modern application which is one of the leading causes as to why such wrong assumptions can be found in the wild.

Sometimes workarounds can be found but more often than not the frameworks themselves need to solve these types of issues in order for their fragment to be suitable for such use cases. We’ve worked with different frameworks’ authors showcasing these type of shortcomings, we’ve found solutions to some and workaround for others, overall we are very optimistic that as time goes by and micro frontend technologies become more prominent such assumptions will tend to decrease allowing for more easy and powerful adoptions of micro frontend and fragments usages.
