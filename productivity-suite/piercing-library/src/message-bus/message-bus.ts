export type MessageBusValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: MessageBusValue;
    }
  | Array<MessageBusValue>;

export type MessageBusState = Record<string, any>;

export type MessageBusCallback<T extends MessageBusValue> = (value: T) => void;

export interface MessageBus {
  state: MessageBusState;
  dispatch(eventName: string, value: MessageBusValue): void;
  listen<T extends MessageBusValue>(
    eventName: string,
    callback: (value: T) => void
  ): () => void;
  latestValue<T extends MessageBusValue>(eventName: string): T | undefined;
}

export class GenericMessageBus implements MessageBus {
  protected _callbacksMap: Map<string, MessageBusCallback<any>[]> = new Map();

  constructor(protected _state: MessageBusState = {}) {}

  get state(): MessageBusState {
    return JSON.parse(JSON.stringify(this._state));
  }

  dispatch(eventName: string, value: MessageBusValue) {
    this._state[eventName] = value;
    const callbacksForEvent = this._callbacksMap.get(eventName) ?? [];
    setTimeout(
      () => callbacksForEvent.forEach((callback) => callback(value)),
      1
    );
  }

  listen<T extends MessageBusValue>(
    eventName: string,
    callback: MessageBusCallback<T>
  ) {
    const latestValue = this.latestValue<T>(eventName);
    if (latestValue !== undefined) {
      setTimeout(() => callback(latestValue), 1);
    }
    if (!this._callbacksMap.has(eventName)) {
      this._callbacksMap.set(eventName, []);
    }
    this._callbacksMap.get(eventName)!.push(callback);
    return () => {
      const callbacks = (this._callbacksMap.get(eventName) ?? []).filter(
        (h) => h !== callback
      );
      if (callbacks.length) {
        this._callbacksMap.set(eventName, callbacks);
      } else {
        this._callbacksMap.delete(eventName);
      }
    };
  }

  latestValue<T extends MessageBusValue>(eventName: string): T | undefined {
    return this._state[eventName] ?? undefined;
  }
}
