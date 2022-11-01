export type MessageHandler = {
  eventName: string;
  callback: (value: any) => void;
};

export type MessageBusState = Record<string, any>;

export interface MessageBus {
  state: MessageBusState;
  dispatch(eventName: string, value: any): void;
  listen(handler: MessageHandler): (() => void) | null;
  latestValue(eventName: string): any;
}

export class GenericMessageBus implements MessageBus {
  protected _handlers: MessageHandler[] = [];

  constructor(protected _state: MessageBusState = {}) {}

  get state(): MessageBusState {
    return JSON.parse(JSON.stringify(this._state));
  }

  dispatch(eventName: string, value: any) {
    this._state[eventName] = value;
    const handlersForEvent = this._handlers.filter(
      ({ eventName: handlerEventName }) => handlerEventName === eventName
    );
    const handlersToRemove: MessageHandler[] = [];
    handlersForEvent.forEach((handler) => {
      handler.callback(value);
    });
    this._handlers = this._handlers.filter(
      (handler) => !handlersToRemove.includes(handler)
    );
  }

  listen(handler: MessageHandler) {
    const latestValue = this.latestValue(handler.eventName);
    if (latestValue) {
      handler.callback(latestValue);
    }
    this._handlers.push(handler);
    return () => {
      this._handlers = this._handlers.filter((h) => h !== handler);
    };
  }

  latestValue(eventName: string) {
    return this._state[eventName];
  }
}
