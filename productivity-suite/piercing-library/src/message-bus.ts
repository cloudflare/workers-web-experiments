export type MessageHandler = {
  eventName: string;
  callback: (detail: any) => void;
};

export type DispatchOptions = { singleUse?: boolean };

export interface MessageBus {
  dispatch(eventName: string, detail?: any, options?: DispatchOptions): void;
  listen(handler: MessageHandler): () => void;
}

export class BrowserMessageBus implements MessageBus {
  lastMessagesMap = new Map<
    string,
    { detail: any; dispatchOptions?: DispatchOptions } | null
  >();
  handlers: MessageHandler[] = [];

  dispatch(eventName: string, detail: any, dispatchOptions: DispatchOptions) {
    const handlersForEvent = this.handlers.filter(
      ({ eventName: handlerEventName }) => handlerEventName === eventName
    );
    handlersForEvent.forEach(({ callback }) => callback(detail));
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
    }
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
}

// export class ServerSideMessageBus implements MessageBus {
//   constructor(request: Request) {}
//   dispatch(eventName: string, detail: any): void {
//     throw new Error("Method not implemented.");
//   }
//   listen(eventName: string, callback: () => void) {
//     return () => {};
//   }
// }

type WithOptionalMessageBus<T> = T & { messageBus?: MessageBus };

export function getBus(element: Element): MessageBus {
  let tmpEl: WithOptionalMessageBus<Element> | null = element;
  while (tmpEl && tmpEl.messageBus === undefined) {
    tmpEl = tmpEl.parentElement;
  }

  if (tmpEl?.messageBus) return tmpEl.messageBus;

  const gThis = globalThis as WithOptionalMessageBus<typeof globalThis>;
  if (!gThis.messageBus) {
    // TODO: on the server this needs to be the server side message bus!
    gThis.messageBus = new BrowserMessageBus();
  }

  return gThis.messageBus;
}
