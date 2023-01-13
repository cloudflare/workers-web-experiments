var manifest = {
	"/*404": [
	{
		type: "script",
		href: "/assets/_...404_.9747f514.js"
	},
	{
		type: "script",
		href: "/assets/entry-client.497c086b.js"
	},
	{
		type: "style",
		href: "/assets/entry-client.455d0791.css"
	}
],
	"/": [
	{
		type: "script",
		href: "/assets/index.e36f25ff.js"
	},
	{
		type: "script",
		href: "/assets/entry-client.497c086b.js"
	},
	{
		type: "style",
		href: "/assets/entry-client.455d0791.css"
	}
],
	"entry-client": [
	{
		type: "script",
		href: "/assets/entry-client.497c086b.js"
	},
	{
		type: "style",
		href: "/assets/entry-client.455d0791.css"
	}
],
	"index.html": [
]
};

const ERROR = Symbol("error");
const BRANCH = Symbol("branch");
function castError(err) {
  if (err instanceof Error || typeof err === "string") return err;
  return new Error("Unknown error");
}
function handleError(err) {
  err = castError(err);
  const fns = lookup(Owner, ERROR);
  if (!fns) throw err;
  for (const f of fns) f(err);
}
const UNOWNED = {
  context: null,
  owner: null
};
let Owner = null;
function createRoot(fn, detachedOwner) {
  detachedOwner && (Owner = detachedOwner);
  const owner = Owner,
        root = fn.length === 0 ? UNOWNED : {
    context: null,
    owner
  };
  Owner = root;
  let result;
  try {
    result = fn(() => {});
  } catch (err) {
    handleError(err);
  } finally {
    Owner = owner;
  }
  return result;
}
function createSignal(value, options) {
  return [() => value, v => {
    return value = typeof v === "function" ? v(value) : v;
  }];
}
function createComputed(fn, value) {
  Owner = {
    owner: Owner,
    context: null
  };
  try {
    fn(value);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = Owner.owner;
  }
}
const createRenderEffect = createComputed;
function createMemo(fn, value) {
  Owner = {
    owner: Owner,
    context: null
  };
  let v;
  try {
    v = fn(value);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = Owner.owner;
  }
  return () => v;
}
function batch(fn) {
  return fn();
}
const untrack = batch;
function on(deps, fn, options = {}) {
  const isArray = Array.isArray(deps);
  const defer = options.defer;
  return () => {
    if (defer) return undefined;
    let value;
    if (isArray) {
      value = [];
      for (let i = 0; i < deps.length; i++) value.push(deps[i]());
    } else value = deps();
    return fn(value);
  };
}
function onCleanup(fn) {
  let node;
  if (Owner && (node = lookup(Owner, BRANCH))) {
    if (!node.cleanups) node.cleanups = [fn];else node.cleanups.push(fn);
  }
  return fn;
}
function cleanNode(node) {
  if (node.cleanups) {
    for (let i = 0; i < node.cleanups.length; i++) node.cleanups[i]();
    node.cleanups = undefined;
  }
}
function onError(fn) {
  if (Owner) {
    if (Owner.context === null) Owner.context = {
      [ERROR]: [fn]
    };else if (!Owner.context[ERROR]) Owner.context[ERROR] = [fn];else Owner.context[ERROR].push(fn);
  }
}
function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}
function useContext(context) {
  let ctx;
  return (ctx = lookup(Owner, context.id)) !== undefined ? ctx : context.defaultValue;
}
function getOwner() {
  return Owner;
}
function children(fn) {
  const memo = createMemo(() => resolveChildren(fn()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function runWithOwner(o, fn) {
  const prev = Owner;
  Owner = o;
  try {
    return fn();
  } catch (err) {
    handleError(err);
  } finally {
    Owner = prev;
  }
}
function lookup(owner, key) {
  return owner ? owner.context && owner.context[key] !== undefined ? owner.context[key] : lookup(owner.owner, key) : undefined;
}
function resolveChildren(children) {
  if (typeof children === "function" && !children.length) return resolveChildren(children());
  if (Array.isArray(children)) {
    const results = [];
    for (let i = 0; i < children.length; i++) {
      const result = resolveChildren(children[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children;
}
function createProvider(id) {
  return function provider(props) {
    return createMemo(() => {
      Owner.context = {
        [id]: props.value
      };
      return children(() => props.children);
    });
  };
}

function resolveSSRNode$1(node) {
  const t = typeof node;
  if (t === "string") return node;
  if (node == null || t === "boolean") return "";
  if (Array.isArray(node)) {
    let mapped = "";
    for (let i = 0, len = node.length; i < len; i++) mapped += resolveSSRNode$1(node[i]);
    return mapped;
  }
  if (t === "object") return node.t;
  if (t === "function") return resolveSSRNode$1(node());
  return String(node);
}
const sharedConfig = {};
function setHydrateContext(context) {
  sharedConfig.context = context;
}
function nextHydrateContext() {
  return sharedConfig.context ? { ...sharedConfig.context,
    id: `${sharedConfig.context.id}${sharedConfig.context.count++}-`,
    count: 0
  } : undefined;
}
function createUniqueId() {
  const ctx = sharedConfig.context;
  if (!ctx) throw new Error(`createUniqueId cannot be used under non-hydrating context`);
  return `${ctx.id}${ctx.count++}`;
}
function createComponent(Comp, props) {
  if (sharedConfig.context && !sharedConfig.context.noHydrate) {
    const c = sharedConfig.context;
    setHydrateContext(nextHydrateContext());
    const r = Comp(props || {});
    setHydrateContext(c);
    return r;
  }
  return Comp(props || {});
}
function mergeProps(...sources) {
  const target = {};
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];
    if (typeof source === "function") source = source();
    if (source) {
      const descriptors = Object.getOwnPropertyDescriptors(source);
      for (const key in descriptors) {
        if (key in target) continue;
        Object.defineProperty(target, key, {
          enumerable: true,
          get() {
            for (let i = sources.length - 1; i >= 0; i--) {
              let s = sources[i] || {};
              if (typeof s === "function") s = s();
              const v = s[key];
              if (v !== undefined) return v;
            }
          }
        });
      }
    }
  }
  return target;
}
function splitProps(props, ...keys) {
  const descriptors = Object.getOwnPropertyDescriptors(props),
        split = k => {
    const clone = {};
    for (let i = 0; i < k.length; i++) {
      const key = k[i];
      if (descriptors[key]) {
        Object.defineProperty(clone, key, descriptors[key]);
        delete descriptors[key];
      }
    }
    return clone;
  };
  return keys.map(split).concat(split(Object.keys(descriptors)));
}
function simpleMap(props, wrap) {
  const list = props.each || [],
        len = list.length,
        fn = props.children;
  if (len) {
    let mapped = Array(len);
    for (let i = 0; i < len; i++) mapped[i] = wrap(fn, list[i], i);
    return mapped;
  }
  return props.fallback;
}
function For(props) {
  return simpleMap(props, (fn, item, i) => fn(item, () => i));
}
function Show(props) {
  let c;
  return props.when ? typeof (c = props.children) === "function" ? c(props.when) : c : props.fallback || "";
}
function ErrorBoundary$1(props) {
  let error,
      res,
      clean,
      sync = true;
  const ctx = sharedConfig.context;
  const id = ctx.id + ctx.count;
  function displayFallback() {
    cleanNode(clean);
    ctx.writeResource(id, error, true);
    setHydrateContext({ ...ctx,
      count: 0
    });
    const f = props.fallback;
    return typeof f === "function" && f.length ? f(error, () => {}) : f;
  }
  onError(err => {
    error = err;
    !sync && ctx.replace("e" + id, displayFallback);
    sync = true;
  });
  onCleanup(() => cleanNode(clean));
  createMemo(() => {
    Owner.context = {
      [BRANCH]: clean = {}
    };
    return res = props.children;
  });
  if (error) return displayFallback();
  sync = false;
  return {
    t: `<!e${id}>${resolveSSRNode$1(res)}<!/e${id}>`
  };
}
const SuspenseContext = createContext();
let resourceContext = null;
function createResource(source, fetcher, options = {}) {
  if (arguments.length === 2) {
    if (typeof fetcher === "object") {
      options = fetcher;
      fetcher = source;
      source = true;
    }
  } else if (arguments.length === 1) {
    fetcher = source;
    source = true;
  }
  const contexts = new Set();
  const id = sharedConfig.context.id + sharedConfig.context.count++;
  let resource = {};
  let value = options.storage ? options.storage(options.initialValue)[0]() : options.initialValue;
  let p;
  let error;
  if (sharedConfig.context.async && options.ssrLoadFrom !== "initial") {
    resource = sharedConfig.context.resources[id] || (sharedConfig.context.resources[id] = {});
    if (resource.ref) {
      if (!resource.data && !resource.ref[0].loading && !resource.ref[0].error) resource.ref[1].refetch();
      return resource.ref;
    }
  }
  const read = () => {
    if (error) throw error;
    if (resourceContext && p) resourceContext.push(p);
    const resolved = options.ssrLoadFrom !== "initial" && sharedConfig.context.async && "data" in sharedConfig.context.resources[id];
    if (!resolved && read.loading) {
      const ctx = useContext(SuspenseContext);
      if (ctx) {
        ctx.resources.set(id, read);
        contexts.add(ctx);
      }
    }
    return resolved ? sharedConfig.context.resources[id].data : value;
  };
  read.loading = false;
  read.error = undefined;
  read.state = "initialValue" in options ? "resolved" : "unresolved";
  Object.defineProperty(read, "latest", {
    get() {
      return read();
    }
  });
  function load() {
    const ctx = sharedConfig.context;
    if (!ctx.async) return read.loading = !!(typeof source === "function" ? source() : source);
    if (ctx.resources && id in ctx.resources && "data" in ctx.resources[id]) {
      value = ctx.resources[id].data;
      return;
    }
    resourceContext = [];
    const lookup = typeof source === "function" ? source() : source;
    if (resourceContext.length) {
      p = Promise.all(resourceContext).then(() => fetcher(source(), {
        value
      }));
    }
    resourceContext = null;
    if (!p) {
      if (lookup == null || lookup === false) return;
      p = fetcher(lookup, {
        value
      });
    }
    if (p != undefined && typeof p === "object" && "then" in p) {
      read.loading = true;
      read.state = "pending";
      if (ctx.writeResource) ctx.writeResource(id, p, undefined, options.deferStream);
      return p.then(res => {
        read.loading = false;
        read.state = "resolved";
        ctx.resources[id].data = res;
        p = null;
        notifySuspense(contexts);
        return res;
      }).catch(err => {
        read.loading = false;
        read.state = "errored";
        read.error = error = castError(err);
        p = null;
        notifySuspense(contexts);
      });
    }
    ctx.resources[id].data = p;
    if (ctx.writeResource) ctx.writeResource(id, p);
    p = null;
    return ctx.resources[id].data;
  }
  if (options.ssrLoadFrom !== "initial") load();
  return resource.ref = [read, {
    refetch: load,
    mutate: v => value = v
  }];
}
function suspenseComplete(c) {
  for (const r of c.resources.values()) {
    if (r.loading) return false;
  }
  return true;
}
function notifySuspense(contexts) {
  for (const c of contexts) {
    if (suspenseComplete(c)) c.completed();
  }
  contexts.clear();
}
function startTransition(fn) {
  fn();
}
function Suspense(props) {
  let done;
  let clean;
  const ctx = sharedConfig.context;
  const id = ctx.id + ctx.count;
  const o = Owner;
  if (o) {
    if (o.context) o.context[BRANCH] = clean = {};else o.context = {
      [BRANCH]: clean = {}
    };
  }
  const value = ctx.suspense[id] || (ctx.suspense[id] = {
    resources: new Map(),
    completed: () => {
      const res = runSuspense();
      if (suspenseComplete(value)) {
        done(resolveSSRNode$1(res));
      }
    }
  });
  function runSuspense() {
    setHydrateContext({ ...ctx,
      count: 0
    });
    return runWithOwner(o, () => {
      return createComponent(SuspenseContext.Provider, {
        value,
        get children() {
          clean && cleanNode(clean);
          return props.children;
        }
      });
    });
  }
  const res = runSuspense();
  if (suspenseComplete(value)) return res;
  onError(err => {
    if (!done || !done(undefined, err)) {
      if (o) runWithOwner(o.owner, () => {
        throw err;
      });else throw err;
    }
  });
  done = ctx.async ? ctx.registerFragment(id) : undefined;
  if (ctx.async) {
    setHydrateContext({ ...ctx,
      count: 0,
      id: ctx.id + "0.f",
      noHydrate: true
    });
    const res = {
      t: `<span id="pl-${id}">${resolveSSRNode$1(props.fallback)}</span>`
    };
    setHydrateContext(ctx);
    return res;
  }
  setHydrateContext({ ...ctx,
    count: 0,
    id: ctx.id + "0.f"
  });
  ctx.writeResource(id, "$$f");
  return props.fallback;
}

const booleans = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"];
const BooleanAttributes = /*#__PURE__*/new Set(booleans);
/*#__PURE__*/new Set(["className", "value", "readOnly", "formNoValidate", "isMap", "noModule", "playsInline", ...booleans]);
const ChildProperties = /*#__PURE__*/new Set(["innerHTML", "textContent", "innerText", "children"]);
const Aliases = /*#__PURE__*/Object.assign(Object.create(null), {
  className: "class",
  htmlFor: "for"
});

const {
  hasOwnProperty
} = Object.prototype;
const REF_START_CHARS = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_";
const REF_START_CHARS_LEN = REF_START_CHARS.length;
const REF_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_";
const REF_CHARS_LEN = REF_CHARS.length;
const STACK = [];
const BUFFER = [""];
let ASSIGNMENTS = new Map();
let INDEX_OR_REF = new WeakMap();
let REF_COUNT = 0;
BUFFER.pop();
function stringify(root) {
  if (writeProp(root, "")) {
    let result = BUFFER[0];
    for (let i = 1, len = BUFFER.length; i < len; i++) {
      result += BUFFER[i];
    }
    if (REF_COUNT) {
      if (ASSIGNMENTS.size) {
        let ref = INDEX_OR_REF.get(root);
        if (typeof ref === "number") {
          ref = toRefParam(REF_COUNT++);
          result = ref + "=" + result;
        }
        for (const [assignmentRef, assignments] of ASSIGNMENTS) {
          result += ";" + assignments + assignmentRef;
        }
        result += ";return " + ref;
        ASSIGNMENTS = new Map();
      } else {
        result = "return " + result;
      }
      result = "(function(" + refParamsString() + "){" + result + "}())";
    } else if (root && root.constructor === Object) {
      result = "(" + result + ")";
    }
    BUFFER.length = 0;
    INDEX_OR_REF = new WeakMap();
    return result;
  }
  return "void 0";
}
function writeProp(cur, accessor) {
  switch (typeof cur) {
    case "string":
      BUFFER.push(quote(cur, 0));
      break;
    case "number":
      BUFFER.push(cur + "");
      break;
    case "boolean":
      BUFFER.push(cur ? "!0" : "!1");
      break;
    case "object":
      if (cur === null) {
        BUFFER.push("null");
      } else {
        const ref = getRef(cur, accessor);
        switch (ref) {
          case true:
            return false;
          case false:
            switch (cur.constructor) {
              case Object:
                writeObject(cur);
                break;
              case Array:
                writeArray(cur);
                break;
              case Date:
                BUFFER.push('new Date("' + cur.toISOString() + '")');
                break;
              case RegExp:
                BUFFER.push(cur + "");
                break;
              case Map:
                BUFFER.push("new Map(");
                writeArray(Array.from(cur));
                BUFFER.push(")");
                break;
              case Set:
                BUFFER.push("new Set(");
                writeArray(Array.from(cur));
                BUFFER.push(")");
                break;
              case undefined:
                BUFFER.push("Object.assign(Object.create(null),");
                writeObject(cur);
                BUFFER.push(")");
                break;
              default:
                return false;
            }
            break;
          default:
            BUFFER.push(ref);
            break;
        }
      }
      break;
    default:
      return false;
  }
  return true;
}
function writeObject(obj) {
  let sep = "{";
  STACK.push(obj);
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      const escapedKey = toObjectKey(key);
      BUFFER.push(sep + escapedKey + ":");
      if (writeProp(val, escapedKey)) {
        sep = ",";
      } else {
        BUFFER.pop();
      }
    }
  }
  if (sep === "{") {
    BUFFER.push("{}");
  } else {
    BUFFER.push("}");
  }
  STACK.pop();
}
function writeArray(arr) {
  BUFFER.push("[");
  STACK.push(arr);
  writeProp(arr[0], 0);
  for (let i = 1, len = arr.length; i < len; i++) {
    BUFFER.push(",");
    writeProp(arr[i], i);
  }
  STACK.pop();
  BUFFER.push("]");
}
function getRef(cur, accessor) {
  let ref = INDEX_OR_REF.get(cur);
  if (ref === undefined) {
    INDEX_OR_REF.set(cur, BUFFER.length);
    return false;
  }
  if (typeof ref === "number") {
    ref = insertAndGetRef(cur, ref);
  }
  if (STACK.includes(cur)) {
    const parent = STACK[STACK.length - 1];
    let parentRef = INDEX_OR_REF.get(parent);
    if (typeof parentRef === "number") {
      parentRef = insertAndGetRef(parent, parentRef);
    }
    ASSIGNMENTS.set(ref, (ASSIGNMENTS.get(ref) || "") + toAssignment(parentRef, accessor) + "=");
    return true;
  }
  return ref;
}
function toObjectKey(name) {
  const invalidIdentifierPos = getInvalidIdentifierPos(name);
  return invalidIdentifierPos === -1 ? name : quote(name, invalidIdentifierPos);
}
function toAssignment(parent, key) {
  return parent + (typeof key === "number" || key[0] === '"' ? "[" + key + "]" : "." + key);
}
function getInvalidIdentifierPos(name) {
  let char = name[0];
  if (!(char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char === "$" || char === "_")) {
    return 0;
  }
  for (let i = 1, len = name.length; i < len; i++) {
    char = name[i];
    if (!(char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9" || char === "$" || char === "_")) {
      return i;
    }
  }
  return -1;
}
function quote(str, startPos) {
  let result = "";
  let lastPos = 0;
  for (let i = startPos, len = str.length; i < len; i++) {
    let replacement;
    switch (str[i]) {
      case '"':
        replacement = '\\"';
        break;
      case "\\":
        replacement = "\\\\";
        break;
      case "<":
        replacement = "\\x3C";
        break;
      case "\n":
        replacement = "\\n";
        break;
      case "\r":
        replacement = "\\r";
        break;
      case "\u2028":
        replacement = "\\u2028";
        break;
      case "\u2029":
        replacement = "\\u2029";
        break;
      default:
        continue;
    }
    result += str.slice(lastPos, i) + replacement;
    lastPos = i + 1;
  }
  if (lastPos === startPos) {
    result = str;
  } else {
    result += str.slice(lastPos);
  }
  return '"' + result + '"';
}
function insertAndGetRef(obj, pos) {
  const ref = toRefParam(REF_COUNT++);
  INDEX_OR_REF.set(obj, ref);
  if (pos) {
    BUFFER[pos - 1] += ref + "=";
  } else {
    BUFFER[pos] = ref + "=" + BUFFER[pos];
  }
  return ref;
}
function refParamsString() {
  let result = REF_START_CHARS[0];
  for (let i = 1; i < REF_COUNT; i++) {
    result += "," + toRefParam(i);
  }
  REF_COUNT = 0;
  return result;
}
function toRefParam(index) {
  let mod = index % REF_START_CHARS_LEN;
  let ref = REF_START_CHARS[mod];
  index = (index - mod) / REF_START_CHARS_LEN;
  while (index > 0) {
    mod = index % REF_CHARS_LEN;
    ref += REF_CHARS[mod];
    index = (index - mod) / REF_CHARS_LEN;
  }
  return ref;
}

const REPLACE_SCRIPT = `function $df(e,t,d,l){d=document.getElementById(e),(l=document.getElementById("pl-"+e))&&l.replaceWith(...d.childNodes),d.remove(),_$HY.set(e,t),_$HY.fe(e)}`;
function renderToStringAsync(code, options = {}) {
  const {
    timeoutMs = 30000
  } = options;
  let timeoutHandle;
  const timeout = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject("renderToString timed out"), timeoutMs);
  });
  return Promise.race([renderToStream(code, options), timeout]).then(html => {
    clearTimeout(timeoutHandle);
    return html;
  });
}
function renderToStream(code, options = {}) {
  let {
    nonce,
    onCompleteShell,
    onCompleteAll,
    renderId
  } = options;
  const blockingResources = [];
  const registry = new Map();
  const dedupe = new WeakMap();
  const checkEnd = () => {
    if (!registry.size && !completed) {
      writeTasks();
      onCompleteAll && onCompleteAll({
        write(v) {
          !completed && buffer.write(v);
        }
      });
      writable && writable.end();
      completed = true;
    }
  };
  const pushTask = task => {
    tasks += task + ";";
    if (!scheduled && firstFlushed) {
      Promise.resolve().then(writeTasks);
      scheduled = true;
    }
  };
  const writeTasks = () => {
    if (tasks.length && !completed && firstFlushed) {
      buffer.write(`<script${nonce ? ` nonce="${nonce}"` : ""}>${tasks}</script>`);
      tasks = "";
    }
    scheduled = false;
  };
  let context;
  let writable;
  let tmp = "";
  let tasks = "";
  let firstFlushed = false;
  let completed = false;
  let scriptFlushed = false;
  let scheduled = true;
  let buffer = {
    write(payload) {
      tmp += payload;
    }
  };
  sharedConfig.context = context = {
    id: renderId || "",
    count: 0,
    async: true,
    resources: {},
    suspense: {},
    assets: [],
    nonce,
    block(p) {
      if (!firstFlushed) blockingResources.push(p);
    },
    replace(id, payloadFn) {
      if (firstFlushed) return;
      const placeholder = `<!${id}>`;
      const first = html.indexOf(placeholder);
      if (first === -1) return;
      const last = html.indexOf(`<!/${id}>`, first + placeholder.length);
      html = html.replace(html.slice(first, last + placeholder.length + 1), resolveSSRNode(payloadFn()));
    },
    writeResource(id, p, error, wait) {
      const serverOnly = sharedConfig.context.noHydrate;
      if (error) return !serverOnly && pushTask(serializeSet(dedupe, id, p, serializeError));
      if (!p || typeof p !== "object" || !("then" in p)) return !serverOnly && pushTask(serializeSet(dedupe, id, p));
      if (!firstFlushed) wait && blockingResources.push(p);else !serverOnly && pushTask(`_$HY.init("${id}")`);
      if (serverOnly) return;
      p.then(d => {
        !completed && pushTask(serializeSet(dedupe, id, d));
      }).catch(() => {
        !completed && pushTask(`_$HY.set("${id}", {})`);
      });
    },
    registerFragment(key) {
      if (!registry.has(key)) {
        registry.set(key, []);
        firstFlushed && pushTask(`_$HY.init("${key}")`);
      }
      return (value, error) => {
        if (registry.has(key)) {
          const keys = registry.get(key);
          registry.delete(key);
          if (waitForFragments(registry, key)) return;
          if ((value !== undefined || error) && !completed) {
            if (!firstFlushed) {
              Promise.resolve().then(() => html = replacePlaceholder(html, key, value !== undefined ? value : ""));
              error && pushTask(serializeSet(dedupe, key, error, serializeError));
            } else {
              buffer.write(`<div hidden id="${key}">${value !== undefined ? value : " "}</div>`);
              pushTask(`${keys.length ? keys.map(k => `_$HY.unset("${k}")`).join(";") + ";" : ""}$df("${key}"${error ? "," + serializeError(error) : ""})${!scriptFlushed ? ";" + REPLACE_SCRIPT : ""}`);
              scriptFlushed = true;
            }
          }
        }
        if (!registry.size) Promise.resolve().then(checkEnd);
        return firstFlushed;
      };
    }
  };
  let html = resolveSSRNode(escape(code()));
  function doShell() {
    sharedConfig.context = context;
    context.noHydrate = true;
    html = injectAssets(context.assets, html);
    for (const key in context.resources) {
      if (!("data" in context.resources[key] || context.resources[key].ref[0].error)) pushTask(`_$HY.init("${key}")`);
    }
    for (const key of registry.keys()) pushTask(`_$HY.init("${key}")`);
    if (tasks.length) html = injectScripts(html, tasks, nonce);
    buffer.write(html);
    tasks = "";
    scheduled = false;
    onCompleteShell && onCompleteShell({
      write(v) {
        !completed && buffer.write(v);
      }
    });
  }
  return {
    then(fn) {
      function complete() {
        doShell();
        fn(tmp);
      }
      if (onCompleteAll) {
        ogComplete = onCompleteAll;
        onCompleteAll = options => {
          ogComplete(options);
          complete();
        };
      } else onCompleteAll = complete;
      if (!registry.size) Promise.resolve().then(checkEnd);
    },
    pipe(w) {
      Promise.allSettled(blockingResources).then(() => {
        doShell();
        buffer = writable = w;
        buffer.write(tmp);
        firstFlushed = true;
        if (completed) writable.end();else setTimeout(checkEnd);
      });
    },
    pipeTo(w) {
      Promise.allSettled(blockingResources).then(() => {
        doShell();
        const encoder = new TextEncoder();
        const writer = w.getWriter();
        writable = {
          end() {
            writer.releaseLock();
            w.close();
          }
        };
        buffer = {
          write(payload) {
            writer.write(encoder.encode(payload));
          }
        };
        buffer.write(tmp);
        firstFlushed = true;
        if (completed) writable.end();else setTimeout(checkEnd);
      });
    }
  };
}
function HydrationScript(props) {
  const {
    nonce
  } = sharedConfig.context;
  return ssr(generateHydrationScript({
    nonce,
    ...props
  }));
}
function ssr(t, ...nodes) {
  if (nodes.length) {
    let result = "";
    for (let i = 0; i < nodes.length; i++) {
      result += t[i];
      const node = nodes[i];
      if (node !== undefined) result += resolveSSRNode(node);
    }
    t = result + t[nodes.length];
  }
  return {
    t
  };
}
function ssrClassList(value) {
  if (!value) return "";
  let classKeys = Object.keys(value),
      result = "";
  for (let i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i],
          classValue = !!value[key];
    if (!key || key === "undefined" || !classValue) continue;
    i && (result += " ");
    result += key;
  }
  return result;
}
function ssrStyle(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  let result = "";
  const k = Object.keys(value);
  for (let i = 0; i < k.length; i++) {
    const s = k[i];
    const v = value[s];
    if (v != undefined) {
      if (i) result += ";";
      result += `${s}:${escape(v, true)}`;
    }
  }
  return result;
}
function ssrElement(tag, props, children, needsId) {
  let result = `<${tag}${needsId ? ssrHydrationKey() : ""} `;
  if (props == null) props = {};else if (typeof props === "function") props = props();
  const keys = Object.keys(props);
  let classResolved;
  for (let i = 0; i < keys.length; i++) {
    const prop = keys[i];
    if (ChildProperties.has(prop)) {
      if (children === undefined) children = prop === "innerHTML" ? props[prop] : escape(props[prop]);
      continue;
    }
    const value = props[prop];
    if (prop === "style") {
      result += `style="${ssrStyle(value)}"`;
    } else if (prop === "class" || prop === "className" || prop === "classList") {
      if (classResolved) continue;
      let n;
      result += `class="${(n = props.class) ? n + " " : ""}${(n = props.className) ? n + " " : ""}${ssrClassList(props.classList)}"`;
      classResolved = true;
    } else if (BooleanAttributes.has(prop)) {
      if (value) result += prop;else continue;
    } else if (value == undefined || prop === "ref" || prop.slice(0, 2) === "on") {
      continue;
    } else {
      result += `${Aliases[prop] || prop}="${escape(value, true)}"`;
    }
    if (i !== keys.length - 1) result += " ";
  }
  return {
    t: result + `>${resolveSSRNode(children)}</${tag}>`
  };
}
function ssrAttribute(key, value, isBoolean) {
  return isBoolean ? value ? " " + key : "" : value != null ? ` ${key}="${value}"` : "";
}
function ssrHydrationKey() {
  const hk = getHydrationKey();
  return hk ? ` data-hk="${hk}"` : "";
}
function escape(s, attr) {
  const t = typeof s;
  if (t !== "string") {
    if (!attr && t === "function") return escape(s(), attr);
    if (!attr && Array.isArray(s)) {
      let r = "";
      for (let i = 0; i < s.length; i++) r += resolveSSRNode(escape(s[i], attr));
      return {
        t: r
      };
    }
    if (attr && t === "boolean") return String(s);
    return s;
  }
  const delim = attr ? '"' : "<";
  const escDelim = attr ? "&quot;" : "&lt;";
  let iDelim = s.indexOf(delim);
  let iAmp = s.indexOf("&");
  if (iDelim < 0 && iAmp < 0) return s;
  let left = 0,
      out = "";
  while (iDelim >= 0 && iAmp >= 0) {
    if (iDelim < iAmp) {
      if (left < iDelim) out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } else {
      if (left < iAmp) out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  }
  if (iDelim >= 0) {
    do {
      if (left < iDelim) out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } while (iDelim >= 0);
  } else while (iAmp >= 0) {
    if (left < iAmp) out += s.substring(left, iAmp);
    out += "&amp;";
    left = iAmp + 1;
    iAmp = s.indexOf("&", left);
  }
  return left < s.length ? out + s.substring(left) : out;
}
function resolveSSRNode(node) {
  const t = typeof node;
  if (t === "string") return node;
  if (node == null || t === "boolean") return "";
  if (Array.isArray(node)) {
    let mapped = "";
    for (let i = 0, len = node.length; i < len; i++) mapped += resolveSSRNode(node[i]);
    return mapped;
  }
  if (t === "object") return node.t;
  if (t === "function") return resolveSSRNode(node());
  return String(node);
}
function getHydrationKey() {
  const hydrate = sharedConfig.context;
  return hydrate && !hydrate.noHydrate && `${hydrate.id}${hydrate.count++}`;
}
function useAssets(fn) {
  sharedConfig.context.assets.push(() => resolveSSRNode(fn()));
}
function generateHydrationScript({
  eventNames = ["click", "input"],
  nonce
} = {}) {
  return `<script${nonce ? ` nonce="${nonce}"` : ""}>(e=>{let t=e=>e&&e.hasAttribute&&(e.hasAttribute("data-hk")?e:t(e.host&&e.host instanceof Node?e.host:e.parentNode));["${eventNames.join('", "')}"].forEach((o=>document.addEventListener(o,(o=>{let s=o.composedPath&&o.composedPath()[0]||o.target,a=t(s);a&&!e.completed.has(a)&&e.events.push([a,o])}))))})(window._$HY||(_$HY={events:[],completed:new WeakSet,r:{},fe(){},init(e,t){_$HY.r[e]=[new Promise((e=>t=e)),t]},set(e,t,o){(o=_$HY.r[e])&&o[1](t),_$HY.r[e]=[t]},unset(e){delete _$HY.r[e]},load:e=>_$HY.r[e]}));</script><!--xs-->`;
}
function NoHydration(props) {
  sharedConfig.context.noHydrate = true;
  return props.children;
}
function injectAssets(assets, html) {
  if (!assets || !assets.length) return html;
  let out = "";
  for (let i = 0, len = assets.length; i < len; i++) out += assets[i]();
  return html.replace(`</head>`, out + `</head>`);
}
function injectScripts(html, scripts, nonce) {
  const tag = `<script${nonce ? ` nonce="${nonce}"` : ""}>${scripts}</script>`;
  const index = html.indexOf("<!--xs-->");
  if (index > -1) {
    return html.slice(0, index) + tag + html.slice(index);
  }
  return html + tag;
}
function serializeError(error) {
  if (error.message) {
    const fields = {};
    const keys = Object.getOwnPropertyNames(error);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = error[key];
      if (!value || key !== "message" && typeof value !== "function") {
        fields[key] = value;
      }
    }
    return `Object.assign(new Error(${stringify(error.message)}), ${stringify(fields)})`;
  }
  return stringify(error);
}
function waitForFragments(registry, key) {
  for (const k of [...registry.keys()].reverse()) {
    if (key.startsWith(k)) {
      registry.get(k).push(key);
      return true;
    }
  }
  return false;
}
function serializeSet(registry, key, value, serializer = stringify) {
  const exist = registry.get(value);
  if (exist) return `_$HY.set("${key}", _$HY.r["${exist}"][0])`;
  value !== null && typeof value === "object" && registry.set(value, key);
  return `_$HY.set("${key}", ${serializer(value)})`;
}
function replacePlaceholder(html, key, value) {
  const nextRegex = /(<[/]?span[^>]*>)/g;
  const marker = `<span id="pl-${key}">`;
  const first = html.indexOf(marker);
  if (first === -1) return html;
  nextRegex.lastIndex = first + marker.length;
  let match;
  let open = 0,
      close = 0;
  while (match = nextRegex.exec(html)) {
    if (match[0][1] === "/") {
      close++;
      if (close > open) break;
    } else open++;
  }
  return html.slice(0, first) + value + html.slice(nextRegex.lastIndex);
}

