export type MessageHandler = {
  eventName: string;
  callback: (detail: any) => void;
  options?: { once?: boolean };
};

export type DispatchOptions = { singleUse?: boolean };

export type MessageBusContext = {
  [key: string]: { detail: any; dispatchOptions?: DispatchOptions } | null;
};

export class MessageBus {
  lastMessagesMap = new Map<
    string,
    { detail: any; dispatchOptions?: DispatchOptions } | null
  >();
  handlers: MessageHandler[] = [];

  constructor(context: MessageBusContext) {
    for (const [key, value] of Object.entries(context)) {
      this.lastMessagesMap.set(key, value);
    }
  }

  get context(): MessageBusContext {
    const context: MessageBusContext = {};
    for (const [key, value] of this.lastMessagesMap.entries()) {
      context[key] = value;
    }
    return context;
  }

  dispatch(eventName: string, detail: any, dispatchOptions?: DispatchOptions) {
    const handlersForEvent = this.handlers.filter(
      ({ eventName: handlerEventName }) => handlerEventName === eventName
    );
    const handlersToRemove: MessageHandler[] = [];
    handlersForEvent.forEach((handler) => {
      handler.callback(detail);
      if (handler.options?.once) {
        handlersToRemove.push(handler);
      }
    });
    this.handlers = this.handlers.filter(
      (handler) => !handlersToRemove.includes(handler)
    );
    const eventConsumed = handlersForEvent.length && dispatchOptions?.singleUse;
    if (!eventConsumed) {
      this.lastMessagesMap.set(eventName, {
        detail,
        ...(dispatchOptions ? { dispatchOptions } : {}),
      });
    }
  }

  listen(handler: MessageHandler) {
    const lastMessage = this.lastMessagesMap.get(handler.eventName);
    if (lastMessage) {
      handler.callback(lastMessage.detail);
      if (lastMessage.dispatchOptions?.singleUse) {
        this.lastMessagesMap.set(handler.eventName, null);
      }
      if (handler.options?.once) {
        return null;
      }
    }
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
}

export class BrowserMessageBus extends MessageBus {
  constructor(context: {
    [key: string]: { detail: any; dispatchOptions?: DispatchOptions };
  }) {
    super(context);
  }

  get context(): MessageBusContext {
    const context: MessageBusContext = {};
    for (const [key, value] of this.lastMessagesMap.entries()) {
      context[key] = value;
    }
    return context;
  }

  dispatch(eventName: string, detail: any, dispatchOptions: DispatchOptions) {
    const handlersForEvent = this.handlers.filter(
      ({ eventName: handlerEventName }) => handlerEventName === eventName
    );
    const handlersToRemove: MessageHandler[] = [];
    handlersForEvent.forEach((handler) => {
      handler.callback(detail);
      if (handler.options?.once) {
        handlersToRemove.push(handler);
      }
    });
    this.handlers = this.handlers.filter(
      (handler) => !handlersToRemove.includes(handler)
    );
    const eventConsumed = handlersForEvent.length && dispatchOptions?.singleUse;
    if (!eventConsumed) {
      this.lastMessagesMap.set(eventName, {
        detail,
        ...(dispatchOptions ? { dispatchOptions } : {}),
      });
    }
  }

  listen(handler: MessageHandler) {
    const lastMessage = this.lastMessagesMap.get(handler.eventName);
    if (lastMessage) {
      handler.callback(lastMessage.detail);
      if (lastMessage.dispatchOptions?.singleUse) {
        this.lastMessagesMap.set(handler.eventName, null);
      }
      if (handler.options?.once) {
        return null;
      }
    }
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
}

export function createBrowserMessageBusFromContextStr(contextStr: string) {
  const context = JSON.parse(contextStr ?? "{}");
  (globalThis as any as { [messageBusProp]?: MessageBus })[messageBusProp] =
    new BrowserMessageBus(context);
}

export class ServerSideMessageBus extends MessageBus {
  constructor(context: {
    [key: string]: { detail: any; dispatchOptions?: DispatchOptions };
  }) {
    super(context);
  }
}

export function getMessageBusContextFromRequest(request: Request) {
  const contextHeaderStr = request.headers.get("message-bus-context");
  return JSON.parse(contextHeaderStr ?? "{}");
}

export function createServerSideMessageBusFromRequest(request: Request) {
  const context = getMessageBusContextFromRequest(request);
  (globalThis as any as { [messageBusProp]?: MessageBus })[messageBusProp] =
    new ServerSideMessageBus(context);
}

export const messageBusProp = Symbol.for("fragment-message-bus");

export function getBus(element: Element | null): MessageBus {
  while (element) {
    if (hasMessageBus(element)) {
      return element[messageBusProp];
    }
    element = element.parentElement;
  }
  const root = globalThis;

  if (hasMessageBus(root)) {
    return root[messageBusProp];
  }

  // Follows temporary code used only during development
  // (the final code should include only the (un)commented
  // error throw)
  // (globalThis as any)[messageBusProp] = new MessageBus({});
  return (globalThis as any)[messageBusProp];
  // throw new Error("No global message bus defined!");
}

function hasMessageBus<T>(obj: T): obj is T & { [messageBusProp]: MessageBus } {
  return !!obj && messageBusProp in obj;
}
