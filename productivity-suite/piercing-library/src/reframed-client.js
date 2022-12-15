const reframedContainer = window.parent.document.querySelector(
  __FRAGMENT_SELECTOR__
);
if (!reframedContainer) {
  console.error("Container element couldn't be found");
}

const reframedDocument = reframedContainer.ownerDocument;
const reframedWindow = reframedDocument.defaultView;

const htmlToReframe = [];
const nodesToRemove = [];

const tagBlockList = ["META", "TITLE"];

document.body.childNodes.forEach((node) => {
  if (node.nodeName === "SCRIPT") return;
  switch (node.nodeType) {
    case Node.ELEMENT_NODE: {
      if (tagBlockList.includes(node.nodeName)) break;

      htmlToReframe.push(node.outerHTML);
      break;
    }
    case Node.COMMENT_NODE: {
      htmlToReframe.push(`<!-- ${node.nodeValue} -->`);
      break;
    }
    case Node.TEXT_NODE: {
      htmlToReframe.push(node.wholeText);
      break;
    }
    default:
      console.error(
        "unsupported Node type found during reframing: ",
        node.nodeType,
        node.nodeName,
        node.nodeValue
      );
  }
  nodesToRemove.push(node);
});

nodesToRemove.forEach((node) => node.remove());
reframedContainer.innerHTML = htmlToReframe.join("");

document.addEventListener("DOMContentLoaded", () => {
  reframedContainer.insertAdjacentHTML(
    "beforeend",
    originalDocumentBody.innerHTML
  );
  originalDocumentBody.innerHTML = "";
});

const domCreateProperties = [
  "createAttributeNS",
  "createCDATASection",
  "createComment",
  "createDocumentFragment",
  "createElement",
  "createElementNS",
  "createEvent",
  "createExpression",
  "createNSResolver",
  "createNodeIterator",
  "createProcessingInstruction",
  "createRange",
  "createTextNode",
  "createTreeWalker",
];
for (const createProperty of domCreateProperties) {
  document[createProperty] = function reframedCreateFn() {
    return reframedDocument[createProperty].apply(reframedDocument, arguments);
  };
}

// methods to query for elements that can be retargeted into the reframedContainer
const domQueryProperties = [
  "querySelector",
  "querySelectorAll",
  "getElementsByClassName",
  "getElementsByTagName",
  "getElementsByTagNameNS",
];
for (const queryProperty of domQueryProperties) {
  document[queryProperty] = function reframedQueryFn() {
    return reframedContainer[queryProperty].apply(reframedContainer, arguments);
  };
}

// scope document.getElementById to execute just on the reframed container
document.getElementById = function reframedGetElementById(id) {
  return reframedContainer.querySelector(`#${id}`);
};

// scope document.getElementsByName to execute just on the reframed container
document.getElementsByName = function reframedGetElementsByName(name) {
  return reframedContainer.querySelectorAll(`[name="${name}"]`);
};

const domListenerProperties = ["addEventListener", "removeEventListener"];
for (const listenerProperty of domListenerProperties) {
  const originalDocumentFn = document[listenerProperty];
  document[listenerProperty] = function reframedListenerFn(eventName) {
    if (eventName === "DOMContentLoaded") {
      return originalDocumentFn.apply(document, arguments);
    }
    return reframedContainer[listenerProperty].apply(
      reframedContainer,
      arguments
    );
  };

  //const originalWindowFn = window[listenerProperty];
  window[listenerProperty] = function reframedListenerFn(eventName) {
    if (eventName === "popstate") {
      // the popstate event fires only in the iframe
      //Reflect.apply(originalWindowFn, window, arguments);
    }
    return reframedWindow[listenerProperty].apply(reframedWindow, arguments);
  };
}

Object.defineProperty(document, "activeElement", {
  get: () => {
    return reframedDocument.activeElement;
  },
});

const originalDocumentBody = document.body;
Object.defineProperty(document, "body", {
  get: () => {
    return reframedContainer;
  },
});

//const originalDocumentHead = document.head;
Object.defineProperty(document, "head", {
  get: () => {
    return reframedContainer;
  },
});

//const originalDocumentStylesheets = document.stylesheets;
Object.defineProperty(document, "stylesheets", {
  get: () => {
    return reframedDocument.stylesheets;
  },
});

// window.location is read-only and non-configurable, so we can't patch it
//
// additionally in a browsing context with one or more iframes, the history
// all frames contribute to the joint history: https://www.w3.org/TR/2011/WD-html5-20110525/history.html#joint-session-history
// this means that we need to be careful not to add duplicate entries to the
// history stack via pushState within the iframe as that would double the
// number of history entries that back/forward button would have to work through
//
// therefore we do the following:
// - intercept all history.pushState history.replaceState calls and replay
//   them in the main window
// - update the window.location within the iframe via history.replaceState
// - intercept window.addEventListener('popstate', ...) registration and forward it onto the main window
const originalHistoryFns = new Map();
["back", "forward", "go", "pushState", "replaceState"].forEach((prop) => {
  originalHistoryFns.set(prop, window.history[prop]);
  Object.defineProperty(window.history, prop, {
    get: () => {
      return function reframedHistoryGetter() {
        console.log(
          prop,
          "history length",
          reframedWindow.history.length,
          window.history.length
        );

        switch (prop) {
          case "pushState": {
            Reflect.apply(
              originalHistoryFns.get("replaceState"),
              window.history,
              arguments
            );
            reframedWindow.history.pushState(...arguments);
            break;
          }
          case "replaceState": {
            Reflect.apply(
              originalHistoryFns.get("replaceState"),
              window.history,
              arguments
            );
            reframedWindow.history.replaceState(...arguments);
            break;
          }
          default: {
            Reflect.apply(
              reframedWindow.history[prop],
              reframedWindow.history,
              arguments
            );
          }
        }
      };
    },
  });
});

// keep window.location and history.state in sync with the ones in the parent window
reframedWindow.addEventListener("popstate", () => {
  Reflect.apply(originalHistoryFns.get("replaceState"), window.history, [
    reframedWindow.history.state,
    null,
    reframedWindow.location.href,
  ]);
});

["length", "scrollRestoration", "state"].forEach((prop) => {
  Object.defineProperty(window.history, prop, {
    get: () => {
      return Reflect.get(reframedWindow.history, prop);
    },
  });
});

window.Node = reframedWindow.parent.Node;

// Patch elements so that `element instanceof Node` works
Object.getOwnPropertyNames(window).forEach((prop) => {
  if (
    window[prop] &&
    window[prop].prototype &&
    window[prop].prototype instanceof Node
  ) {
    window[prop] = reframedWindow.parent[prop];
  }
});

// Patch the MessageBus
const messageBusSymbol = Symbol.for("fragment-message-bus");
window[messageBusSymbol] = reframedWindow[messageBusSymbol];