const isServer = true;

function isWrappable(obj) {
  return obj != null && typeof obj === "object" && (Object.getPrototypeOf(obj) === Object.prototype || Array.isArray(obj));
}
function unwrap(item) {
  return item;
}
function setProperty(state, property, value, force) {
  if (!force && state[property] === value) return;
  if (value === undefined) {
    delete state[property];
  } else state[property] = value;
}
function mergeStoreNode(state, value, force) {
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    setProperty(state, key, value[key], force);
  }
}
function updateArray(current, next) {
  if (typeof next === "function") next = next(current);
  if (Array.isArray(next)) {
    if (current === next) return;
    let i = 0,
        len = next.length;
    for (; i < len; i++) {
      const value = next[i];
      if (current[i] !== value) setProperty(current, i, value);
    }
    setProperty(current, "length", len);
  } else mergeStoreNode(current, next);
}
function updatePath(current, path, traversed = []) {
  let part,
      next = current;
  if (path.length > 1) {
    part = path.shift();
    const partType = typeof part,
          isArray = Array.isArray(current);
    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        updatePath(current, [part[i]].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "function") {
      for (let i = 0; i < current.length; i++) {
        if (part(current[i], i)) updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "object") {
      const {
        from = 0,
        to = current.length - 1,
        by = 1
      } = part;
      for (let i = from; i <= to; i += by) {
        updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (path.length > 1) {
      updatePath(current[part], path, [part].concat(traversed));
      return;
    }
    next = current[part];
    traversed = [part].concat(traversed);
  }
  let value = path[0];
  if (typeof value === "function") {
    value = value(next, traversed);
    if (value === next) return;
  }
  if (part === undefined && value == undefined) return;
  if (part === undefined || isWrappable(next) && isWrappable(value) && !Array.isArray(value)) {
    mergeStoreNode(next, value);
  } else setProperty(current, part, value);
}
function createStore(state) {
  const isArray = Array.isArray(state);
  function setStore(...args) {
    isArray && args.length === 1 ? updateArray(state, args[0]) : updatePath(state, args);
  }
  return [state, setStore];
}
function reconcile(value, options = {}) {
  return state => {
    if (!isWrappable(state) || !isWrappable(value)) return value;
    const targetKeys = Object.keys(value);
    for (let i = 0, len = targetKeys.length; i < len; i++) {
      const key = targetKeys[i];
      setProperty(state, key, value[key]);
    }
    const previousKeys = Object.keys(state);
    for (let i = 0, len = previousKeys.length; i < len; i++) {
      if (value[previousKeys[i]] === undefined) setProperty(state, previousKeys[i], undefined);
    }
    return state;
  };
}

const FETCH_EVENT = "$FETCH";

function getRouteMatches$1(routes, path, method) {
  const segments = path.split("/").filter(Boolean);
  routeLoop:
    for (const route of routes) {
      const matchSegments = route.matchSegments;
      if (segments.length < matchSegments.length || !route.wildcard && segments.length > matchSegments.length) {
        continue;
      }
      for (let index = 0; index < matchSegments.length; index++) {
        const match = matchSegments[index];
        if (!match) {
          continue;
        }
        if (segments[index] !== match) {
          continue routeLoop;
        }
      }
      const handler = route[method];
      if (handler === "skip" || handler === void 0) {
        return;
      }
      const params = {};
      for (const { type, name, index } of route.params) {
        if (type === ":") {
          params[name] = segments[index];
        } else {
          params[name] = segments.slice(index).join("/");
        }
      }
      return { handler, params };
    }
}

let apiRoutes$1;
const registerApiRoutes = (routes) => {
  apiRoutes$1 = routes;
};
async function internalFetch(route, init) {
  if (route.startsWith("http")) {
    return await fetch(route, init);
  }
  let url = new URL(route, "http://internal");
  const request = new Request(url.href, init);
  const handler = getRouteMatches$1(apiRoutes$1, url.pathname, request.method.toUpperCase());
  if (!handler) {
    throw new Error(`No handler found for ${request.method} ${request.url}`);
  }
  let apiEvent = Object.freeze({
    request,
    params: handler.params,
    env: {},
    $type: FETCH_EVENT,
    fetch: internalFetch
  });
  const response = await handler.handler(apiEvent);
  return response;
}

const XSolidStartLocationHeader = "x-solidstart-location";
const LocationHeader = "Location";
const ContentTypeHeader = "content-type";
const XSolidStartResponseTypeHeader = "x-solidstart-response-type";
const XSolidStartContentTypeHeader = "x-solidstart-content-type";
const XSolidStartOrigin = "x-solidstart-origin";
const JSONResponseType = "application/json";
function redirect(url, init = 302) {
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }
  if (url === "") {
    url = "/";
  }
  let headers = new Headers(responseInit.headers);
  headers.set(LocationHeader, url);
  const response = new Response(null, {
    ...responseInit,
    headers
  });
  return response;
}
const redirectStatusCodes = /* @__PURE__ */ new Set([204, 301, 302, 303, 307, 308]);
function isRedirectResponse(response) {
  return response && response instanceof Response && redirectStatusCodes.has(response.status);
}
class ResponseError extends Error {
  status;
  headers;
  name = "ResponseError";
  ok;
  statusText;
  redirected;
  url;
  constructor(response) {
    let message = JSON.stringify({
      $type: "response",
      status: response.status,
      message: response.statusText,
      headers: [...response.headers.entries()]
    });
    super(message);
    this.status = response.status;
    this.headers = new Map([...response.headers.entries()]);
    this.url = response.url;
    this.ok = response.ok;
    this.statusText = response.statusText;
    this.redirected = response.redirected;
    this.bodyUsed = false;
    this.type = response.type;
    this.response = () => response;
  }
  response;
  type;
  clone() {
    return this.response();
  }
  get body() {
    return this.response().body;
  }
  bodyUsed;
  async arrayBuffer() {
    return await this.response().arrayBuffer();
  }
  async blob() {
    return await this.response().blob();
  }
  async formData() {
    return await this.response().formData();
  }
  async text() {
    return await this.response().text();
  }
  async json() {
    return await this.response().json();
  }
}

function renderAsync(fn, options) {
  return () => async (event) => {
    let pageEvent = createPageEvent(event);
    let markup = await renderToStringAsync(() => fn(pageEvent), options);
    if (pageEvent.routerContext && pageEvent.routerContext.url) {
      return redirect(pageEvent.routerContext.url, {
        headers: pageEvent.responseHeaders
      });
    }
    markup = handleIslandsRouting(pageEvent, markup);
    return new Response(markup, {
      status: pageEvent.getStatusCode(),
      headers: pageEvent.responseHeaders
    });
  };
}
function createPageEvent(event) {
  let responseHeaders = new Headers({
    "Content-Type": "text/html"
  });
  const prevPath = event.request.headers.get("x-solid-referrer");
  let statusCode = 200;
  function setStatusCode(code) {
    statusCode = code;
  }
  function getStatusCode() {
    return statusCode;
  }
  const pageEvent = Object.freeze({
    request: event.request,
    prevUrl: prevPath || "",
    routerContext: {},
    tags: [],
    env: event.env,
    $type: FETCH_EVENT,
    responseHeaders,
    setStatusCode,
    getStatusCode,
    fetch: internalFetch
  });
  return pageEvent;
}
function handleIslandsRouting(pageEvent, markup) {
  return markup;
}

const MetaContext = createContext();
const cascadingTags = ["title", "meta"];
const getTagType = tag => tag.tag + (tag.name ? `.${tag.name}"` : "");
const MetaProvider = props => {
  const cascadedTagInstances = new Map();
  const actions = {
    addClientTag: tag => {
      let tagType = getTagType(tag);
      if (cascadingTags.indexOf(tag.tag) !== -1) {
        //  only cascading tags need to be kept as singletons
        if (!cascadedTagInstances.has(tagType)) {
          cascadedTagInstances.set(tagType, []);
        }
        let instances = cascadedTagInstances.get(tagType);
        let index = instances.length;
        instances = [...instances, tag];
        // track indices synchronously
        cascadedTagInstances.set(tagType, instances);
        return index;
      }
      return -1;
    },
    removeClientTag: (tag, index) => {
      const tagName = getTagType(tag);
      if (tag.ref) {
        const t = cascadedTagInstances.get(tagName);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              if (t[i] != null) {
                document.head.appendChild(t[i].ref);
              }
            }
          }
          t[index] = null;
          cascadedTagInstances.set(tagName, t);
        } else {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
          }
        }
      }
    }
  };
  {
    actions.addServerTag = tagDesc => {
      const {
        tags = []
      } = props;
      // tweak only cascading tags
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const index = tags.findIndex(prev => {
          const prevName = prev.props.name || prev.props.property;
          const nextName = tagDesc.props.name || tagDesc.props.property;
          return prev.tag === tagDesc.tag && prevName === nextName;
        });
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
    };
    if (Array.isArray(props.tags) === false) {
      throw Error("tags array should be passed to <MetaProvider /> in node");
    }
  }
  return createComponent(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    }
  });
};
const MetaTag = (tag, props) => {
  const id = createUniqueId();
  const c = useContext(MetaContext);
  if (!c) throw new Error("<MetaProvider /> should be in the tree");
  useHead({
    tag,
    props,
    id,
    get name() {
      return props.name || props.property;
    }
  });
  return null;
};
function useHead(tagDesc) {
  const {
    addClientTag,
    removeClientTag,
    addServerTag
  } = useContext(MetaContext);
  createRenderEffect(() => {
    if (!isServer) ;
  });
  {
    addServerTag(tagDesc);
    return null;
  }
}
function renderTags(tags) {
  return tags.map(tag => {
    const keys = Object.keys(tag.props);
    const props = keys.map(k => k === "children" ? "" : ` ${k}="${tag.props[k]}"`).join("");
    return tag.props.children ? `<${tag.tag} data-sm="${tag.id}"${props}>${
    // Tags might contain multiple text children:
    //   <Title>example - {myCompany}</Title>
    Array.isArray(tag.props.children) ? tag.props.children.join("") : tag.props.children}</${tag.tag}>` : `<${tag.tag} data-sm="${tag.id}"${props}/>`;
  }).join("");
}
const Title = props => MetaTag("title", props);
const Meta$1 = props => MetaTag("meta", props);
function normalizeIntegration(integration) {
    if (!integration) {
        return {
            signal: createSignal({ value: "" })
        };
    }
    else if (Array.isArray(integration)) {
        return {
            signal: integration
        };
    }
    return integration;
}
function staticIntegration(obj) {
    return {
        signal: [() => obj, next => Object.assign(obj, next)]
    };
}

