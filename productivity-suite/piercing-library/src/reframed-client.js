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
  document[createProperty] = function reframedCreateFn(...args) {
    return reframedDocument[createProperty].apply(reframedDocument, args);
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
  document[queryProperty] = function reframedQueryFn(...args) {
    return reframedContainer[queryProperty].apply(reframedContainer, args);
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

  window[listenerProperty] = function reframedListenerFn(...args) {
    return reframedWindow[listenerProperty].apply(reframedWindow, args);
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

Object.defineProperty(document, "head", {
  get: () => {
    return reframedContainer;
  },
});

Object.defineProperty(document, "stylesheets", {
  get: () => {
    return reframedDocument.stylesheets;
  },
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
