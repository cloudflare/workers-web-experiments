export type MessageHandler = {
  eventName: string;
  callback: (detail: any) => void;
  options?: { once?: boolean };
};

export type MessageBusState = Record<string, { detail: any }>;

export interface MessageBus {
  state: MessageBusState;
  dispatch(eventName: string, detail: any): void;
  listen(handler: MessageHandler): (() => void) | null;
}

export class GenericMessageBus implements MessageBus {
  protected _handlers: MessageHandler[] = [];

  constructor(protected _state: MessageBusState = {}) {}

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