function createBeforeLeave() {
    let listeners = new Set();
    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
    let ignore = false;
    function confirm(to, options) {
        if (ignore)
            return !(ignore = false);
        const e = {
            to,
            options,
            defaultPrevented: false,
            preventDefault: () => (e.defaultPrevented = true)
        };
        for (const l of listeners)
            l.listener({
                ...e,
                from: l.location,
                retry: (force) => {
                    force && (ignore = true);
                    l.navigate(to, options);
                }
            });
        return !e.defaultPrevented;
    }
    return {
        subscribe,
        confirm
    };
}

const hasSchemeRegex = /^(?:[a-z0-9]+:)?\/\//i;
const trimPathRegex = /^\/+|\/+$/g;
function normalizePath(path, omitSlash = false) {
    const s = path.replace(trimPathRegex, "");
    return s ? (omitSlash || /^[?#]/.test(s) ? s : "/" + s) : "";
}
function resolvePath(base, path, from) {
    if (hasSchemeRegex.test(path)) {
        return undefined;
    }
    const basePath = normalizePath(base);
    const fromPath = from && normalizePath(from);
    let result = "";
    if (!fromPath || path.startsWith("/")) {
        result = basePath;
    }
    else if (fromPath.toLowerCase().indexOf(basePath.toLowerCase()) !== 0) {
        result = basePath + fromPath;
    }
    else {
        result = fromPath;
    }
    return (result || "/") + normalizePath(path, !result);
}
function invariant(value, message) {
    if (value == null) {
        throw new Error(message);
    }
    return value;
}
function joinPaths(from, to) {
    return normalizePath(from).replace(/\/*(\*.*)?$/g, "") + normalizePath(to);
}
function extractSearchParams(url) {
    const params = {};
    url.searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
function urlDecode(str, isQuery) {
    return decodeURIComponent(isQuery ? str.replace(/\+/g, " ") : str);
}
function createMatcher(path, partial) {
    const [pattern, splat] = path.split("/*", 2);
    const segments = pattern.split("/").filter(Boolean);
    const len = segments.length;
    return (location) => {
        const locSegments = location.split("/").filter(Boolean);
        const lenDiff = locSegments.length - len;
        if (lenDiff < 0 || (lenDiff > 0 && splat === undefined && !partial)) {
            return null;
        }
        const match = {
            path: len ? "" : "/",
            params: {}
        };
        for (let i = 0; i < len; i++) {
            const segment = segments[i];
            const locSegment = locSegments[i];
            if (segment[0] === ":") {
                match.params[segment.slice(1)] = locSegment;
            }
            else if (segment.localeCompare(locSegment, undefined, { sensitivity: "base" }) !== 0) {
                return null;
            }
            match.path += `/${locSegment}`;
        }
        if (splat) {
            match.params[splat] = lenDiff ? locSegments.slice(-lenDiff).join("/") : "";
        }
        return match;
    };
}
function scoreRoute(route) {
    const [pattern, splat] = route.pattern.split("/*", 2);
    const segments = pattern.split("/").filter(Boolean);
    return segments.reduce((score, segment) => score + (segment.startsWith(":") ? 2 : 3), segments.length - (splat === undefined ? 0 : 1));
}
function createMemoObject(fn) {
    const map = new Map();
    const owner = getOwner();
    return new Proxy({}, {
        get(_, property) {
            if (!map.has(property)) {
                runWithOwner(owner, () => map.set(property, createMemo(() => fn()[property])));
            }
            return map.get(property)();
        },
        getOwnPropertyDescriptor() {
            return {
                enumerable: true,
                configurable: true
            };
        },
        ownKeys() {
            return Reflect.ownKeys(fn());
        }
    });
}
function mergeSearchString(search, params) {
    const merged = new URLSearchParams(search);
    Object.entries(params).forEach(([key, value]) => {
        if (value == null || value === "") {
            merged.delete(key);
        }
        else {
            merged.set(key, String(value));
        }
    });
    const s = merged.toString();
    return s ? `?${s}` : "";
}
function expandOptionals(pattern) {
    let match = /(\/?\:[^\/]+)\?/.exec(pattern);
    if (!match)
        return [pattern];
    let prefix = pattern.slice(0, match.index);
    let suffix = pattern.slice(match.index + match[0].length);
    const prefixes = [prefix, (prefix += match[1])];
    // This section handles adjacent optional params. We don't actually want all permuations since
    // that will lead to equivalent routes which have the same number of params. For example
    // `/:a?/:b?/:c`? only has the unique expansion: `/`, `/:a`, `/:a/:b`, `/:a/:b/:c` and we can
    // discard `/:b`, `/:c`, `/:b/:c` by building them up in order and not recursing. This also helps
    // ensure predictability where earlier params have precidence.
    while ((match = /^(\/\:[^\/]+)\?/.exec(suffix))) {
        prefixes.push((prefix += match[1]));
        suffix = suffix.slice(match[0].length);
    }
    return expandOptionals(suffix).reduce((results, expansion) => [...results, ...prefixes.map(p => p + expansion)], []);
}

const MAX_REDIRECTS = 100;
const RouterContextObj = createContext();
const RouteContextObj = createContext();
const useRouter = () => invariant(useContext(RouterContextObj), "Make sure your app is wrapped in a <Router />");
let TempRoute;
const useRoute = () => TempRoute || useContext(RouteContextObj) || useRouter().base;
const useNavigate$1 = () => useRouter().navigatorFactory();
const useLocation = () => useRouter().location;
const useRouteData = () => useRoute().data;
const useSearchParams = () => {
    const location = useLocation();
    const navigate = useNavigate$1();
    const setSearchParams = (params, options) => {
        const searchString = untrack(() => mergeSearchString(location.search, params));
        navigate(location.pathname + searchString + location.hash, { scroll: false, resolve: false, ...options });
    };
    return [location.query, setSearchParams];
};
function createRoutes(routeDef, base = "", fallback) {
    const { component, data, children } = routeDef;
    const isLeaf = !children || (Array.isArray(children) && !children.length);
    const shared = {
        key: routeDef,
        element: component
            ? () => createComponent(component, {})
            : () => {
                const { element } = routeDef;
                return element === undefined && fallback
                    ? createComponent(fallback, {})
                    : element;
            },
        preload: routeDef.component
            ? component.preload
            : routeDef.preload,
        data
    };
    return asArray(routeDef.path).reduce((acc, path) => {
        for (const originalPath of expandOptionals(path)) {
            const path = joinPaths(base, originalPath);
            const pattern = isLeaf ? path : path.split("/*", 1)[0];
            acc.push({
                ...shared,
                originalPath,
                pattern,
                matcher: createMatcher(pattern, !isLeaf)
            });
        }
        return acc;
    }, []);
}
function createBranch(routes, index = 0) {
    return {
        routes,
        score: scoreRoute(routes[routes.length - 1]) * 10000 - index,
        matcher(location) {
            const matches = [];
            for (let i = routes.length - 1; i >= 0; i--) {
                const route = routes[i];
                const match = route.matcher(location);
                if (!match) {
                    return null;
                }
                matches.unshift({
                    ...match,
                    route
                });
            }
            return matches;
        }
    };
}
function asArray(value) {
    return Array.isArray(value) ? value : [value];
}
function createBranches(routeDef, base = "", fallback, stack = [], branches = []) {
    const routeDefs = asArray(routeDef);
    for (let i = 0, len = routeDefs.length; i < len; i++) {
        const def = routeDefs[i];
        if (def && typeof def === "object" && def.hasOwnProperty("path")) {
            const routes = createRoutes(def, base, fallback);
            for (const route of routes) {
                stack.push(route);
                const isEmptyArray = Array.isArray(def.children) && def.children.length === 0;
                if (def.children && !isEmptyArray) {
                    createBranches(def.children, route.pattern, fallback, stack, branches);
                }
                else {
                    const branch = createBranch([...stack], branches.length);
                    branches.push(branch);
                }
                stack.pop();
            }
        }
    }
    // Stack will be empty on final return
    return stack.length ? branches : branches.sort((a, b) => b.score - a.score);
}
function getRouteMatches(branches, location) {
    for (let i = 0, len = branches.length; i < len; i++) {
        const match = branches[i].matcher(location);
        if (match) {
            return match;
        }
    }
    return [];
}
function createLocation(path, state) {
    const origin = new URL("http://sar");
    const url = createMemo(prev => {
        const path_ = path();
        try {
            return new URL(path_, origin);
        }
        catch (err) {
            console.error(`Invalid path ${path_}`);
            return prev;
        }
    }, origin);
    const pathname = createMemo(() => urlDecode(url().pathname));
    const search = createMemo(() => urlDecode(url().search, true));
    const hash = createMemo(() => urlDecode(url().hash));
    const key = createMemo(() => "");
    return {
        get pathname() {
            return pathname();
        },
        get search() {
            return search();
        },
        get hash() {
            return hash();
        },
        get state() {
            return state();
        },
        get key() {
            return key();
        },
        query: createMemoObject(on(search, () => extractSearchParams(url())))
    };
}
function createRouterContext(integration, base = "", data, out) {
    const { signal: [source, setSource], utils = {} } = normalizeIntegration(integration);
    const parsePath = utils.parsePath || (p => p);
    const renderPath = utils.renderPath || (p => p);
    const beforeLeave = utils.beforeLeave || createBeforeLeave();
    const basePath = resolvePath("", base);
    const output = out
        ? Object.assign(out, {
            matches: [],
            url: undefined
        })
        : undefined;
    if (basePath === undefined) {
        throw new Error(`${basePath} is not a valid base path`);
    }
    else if (basePath && !source().value) {
        setSource({ value: basePath, replace: true, scroll: false });
    }
    const [isRouting, setIsRouting] = createSignal(false);
    const start = async (callback) => {
        setIsRouting(true);
        try {
            await startTransition(callback);
        }
        finally {
            setIsRouting(false);
        }
    };
    const [reference, setReference] = createSignal(source().value);
    const [state, setState] = createSignal(source().state);
    const location = createLocation(reference, state);
    const referrers = [];
    const baseRoute = {
        pattern: basePath,
        params: {},
        path: () => basePath,
        outlet: () => null,
        resolvePath(to) {
            return resolvePath(basePath, to);
        }
    };
    if (data) {
        try {
            TempRoute = baseRoute;
            baseRoute.data = data({
                data: undefined,
                params: {},
                location,
                navigate: navigatorFactory(baseRoute)
            });
        }
        finally {
            TempRoute = undefined;
        }
    }
    function navigateFromRoute(route, to, options) {
        // Untrack in case someone navigates in an effect - don't want to track `reference` or route paths
        untrack(() => {
            if (typeof to === "number") {
                if (!to) ;
                else if (utils.go) {
                    beforeLeave.confirm(to, options) && utils.go(to);
                }
                else {
                    console.warn("Router integration does not support relative routing");
                }
                return;
            }
            const { replace, resolve, scroll, state: nextState } = {
                replace: false,
                resolve: true,
                scroll: true,
                ...options
            };
            const resolvedTo = resolve ? route.resolvePath(to) : resolvePath("", to);
            if (resolvedTo === undefined) {
                throw new Error(`Path '${to}' is not a routable path`);
            }
            else if (referrers.length >= MAX_REDIRECTS) {
                throw new Error("Too many redirects");
            }
            const current = reference();
            if (resolvedTo !== current || nextState !== state()) {
                {
                    if (output) {
                        output.url = resolvedTo;
                    }
                    setSource({ value: resolvedTo, replace, scroll, state: nextState });
                }
            }
        });
    }
    function navigatorFactory(route) {
        // Workaround for vite issue (https://github.com/vitejs/vite/issues/3803)
        route = route || useContext(RouteContextObj) || baseRoute;
        return (to, options) => navigateFromRoute(route, to, options);
    }
    createRenderEffect(() => {
        const { value, state } = source();
        // Untrack this whole block so `start` doesn't cause Solid's Listener to be preserved
        untrack(() => {
            if (value !== reference()) {
                start(() => {
                    setReference(value);
                    setState(state);
                });
            }
        });
    });
    return {
        base: baseRoute,
        out: output,
        location,
        isRouting,
        renderPath,
        parsePath,
        navigatorFactory,
        beforeLeave
    };
}
function createRouteContext(router, parent, child, match) {
    const { base, location, navigatorFactory } = router;
    const { pattern, element: outlet, preload, data } = match().route;
    const path = createMemo(() => match().path);
    const params = createMemoObject(() => match().params);
    preload && preload();
    const route = {
        parent,
        pattern,
        get child() {
            return child();
        },
        path,
        params,
        data: parent.data,
        outlet,
        resolvePath(to) {
            return resolvePath(base.path(), to, path());
        }
    };
    if (data) {
        try {
            TempRoute = route;
            route.data = data({ data: parent.data, params, location, navigate: navigatorFactory(route) });
        }
        finally {
            TempRoute = undefined;
        }
    }
    return route;
}

const Router = props => {
  const {
    source,
    url,
    base,
    data,
    out
  } = props;
  const integration = source || (staticIntegration({
    value: url || ""
  }) );
  const routerState = createRouterContext(integration, base, data, out);
  return createComponent(RouterContextObj.Provider, {
    value: routerState,
    get children() {
      return props.children;
    }
  });
};
const Routes$1 = props => {
  const router = useRouter();
  const parentRoute = useRoute();
  const routeDefs = children(() => props.children);
  const branches = createMemo(() => createBranches(routeDefs(), joinPaths(parentRoute.pattern, props.base || ""), Outlet));
  const matches = createMemo(() => getRouteMatches(branches(), router.location.pathname));
  if (router.out) {
    router.out.matches.push(matches().map(({
      route,
      path,
      params
    }) => ({
      originalPath: route.originalPath,
      pattern: route.pattern,
      path,
      params
    })));
  }
  const disposers = [];
  let root;
  const routeStates = createMemo(on(matches, (nextMatches, prevMatches, prev) => {
    let equal = prevMatches && nextMatches.length === prevMatches.length;
    const next = [];
    for (let i = 0, len = nextMatches.length; i < len; i++) {
      const prevMatch = prevMatches && prevMatches[i];
      const nextMatch = nextMatches[i];
      if (prev && prevMatch && nextMatch.route.key === prevMatch.route.key) {
        next[i] = prev[i];
      } else {
        equal = false;
        if (disposers[i]) {
          disposers[i]();
        }
        createRoot(dispose => {
          disposers[i] = dispose;
          next[i] = createRouteContext(router, next[i - 1] || parentRoute, () => routeStates()[i + 1], () => matches()[i]);
        });
      }
    }
    disposers.splice(nextMatches.length).forEach(dispose => dispose());
    if (prev && equal) {
      return prev;
    }
    root = next[0];
    return next;
  }));
  return createComponent(Show, {
    get when() {
      return routeStates() && root;
    },
    children: route => createComponent(RouteContextObj.Provider, {
      value: route,
      get children() {
        return route.outlet();
      }
    })
  });
};
const Outlet = () => {
  const route = useRoute();
  return createComponent(Show, {
    get when() {
      return route.child;
    },
    children: child => createComponent(RouteContextObj.Provider, {
      value: child,
      get children() {
        return child.outlet();
      }
    })
  });
};

class ServerError extends Error {
  constructor(message, {
    status,
    stack
  } = {}) {
    super(message);
    this.name = "ServerError";
    this.status = status || 400;
    if (stack) {
      this.stack = stack;
    }
  }
}
class FormError extends ServerError {
  constructor(message, {
    fieldErrors = {},
    form,
    fields,
    stack
  } = {}) {
    super(message, {
      stack
    });
    this.formError = message;
    this.name = "FormError";
    this.fields = fields || Object.fromEntries(typeof form !== "undefined" ? form.entries() : []) || {};
    this.fieldErrors = fieldErrors;
  }
}

let FormImpl = _props => {
  let [props, rest] = splitProps(mergeProps({
    reloadDocument: false,
    replace: false,
    method: "post",
    action: "/",
    encType: "application/x-www-form-urlencoded"
  }, _props), ["reloadDocument", "replace", "method", "action", "encType", "onSubmission", "onSubmit", "children", "ref"]);
  let formMethod = props.method.toLowerCase() === "get" ? "get" : "post";
  return ssrElement("form", () => ({
    "method": formMethod,
    "action": _props.action,
    "enctype": props.encType,
    ...rest
  }), () => escape(props.children), true);
};

const ServerContext = createContext({});
const useRequest = () => {
  return useContext(ServerContext);
};

const Routes = Routes$1;
const useNavigate = useNavigate$1;

const resources = new Set();
const promises = new Map();
function createRouteData(fetcher, options = {}) {
  const navigate = useNavigate();
  const pageEvent = useContext(ServerContext);
  function handleResponse(response) {
    if (isRedirectResponse(response)) {
      startTransition(() => {
        let url = response.headers.get(LocationHeader);
        if (url && url.startsWith("/")) {
          navigate(url, {
            replace: true
          });
        }
      });
      if (pageEvent) {
        pageEvent.setStatusCode(response.status);
        response.headers.forEach((head, value) => {
          pageEvent.responseHeaders.set(value, head);
        });
      }
    }
  }
  const resourceFetcher = async key => {
    try {
      let event = pageEvent;
      if (isServer && pageEvent) {
        event = Object.freeze({
          request: pageEvent.request,
          env: pageEvent.env,
          $type: FETCH_EVENT,
          fetch: pageEvent.fetch
        });
      }
      let response = await fetcher.call(event, key, event);
      if (response instanceof Response) {
        if (isServer) {
          handleResponse(response);
        }
      }
      return response;
    } catch (e) {
      if (e instanceof Response) {
        {
          handleResponse(e);
        }
        return e;
      }
      throw e;
    }
  };
  function dedup(fetcher) {
    return (key, info) => {
      if (info.refetching && info.refetching !== true && !partialMatch(key, info.refetching) && info.value) {
        return info.value;
      }
      if (key == true) return fetcher(key, info);
      let promise = promises.get(key);
      if (promise) return promise;
      promise = fetcher(key, info);
      promises.set(key, promise);
      promise.finally(() => promises.delete(key));
      return promise;
    };
  }
  const [resource, {
    refetch
  }] = createResource(options.key || true, dedup(resourceFetcher), {
    storage: init => createDeepSignal(init, options.reconcileOptions),
    ...options
  });
  resources.add(refetch);
  onCleanup(() => resources.delete(refetch));
  return resource;
}
function refetchRouteData(key) {
  return startTransition(() => {
    for (let refetch of resources) refetch(key);
  });
}
function createDeepSignal(value, options) {
  const [store, setStore] = createStore({
    value
  });
  return [() => store.value, v => {
    const unwrapped = unwrap(store.value);
    typeof v === "function" && (v = v(unwrapped));
    setStore("value", reconcile(v, options));
    return store.value;
  }];
}

/* React Query key matching  https://github.com/tannerlinsley/react-query */
function partialMatch(a, b) {
  return partialDeepEqual(ensureQueryKeyArray(a), ensureQueryKeyArray(b));
}
function ensureQueryKeyArray(value) {
  return Array.isArray(value) ? value : [value];
}

/**
 * Checks if `b` partially matches with `a`.
 */
function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a.length && !b.length) return false;
  if (a && b && typeof a === "object" && typeof b === "object") {
    return !Object.keys(b).some(key => !partialDeepEqual(a[key], b[key]));
  }
  return false;
}

function createRouteAction(fn, options = {}) {
  let init = checkFlash(fn);
  const [input, setInput] = createSignal(init.input);
  const [result, setResult] = createSignal(init.result);
  const navigate = useNavigate$1();
  const event = useRequest();
  let count = 0;
  function submit(variables) {
    const p = fn(variables, event);
    const reqId = ++count;
    batch(() => {
      setResult(undefined);
      setInput(() => variables);
    });
    return p.then(async data => {
      if (reqId === count) {
        if (data instanceof Response) {
          await handleResponse(data, navigate, options);
        } else await handleRefetch(data, options);
        if (!data || isRedirectResponse(data)) setInput(undefined);else setResult({
          data
        });
      }
      return data;
    }).catch(async e => {
      if (reqId === count) {
        if (e instanceof Response) {
          await handleResponse(e, navigate, options);
        }
        if (!isRedirectResponse(e)) {
          setResult({
            error: e
          });
        } else setInput(undefined);
      }
      return undefined;
    });
  }
  submit.url = fn.url;
  submit.Form = props => {
    let url = fn.url;
    return createComponent(FormImpl, mergeProps(props, {
      action: url,
      onSubmission: submission => {
        submit(submission.formData);
      },
      get children() {
        return props.children;
      }
    }));
  };
  return [{
    get pending() {
      return !!input() && !result();
    },
    get input() {
      return input();
    },
    get result() {
      return result()?.data;
    },
    get error() {
      return result()?.error;
    },
    clear() {
      batch(() => {
        setInput(undefined);
        setResult(undefined);
      });
    },
    retry() {
      const variables = input();
      if (!variables) throw new Error("No submission to retry");
      submit(variables);
    }
  }, submit];
}
function handleRefetch(response, options = {}) {
  return refetchRouteData(typeof options.invalidate === "function" ? options.invalidate(response) : options.invalidate);
}
function handleResponse(response, navigate, options) {
  if (response instanceof Response && isRedirectResponse(response)) {
    const locationUrl = response.headers.get("Location") || "/";
    if (locationUrl.startsWith("http")) {
      window.location.href = locationUrl;
    } else {
      navigate(locationUrl);
    }
  }
  if (isRedirectResponse(response)) return handleRefetch(response, options);
}
function checkFlash(fn) {
  const [params] = useSearchParams();
  let param = params.form ? JSON.parse(params.form) : null;
  if (!param || param.url !== fn.url) {
    return {};
  }
  const input = new Map(param.entries);
  return {
    result: {
      error: param.error ? new FormError(param.error.message, {
        fieldErrors: param.error.fieldErrors,
        stack: param.error.stack,
        form: param.error.form,
        fields: param.error.fields
      }) : undefined
    },
    input: input
  };
}

const _tmpl$$4 = ["<div", " style=\"", "\"><div style=\"", "\"><p style=\"", "\" id=\"error-message\">", "</p><button id=\"reset-errors\" style=\"", "\">Clear errors and retry</button><pre style=\"", "\">", "</pre></div></div>"];
function ErrorBoundary(props) {
  return createComponent(ErrorBoundary$1, {
    fallback: (e, reset) => {
      return createComponent(Show, {
        get when() {
          return !props.fallback;
        },
        get fallback() {
          return props.fallback && props.fallback(e, reset);
        },
        get children() {
          return createComponent(ErrorMessage, {
            error: e
          });
        }
      });
    },
    get children() {
      return props.children;
    }
  });
}
function ErrorMessage(props) {
  return ssr(_tmpl$$4, ssrHydrationKey(), "padding:" + "16px", "background-color:" + "rgba(252, 165, 165)" + (";color:" + "rgb(153, 27, 27)") + (";border-radius:" + "5px") + (";overflow:" + "scroll") + (";padding:" + "16px") + (";margin-bottom:" + "8px"), "font-weight:" + "bold", escape(props.error.message), "color:" + "rgba(252, 165, 165)" + (";background-color:" + "rgb(153, 27, 27)") + (";border-radius:" + "5px") + (";padding:" + "4px 8px"), "margin-top:" + "8px" + (";width:" + "100%"), escape(props.error.stack));
}

const routeLayouts = {
  "/*404": {
    "id": "/*404",
    "layouts": []
  },
  "/": {
    "id": "/",
    "layouts": []
  }
};

const _tmpl$$3 = ["<link", " rel=\"stylesheet\"", ">"],
  _tmpl$2$2 = ["<link", " rel=\"modulepreload\"", ">"];
function flattenIslands(match, manifest) {
  let result = [...match];
  match.forEach(m => {
    if (m.type !== "island") return;
    const islandManifest = manifest[m.href];
    if (islandManifest) {
      const res = flattenIslands(islandManifest.assets, manifest);
      result.push(...res);
    }
  });
  return result;
}
function getAssetsFromManifest(manifest, routerContext) {
  let match = routerContext.matches ? routerContext.matches.reduce((memo, m) => {
    if (m.length) {
      const fullPath = m.reduce((previous, match) => previous + match.originalPath, "");
      const route = routeLayouts[fullPath];
      if (route) {
        memo.push(...(manifest[route.id] || []));
        const layoutsManifestEntries = route.layouts.flatMap(manifestKey => manifest[manifestKey] || []);
        memo.push(...layoutsManifestEntries);
      }
    }
    return memo;
  }, []) : [];
  match.push(...(manifest["entry-client"] || []));
  match = manifest ? flattenIslands(match, manifest) : [];
  const links = match.reduce((r, src) => {
    r[src.href] = src.type === "style" ? ssr(_tmpl$$3, ssrHydrationKey(), ssrAttribute("href", escape(src.href, true), false)) : src.type === "script" ? ssr(_tmpl$2$2, ssrHydrationKey(), ssrAttribute("href", escape(src.href, true), false)) : undefined;
    return r;
  }, {});
  return Object.values(links);
}

/**
 * Links are used to load assets for the server rendered HTML
 * @returns {JSXElement}
 */
function Links() {
  const context = useContext(ServerContext);
  useAssets(() => getAssetsFromManifest(context.env.manifest, context.routerContext));
  return null;
}

function Meta() {
  const context = useContext(ServerContext);
  // @ts-expect-error The ssr() types do not match the Assets child types
  useAssets(() => ssr(renderTags(context.tags)));
  return null;
}

const _tmpl$4$1 = ["<script", " type=\"module\" async", "></script>"];
const isDev = "production" === "development";
const isIslands = false;
function Scripts() {
  const context = useContext(ServerContext);
  return [createComponent(HydrationScript, {}), isIslands , createComponent(NoHydration, {
    get children() {
      return (      ssr(_tmpl$4$1, ssrHydrationKey(), ssrAttribute("src", escape(context.env.manifest["entry-client"][0].href, true), false)) );
    }
  }), isDev ];
}

function Html(props) {
  {
    return ssrElement("html", props, undefined, false);
  }
}
function Head(props) {
  {
    return ssrElement("head", props, () => [props.children, createComponent(Meta, {}), createComponent(Links, {})], false);
  }
}
function Body(props) {
  {
    return ssrElement("body", props, () => props.children , false);
  }
}

const server$ = (_fn) => {
  throw new Error("Should be compiled away");
};
async function parseRequest(event) {
  let request = event.request;
  let contentType = request.headers.get(ContentTypeHeader);
  let name = new URL(request.url).pathname, args = [];
  if (contentType) {
    if (contentType === JSONResponseType) {
      let text = await request.text();
      try {
        args = JSON.parse(text, (key, value) => {
          if (!value) {
            return value;
          }
          if (value.$type === "fetch_event") {
            return event;
          }
          if (value.$type === "headers") {
            let headers = new Headers();
            request.headers.forEach((value2, key2) => headers.set(key2, value2));
            value.values.forEach(([key2, value2]) => headers.set(key2, value2));
            return headers;
          }
          if (value.$type === "request") {
            return new Request(value.url, {
              method: value.method,
              headers: value.headers
            });
          }
          return value;
        });
      } catch (e) {
        throw new Error(`Error parsing request body: ${text}`);
      }
    } else if (contentType.includes("form")) {
      let formData = await request.clone().formData();
      args = [formData, event];
    }
  }
  return [name, args];
}
function respondWith(request, data, responseType) {
  if (data instanceof ResponseError) {
    data = data.clone();
  }
  if (data instanceof Response) {
    if (isRedirectResponse(data) && request.headers.get(XSolidStartOrigin) === "client") {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartLocationHeader, data.headers.get(LocationHeader));
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(null, {
        status: 204,
        statusText: "Redirected",
        headers
      });
    } else if (data.status === 101) {
      return data;
    } else {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(data.body, {
        status: data.status,
        statusText: data.statusText,
        headers
      });
    }
  } else if (data instanceof FormError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: "",
          formError: data.formError,
          fields: data.fields,
          fieldErrors: data.fieldErrors
        }
      }),
      {
        status: 400,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "form-error"
        }
      }
    );
  } else if (data instanceof ServerError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: ""
        }
      }),
      {
        status: data.status,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "server-error"
        }
      }
    );
  } else if (data instanceof Error) {
    console.error(data);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal Server Error",
          stack: "",
          status: data.status
        }
      }),
      {
        status: data.status || 500,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "error"
        }
      }
    );
  } else if (typeof data === "object" || typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        [ContentTypeHeader]: "application/json",
        [XSolidStartResponseTypeHeader]: responseType,
        [XSolidStartContentTypeHeader]: "json"
      }
    });
  }
  return new Response("null", {
    status: 200,
    headers: {
      [ContentTypeHeader]: "application/json",
      [XSolidStartContentTypeHeader]: "json",
      [XSolidStartResponseTypeHeader]: responseType
    }
  });
}
async function handleServerRequest(event) {
  const url = new URL(event.request.url);
  if (server$.hasHandler(url.pathname)) {
    try {
      let [name, args] = await parseRequest(event);
      let handler = server$.getHandler(name);
      if (!handler) {
        throw {
          status: 404,
          message: "Handler Not Found for " + name
        };
      }
      const data = await handler.call(event, ...Array.isArray(args) ? args : [args]);
      return respondWith(event.request, data, "return");
    } catch (error) {
      return respondWith(event.request, error, "throw");
    }
  }
  return null;
}
const handlers = /* @__PURE__ */ new Map();
server$.createHandler = (_fn, hash) => {
  let fn = function(...args) {
    let ctx;
    if (typeof this === "object") {
      ctx = this;
    } else if (sharedConfig.context && sharedConfig.context.requestContext) {
      ctx = sharedConfig.context.requestContext;
    } else {
      ctx = {
        request: new URL(hash, "http://localhost:3000").href,
        responseHeaders: new Headers()
      };
    }
    const execute = async () => {
      try {
        let e = await _fn.call(ctx, ...args);
        return e;
      } catch (e) {
        if (e instanceof Error && /[A-Za-z]+ is not defined/.test(e.message)) {
          const error = new Error(
            e.message + "\n You probably are using a variable defined in a closure in your server function."
          );
          error.stack = e.stack;
          throw error;
        }
        throw e;
      }
    };
    return execute();
  };
  fn.url = hash;
  fn.action = function(...args) {
    return fn.call(this, ...args);
  };
  return fn;
};
server$.registerHandler = function(route, handler) {
  handlers.set(route, handler);
};
server$.getHandler = function(route) {
  return handlers.get(route);
};
server$.hasHandler = function(route) {
  return handlers.has(route);
};
server$.fetch = internalFetch;

