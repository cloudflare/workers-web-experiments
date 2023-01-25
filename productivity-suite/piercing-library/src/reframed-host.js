// Maps that allow us to keep track of registered fragments and their listeners.
// We use FunctionConstructor as a way to identify the origin of a registered listener and map it back to its fragment.
const fragmentRegistrationMap = new Map();
const fragmentListenerMap = new Map();

// monkey patch global addEventListner on window and document so that we can automatically unregister
// any listeners created from within a registered fragment.
const addEventListenerTargets = [window, document];
// const addEventListenerTargets = [Node.prototype];
for (const addEventListenerTarget of addEventListenerTargets) {
  const originalDocumentAddEventListener =
    addEventListenerTarget.addEventListener;
  addEventListenerTarget.addEventListener =
    function reframedHostAddEventListener(name, listener, options) {
      let listenerFnConstructor;
      if (listener.handleEvent) {
        listenerFnConstructor = listener.handleEvent.constructor;
      } else {
        listenerFnConstructor = listener.constructor;
      }

      const listenerFns = fragmentListenerMap.get(listenerFnConstructor);

      // if this listener comes from a registered fragment, then keep track of it so that we can unregister it
      if (listenerFns) {
        listenerFns.push({
          target: addEventListenerTarget,
          // target: this,
          name,
          listener,
          options,
        });
      }

      return originalDocumentAddEventListener.call(
        addEventListenerTarget,
        // this,
        name,
        listener,
        options
      );
    };
}

const reframedRegistrationSymbol = Symbol.for("reframedRegistration");

Reflect.set(
  window,
  reframedRegistrationSymbol,
  function reframedRegistration(fragmentId, clientFunctionConstructor) {
    fragmentRegistrationMap.set(fragmentId, clientFunctionConstructor);
    fragmentListenerMap.set(clientFunctionConstructor, []);
  }
);
