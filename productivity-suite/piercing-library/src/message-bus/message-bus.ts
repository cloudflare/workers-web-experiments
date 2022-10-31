export type MessageHandler = {
  eventName: string;
  callback: (detail: any) => void;
  options?: { once?: boolean };
};

export type MessageBusState = Record<string, { detail: any }>;

export class MessageBus {
  protected _handlers: MessageHandler[] = [];

  constructor(protected _state: MessageBusState) {}

  get state(): MessageBusState {
    return JSON.parse(JSON.stringify(this._state));
  }

  dispatch(eventName: string, detail: any) {
    this._state[eventName] = { detail };
    const handlersForEvent = this._handlers.filter(
      ({ eventName: handlerEventName }) => handlerEventName === eventName
    );
    const handlersToRemove: MessageHandler[] = [];
    handlersForEvent.forEach((handler) => {
      handler.callback(detail);
      if (handler.options?.once) {
        handlersToRemove.push(handler);
      }
    });
    this._handlers = this._handlers.filter(
      (handler) => !handlersToRemove.includes(handler)
    );
  }

  listen(handler: MessageHandler) {
    const lastMessage = this._state[handler.eventName];
    if (lastMessage) {
      handler.callback(lastMessage.detail);
      if (handler.options?.once) {
        return null;
      }
    }
    this._handlers.push(handler);
    return () => {
      this._handlers = this._handlers.filter((h) => h !== handler);
    };
  }
}

export class BrowserMessageBus extends MessageBus {}

export function createBrowserMessageBusFromStateStr(stateStr: string) {
  const state = JSON.parse(stateStr ?? "{}");
  (globalThis as any as { [messageBusProp]?: MessageBus })[messageBusProp] =
    new BrowserMessageBus(state);
}

export class ServerSideMessageBus extends MessageBus {}

export function getMessageBusStateFromRequest(request: Request) {
  const stateHeaderStr = request.headers.get("message-bus-state");
  return JSON.parse(stateHeaderStr ?? "{}");
}

export function createServerSideMessageBusFromRequest(request: Request) {
  const state = getMessageBusStateFromRequest(request);
  (globalThis as any as { [messageBusProp]?: MessageBus })[messageBusProp] =
    new ServerSideMessageBus(state);
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

  throw new Error("No global message bus defined!");
}

function hasMessageBus<T>(obj: T): obj is T & { [messageBusProp]: MessageBus } {
  return !!obj && messageBusProp in obj;
}