function HttpStatusCode(props) {
  const context = useContext(ServerContext);
  {
    context.setStatusCode(props.code);
  }
  onCleanup(() => {
    {
      context.setStatusCode(200);
    }
  });
  return null;
}

const _tmpl$$2 = ["<main", "><!--#-->", "<!--/--><!--#-->", "<!--/--><h1>Page Not Found</h1><p>Visit <a href=\"https://start.solidjs.com\" target=\"_blank\">start.solidjs.com</a> to learn how to build SolidStart apps.</p></main>"];
function NotFound() {
  return ssr(_tmpl$$2, ssrHydrationKey(), escape(createComponent(Title, {
    children: "Not Found"
  })), escape(createComponent(HttpStatusCode, {
    code: 404
  })));
}

let m;
const w = new Uint8Array(16);
function D() {
  if (!m && (m = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !m))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return m(w);
}
const s = [];
for (let e = 0; e < 256; ++e)
  s.push((e + 256).toString(16).slice(1));
function I(e, n = 0) {
  return (s[e[n + 0]] + s[e[n + 1]] + s[e[n + 2]] + s[e[n + 3]] + "-" + s[e[n + 4]] + s[e[n + 5]] + "-" + s[e[n + 6]] + s[e[n + 7]] + "-" + s[e[n + 8]] + s[e[n + 9]] + "-" + s[e[n + 10]] + s[e[n + 11]] + s[e[n + 12]] + s[e[n + 13]] + s[e[n + 14]] + s[e[n + 15]]).toLowerCase();
}
const O = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), y = {
  randomUUID: O
};
function l(e, n, o) {
  if (y.randomUUID && !n && !e)
    return y.randomUUID();
  e = e || {};
  const t = e.random || (e.rng || D)();
  if (t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, n) {
    o = o || 0;
    for (let r = 0; r < 16; ++r)
      n[o + r] = t[r];
    return n;
  }
  return I(t);
}
async function k(e, n) {
  const o = e.prepare(
    "SELECT * from TODOS WHERE sessionId = ?1;"
  ).bind(n), { results: t } = await o.all();
  return (t != null ? t : []).map(({ id: a, text: d, completed: i }) => ({
    id: a,
    text: d,
    completed: i === "true"
  }));
}
async function N(e, n, o) {
  const t = l(), r = {
    id: t,
    text: o,
    completed: !1
  };
  return await e.prepare(
    "INSERT INTO TODOS (id, text, completed, sessionId, date) VALUES (?1, ?2, 'false', ?3, ?4);"
  ).bind(t, o, n, new Date().toISOString()).run(), r;
}
async function f(e, n, o) {
  const t = o.map((i) => ({
    id: l(),
    text: i,
    completed: !1
  })), { statement: r, values: a } = t.reduce(
    ({ valueIdx: i, statement: u, values: c }, p, g, S) => ({
      statement: `${u} (?${++i}, ?${++i} ,'false', ?1, ?2)${g === S.length - 1 ? ";" : ","}`,
      valueIdx: i,
      values: [...c, p.id, p.text]
    }),
    {
      valueIdx: 2,
      statement: "INSERT INTO TODOS (id, text, completed, sessionId, date) VALUES",
      values: [n, new Date().toISOString()]
    }
  );
  return await e.prepare(r).bind(...a).run(), t;
}
async function $(e, n, o, t) {
  await e.prepare(
    `UPDATE TODOS
         SET completed = ?1
         WHERE id = ?2 AND sessionId = ?3;`
  ).bind(`${t}`, o, n).run();
}
async function x(e, n, o) {
  await e.prepare(
    "DELETE FROM TODOS WHERE id = ?1 AND sessionId = ?2;"
  ).bind(o, n).run();
}
const T = {
  empty: "A todo can't be empty or contain only spaces",
  wrongFormat: "only characters, spaces and numbers are allowed"
};
function V(e) {
  return e != null && e.trim() ? /[^a-zA-Z0-9 ]/.test(e) ? {
    valid: !1,
    reason: T.wrongFormat
  } : { valid: !0 } : { valid: !1, reason: T.empty };
}
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var E = v;
function v(e, n) {
  if (typeof e != "string")
    throw new TypeError("argument str must be a string");
  for (var o = {}, t = n || {}, r = t.decode || U, a = 0; a < e.length; ) {
    var d = e.indexOf("=", a);
    if (d === -1)
      break;
    var i = e.indexOf(";", a);
    if (i === -1)
      i = e.length;
    else if (i < d) {
      a = e.lastIndexOf(";", d - 1) + 1;
      continue;
    }
    var u = e.slice(a, d).trim();
    if (o[u] === void 0) {
      var c = e.slice(d + 1, i).trim();
      c.charCodeAt(0) === 34 && (c = c.slice(1, -1)), o[u] = h(c, r);
    }
    a = i + 1;
  }
  return o;
}
function U(e) {
  return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e;
}
function h(e, n) {
  try {
    return n(e);
  } catch {
    return e;
  }
}
const b = "d1TodosSessionId";
async function W(e, n) {
  const o = R(e);
  if (o)
    return o;
  const t = l();
  return await f(n, t, A), t;
}
function R(e) {
  var t;
  return E((t = e.headers.get("cookie")) != null ? t : "")[b];
}
const A = [
  "Create D1 database",
  "Write Cloudflare Worker",
  "Deploy to the SuperCloud"
], F = "https://blog.cloudflare.com/404";

