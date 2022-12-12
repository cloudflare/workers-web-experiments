# Legacy fragment placeholders

This folder is purely here to provide placeholder fragments in case the legacy app is being run
in isolation, not as part of a gateway worker application.

When the legacy app is running in isolation, it will render some `piercing-fragment-outlet` custom elements.
These automatically try to make a fetch request to get HTML containing a `piercing-fragment-host` custom element.
The fetch request is always similar to `/piercing-fragment/<fragment-id>`.
Normally the gateway worker would intercept these requests and forward them on to the appropriate fragment Worker.

By providing files here, the legacy application can return simple placeholder fragment that ensures that the rest
of the application can continue to work without all the gateway worker machinery.
This is really helpful when continuing to develop on the legacy app, since it makes the developer setup much simpler.