const $$server_module0$1 = server$.createHandler(async function $$serverHandler0(_, {
  request,
  env
}) {
  const db = getTodosDb$1(env);
  const sessionId = await W(request, db);
  const todos = await k(db, sessionId);
  return {
    sessionId,
    todos
  };
}, "/_m/0dbe216f23/routeData");
server$.registerHandler("/_m/0dbe216f23/routeData", $$server_module0$1);
function routeData() {
  return createRouteData($$server_module0$1);
}
const $$server_module1$1 = server$.createHandler(async function $$serverHandler1(formData, {
  request,
  env
}) {
  const db = getTodosDb$1(env);
  const timestamp = new Date().getTime();
  const text = formData.get("text");
  const todoTextValidation = V(text);
  if (!todoTextValidation.valid) {
    return {
      error: todoTextValidation.reason,
      timestamp
    };
  }
  const sessionId = getSessionId$1(request);
  try {
    await N(db, sessionId, text);
  } catch {
    return {
      error: "DataBase Internal Error",
      timestamp
    };
  }
  return {
    timestamp
  };
}, "/_m/90d4313cf1/addTodoServerAction");
server$.registerHandler("/_m/90d4313cf1/addTodoServerAction", $$server_module1$1);
const $$server_module2$1 = server$.createHandler(async function $$serverHandler2(formData, {
  request,
  env
}) {
  const db = getTodosDb$1(env);
  const timestamp = new Date().getTime();
  const id = formData.get("todo-id");
  const completed = formData.get("completed");
  const sessionId = getSessionId$1(request);
  try {
    await $(db, sessionId, id, completed === "true");
  } catch {
    return {
      error: "DataBase Internal Error",
      timestamp
    };
  }
  return {
    timestamp
  };
}, "/_m/34a106c003/editTodoServerAction");
server$.registerHandler("/_m/34a106c003/editTodoServerAction", $$server_module2$1);
const $$server_module3$1 = server$.createHandler(async function $$serverHandler3(formData, {
  request,
  env
}) {
  const db = getTodosDb$1(env);
  const timestamp = new Date().getTime();
  const id = formData.get("todo-id");
  const sessionId = getSessionId$1(request);
  try {
    await x(db, sessionId, id);
  } catch {
    return {
      error: "DataBase Internal Error",
      timestamp
    };
  }
  return {
    timestamp
  };
}, "/_m/688bbd5a7c/deleteTodoServerAction");
server$.registerHandler("/_m/688bbd5a7c/deleteTodoServerAction", $$server_module3$1);
function getTodosDb$1(env) {
  const e = env;
  const db = e.__D1_BETA__D1_TODOS_DB ?? e.D1_TODOS_DB;
  if (!db) {
    throw new Error(`No D1_TODOS_DB binding found`);
  }
  return db;
}
function getSessionId$1(request) {
  const sessionId = R(request);
  if (!sessionId) {
    throw new FormError("Session id not provided");
  }
  return sessionId;
}

const _tmpl$$1 = ["<div", " class=\"new-todo-input-form-control\"><input", " type=\"text\" name=\"text\"", "><button", ">add todo</button></div>"],
  _tmpl$2$1 = ["<p", " class=\"backend-error\">", "</p>"],
  _tmpl$3 = ["<main", " class=\"todos-app\"><h1>Todos</h1><!--#-->", "<!--/--><!--#-->", "<!--/--><ul>", "</ul></main>"],
  _tmpl$4 = ["<input", " hidden name=\"todo-id\" readonly", ">"],
  _tmpl$5 = ["<input", " hidden name=\"completed\" readonly value=\"", "\">"],
  _tmpl$6 = ["<button", " role=\"checkbox\"", " class=\"", "\"></button>"],
  _tmpl$7 = ["<button", " class=\"delete-btn\" aria-label=\"delete\"></button>"],
  _tmpl$8 = ["<li", "><!--#-->", "<!--/--><span", ">", "</span><!--#-->", "<!--/--></li>"];
const $$server_module0 = server$.createHandler(async function $$serverHandler0(_, {
  request,
  env
}) {
  const db = getTodosDb(env);
  const sessionId = await W(request, db);
  const todos = await k(db, sessionId);
  return {
    sessionId,
    todos
  };
}, "/_m/0dbe216f23/routeData");
server$.registerHandler("/_m/0dbe216f23/routeData", $$server_module0);
const $$server_module1 = server$.createHandler(async function $$serverHandler1(formData, {
  request,
  env
}) {
  const db = getTodosDb(env);
  const timestamp = new Date().getTime();
  const text = formData.get("text");
  const todoTextValidation = V(text);
  if (!todoTextValidation.valid) {
    return {
      error: todoTextValidation.reason,
      timestamp
    };
  }
  const sessionId = getSessionId(request);
  try {
    await N(db, sessionId, text);
  } catch {
    return {
      error: "DataBase Internal Error",
      timestamp
    };
  }
  return {
    timestamp
  };
}, "/_m/90d4313cf1/addTodoServerAction");
server$.registerHandler("/_m/90d4313cf1/addTodoServerAction", $$server_module1);
const $$server_module2 = server$.createHandler(async function $$serverHandler2(formData, {
  request,
  env
}) {
  const db = getTodosDb(env);
  const timestamp = new Date().getTime();
  const id = formData.get("todo-id");
  const completed = formData.get("completed");
  const sessionId = getSessionId(request);
  try {
    await $(db, sessionId, id, completed === "true");
  } catch {
    return {
      error: "DataBase Internal Error",
      timestamp
    };
  }
  return {
    timestamp
  };
}, "/_m/34a106c003/editTodoServerAction");
server$.registerHandler("/_m/34a106c003/editTodoServerAction", $$server_module2);
const $$server_module3 = server$.createHandler(async function $$serverHandler3(formData, {
  request,
  env
}) {
  const db = getTodosDb(env);
  const timestamp = new Date().getTime();
  const id = formData.get("todo-id");
  const sessionId = getSessionId(request);
  try {
    await x(db, sessionId, id);
  } catch {
    return {
      error: "DataBase Internal Error",
      timestamp
    };
  }
  return {
    timestamp
  };
}, "/_m/688bbd5a7c/deleteTodoServerAction");
server$.registerHandler("/_m/688bbd5a7c/deleteTodoServerAction", $$server_module3);
function Home() {
  const data = useRouteData();
  const [newTodo, setNewTodo] = createSignal("");
  const [addTodoServerAction, {
    Form: AddTodoForm
  }] = createRouteAction($$server_module1);
  const [editTodoServerAction, {
    Form: EditTodoForm
  }] = createRouteAction($$server_module2);
  const [deleteTodoServerAction, {
    Form: DeleteTodoForm
  }] = createRouteAction($$server_module3);
  const [error, setError] = createSignal();
  return ssr(_tmpl$3, ssrHydrationKey(), escape(createComponent(AddTodoForm, {
    get children() {
      return ssr(_tmpl$$1, ssrHydrationKey(), ssrAttribute("class", !newTodo() || V(newTodo()).valid ? "" : "invalid", false), ssrAttribute("value", escape(newTodo(), true), false), ssrAttribute("disabled", !newTodo(), true));
    }
  })), escape(createComponent(Show, {
    get when() {
      return error();
    },
    get children() {
      return ssr(_tmpl$2$1, ssrHydrationKey(), escape(error()));
    }
  })), escape(createComponent(For, {
    get each() {
      return data()?.todos;
    },
    children: todo => {
      const id = () => todo.id;
      const text = () => todo.text;
      const completed = () => todo.completed;
      return ssr(_tmpl$8, ssrHydrationKey(), escape(createComponent(EditTodoForm, {
        get children() {
          return [ssr(_tmpl$4, ssrHydrationKey(), ssrAttribute("value", escape(id(), true), false)), ssr(_tmpl$5, ssrHydrationKey(), `${!escape(completed(), true)}`), ssr(_tmpl$6, ssrHydrationKey(), ssrAttribute("aria-checked", escape(completed(), true), false) + ssrAttribute("aria-label", escape(text(), true), false), `custom-checkbox ${completed() ? "checked" : ""}`)];
        }
      })), ssrAttribute("class", completed() ? "line-through" : "", false), escape(text()), escape(createComponent(DeleteTodoForm, {
        get children() {
          return [ssr(_tmpl$4, ssrHydrationKey(), ssrAttribute("value", escape(id(), true), false)), ssr(_tmpl$7, ssrHydrationKey())];
        }
      })));
    }
  })));
}
function getTodosDb(env) {
  const e = env;
  const db = e.__D1_BETA__D1_TODOS_DB ?? e.D1_TODOS_DB;
  if (!db) {
    throw new Error(`No D1_TODOS_DB binding found`);
  }
  return db;
}
function getSessionId(request) {
  const sessionId = R(request);
  if (!sessionId) {
    throw new FormError("Session id not provided");
  }
  return sessionId;
}

/// <reference path="../server/types.tsx" />
const fileRoutes = [{
  component: NotFound,
  path: "/*404"
}, {
  data: routeData,
  component: Home,
  path: "/"
}];

/**
 * Routes are the file system based routes, used by Solid App Router to show the current page according to the URL.
 */

const FileRoutes = () => {
  return fileRoutes;
};

const _tmpl$ = ["<header", " class=\"app-header\"><a href=\"https://start.solidjs.com/\" target=\"_blank\" rel=\"noreferrer\"><img src=\"solid-logo.svg\" alt=\"Solid logo\"></a></header>"],
  _tmpl$2 = ["<footer", " class=\"app-footer\"><span>D1 todos demo. For more details check out the <a", " target=\"_blank\" rel=\"noreferrer\">blog post<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"48\" width=\"48\" viewBox=\"0 0 48 48\"><path d=\"M9.9 41q-1.2 0-2.05-.85Q7 39.3 7 38.1V9.9q0-1.2.85-2.05Q8.7 7 9.9 7h12.55v2.25H9.9q-.25 0-.45.2t-.2.45v28.2q0 .25.2.45t.45.2h28.2q.25 0 .45-.2t.2-.45V25.55H41V38.1q0 1.2-.85 2.05-.85.85-2.05.85Zm9.3-10.6-1.6-1.6L37.15 9.25H26.5V7H41v14.5h-2.25V10.9Z\"></path></svg></a>.</span><span class=\"copyright\">&copy; 2023 Cloudflare.com</span></footer>"];
function Root() {
  return createComponent(Html, {
    lang: "en",
    get children() {
      return [createComponent(Head, {
        get children() {
          return [createComponent(Title, {
            children: "D1 Todos SolidStart"
          }), createComponent(Meta$1, {
            charset: "utf-8"
          }), createComponent(Meta$1, {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
          })];
        }
      }), createComponent(Body, {
        get children() {
          return [createComponent(Suspense, {
            get children() {
              return createComponent(ErrorBoundary, {
                get children() {
                  return [ssr(_tmpl$, ssrHydrationKey()), createComponent(Routes, {
                    get children() {
                      return createComponent(FileRoutes, {});
                    }
                  }), ssr(_tmpl$2, ssrHydrationKey(), ssrAttribute("href", escape(F, true), false))];
                }
              });
            }
          }), createComponent(Scripts, {})];
        }
      })];
    }
  });
}

const api = [
  {
    GET: "skip",
    path: "/*404"
  },
  {
    GET: "skip",
    path: "/"
  }
];
function routeToMatchRoute(route) {
  const segments = route.path.split("/").filter(Boolean);
  const params = [];
  const matchSegments = [];
  let score = route.path.endsWith("/") ? 4 : 0;
  let wildcard = false;
  for (const [index, segment] of segments.entries()) {
    if (segment[0] === ":") {
      const name = segment.slice(1);
      score += 3;
      params.push({
        type: ":",
        name,
        index
      });
      matchSegments.push(null);
    } else if (segment[0] === "*") {
      params.push({
        type: "*",
        name: segment.slice(1),
        index
      });
      wildcard = true;
    } else {
      score += 4;
      matchSegments.push(segment);
    }
  }
  return {
    ...route,
    score,
    params,
    matchSegments,
    wildcard
  };
}
const allRoutes = api.map(routeToMatchRoute).sort((a, b) => b.score - a.score);
registerApiRoutes(allRoutes);
function getApiHandler(url, method) {
  return getRouteMatches$1(allRoutes, url.pathname, method.toUpperCase());
}

const apiRoutes = ({ forward }) => {
  return async (event) => {
    let apiHandler = getApiHandler(new URL(event.request.url), event.request.method);
    if (apiHandler) {
      let apiEvent = Object.freeze({
        request: event.request,
        params: apiHandler.params,
        env: event.env,
        $type: FETCH_EVENT,
        fetch: internalFetch
      });
      try {
        return await apiHandler.handler(apiEvent);
      } catch (error) {
        if (error instanceof Response) {
          return error;
        }
        return new Response(JSON.stringify(error), {
          status: 500
        });
      }
    }
    return await forward(event);
  };
};

const inlineServerFunctions = ({ forward }) => {
  return async (event) => {
    const url = new URL(event.request.url);
    if (server$.hasHandler(url.pathname)) {
      let contentType = event.request.headers.get(ContentTypeHeader);
      let origin = event.request.headers.get(XSolidStartOrigin);
      let formRequestBody;
      if (contentType != null && contentType.includes("form") && !(origin != null && origin.includes("client"))) {
        let [read1, read2] = event.request.body.tee();
        formRequestBody = new Request(event.request.url, {
          body: read2,
          headers: event.request.headers,
          method: event.request.method,
          duplex: "half"
        });
        event.request = new Request(event.request.url, {
          body: read1,
          headers: event.request.headers,
          method: event.request.method,
          duplex: "half"
        });
      }
      let serverFunctionEvent = Object.freeze({
        request: event.request,
        fetch: internalFetch,
        $type: FETCH_EVENT,
        env: event.env
      });
      const serverResponse = await handleServerRequest(serverFunctionEvent);
      let responseContentType = serverResponse.headers.get(XSolidStartContentTypeHeader);
      if (formRequestBody && responseContentType !== null && responseContentType.includes("error")) {
        const formData = await formRequestBody.formData();
        let entries = [...formData.entries()];
        return new Response(null, {
          status: 302,
          headers: {
            Location: new URL(event.request.headers.get("referer") || "").pathname + "?form=" + encodeURIComponent(
              JSON.stringify({
                url: url.pathname,
                entries,
                ...await serverResponse.json()
              })
            )
          }
        });
      }
      return serverResponse;
    }
    const response = await forward(event);
    return response;
  };
};

const rootData = Object.values(/* #__PURE__ */ Object.assign({}))[0];
const dataFn = rootData ? rootData.default : undefined;

/** Function responsible for listening for streamed [operations]{@link Operation}. */

/** This composes an array of Exchanges into a single ExchangeIO function */
const composeMiddleware = exchanges => ({
  forward
}) => exchanges.reduceRight((forward, exchange) => exchange({
  forward
}), forward);
function createHandler(...exchanges) {
  const exchange = composeMiddleware([apiRoutes, inlineServerFunctions, ...exchanges]);
  return async event => {
    return await exchange({
      forward: async op => {
        return new Response(null, {
          status: 404
        });
      }
    })(event);
  };
}
function StartRouter(props) {
  return createComponent(Router, props);
}
const docType = ssr("<!DOCTYPE html>");
function StartServer({
  event
}) {
  const parsed = new URL(event.request.url);
  const path = parsed.pathname + parsed.search;

  // @ts-ignore
  sharedConfig.context.requestContext = event;
  return createComponent(ServerContext.Provider, {
    value: event,
    get children() {
      return createComponent(MetaProvider, {
        get tags() {
          return event.tags;
        },
        get children() {
          return createComponent(StartRouter, {
            url: path,
            get out() {
              return event.routerContext;
            },
            location: path,
            get prevLocation() {
              return event.prevUrl;
            },
            data: dataFn,
            routes: fileRoutes,
            get children() {
              return [docType, createComponent(Root, {})];
            }
          });
        }
      });
    }
  });
}

const entryServer = createHandler(renderAsync(event => createComponent(StartServer, {
  event: event
})));

const onRequestGet = async ({ request, next, env }) => {
  // Handle static assets
  if (/\.\w+$/.test(request.url)) {
    let resp = await next(request);
    if (resp.status === 200 || 304) {
      return resp;
    }
  }

  env.manifest = manifest;
  env.next = next;
  env.getStaticHTML = async path => {
    return next();
  };
  return entryServer({
    request: request,
    env
  });
};

const onRequestHead = async ({ request, next, env }) => {
  // Handle static assets
  if (/\.\w+$/.test(request.url)) {
    let resp = await next(request);
    if (resp.status === 200 || 304) {
      return resp;
    }
  }

  env.manifest = manifest;
  env.next = next;
  env.getStaticHTML = async path => {
    return next();
  };
  return entryServer({
    request: request,
    env
  });
};

async function onRequestPost({ request, env }) {
  // Allow for POST /_m/33fbce88a9 server function
  env.manifest = manifest;
  return entryServer({
    request: request,
    env
  });
}

async function onRequestDelete({ request, env }) {
  // Allow for POST /_m/33fbce88a9 server function
  env.manifest = manifest;
  return entryServer({
    request: request,
    env
  });
}

async function onRequestPatch({ request, env }) {
  // Allow for POST /_m/33fbce88a9 server function
  env.manifest = manifest;
  return entryServer({
    request: request,
    env
  });
}

export { onRequestDelete, onRequestGet, onRequestHead, onRequestPatch, onRequestPost };
