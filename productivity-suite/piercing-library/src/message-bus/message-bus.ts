export type MessageBusCallback<T = any> = (value: T) => void;

export type MessageBusState = Record<string, any>;

export interface MessageBus {
  state: MessageBusState;
  dispatch(eventName: string, value: any): void;
  listen<T = any>(
    eventName: string,
    callback: (value: T | undefined) => void
  ): () => void;
  latestValue<T = any>(eventName: string): T | undefined;
}

export class GenericMessageBus implements MessageBus {
  protected _callbacksMap: Map<string, MessageBusCallback[]> = new Map();

  constructor(protected _state: MessageBusState = {}) {}

  get state(): MessageBusState {
    return JSON.parse(JSON.stringify(this._state));
  }

  dispatch(eventName: string, value: any) {
    this._state[eventName] = value;
    const callbacksForEvent = this._callbacksMap.get(eventName) ?? [];
    setTimeout(
      () => callbacksForEvent.forEach((callback) => callback(value)),
      1
    );
  }

  listen<T = any>(eventName: string, callback: MessageBusCallback<T>) {
    const latestValue = this.latestValue(eventName);
    if (latestValue) {
      setTimeout(() => callback(latestValue), 1);
    }
    if (!this._callbacksMap.has(eventName)) {
      this._callbacksMap.set(eventName, []);
    }
    this._callbacksMap.get(eventName)!.push(callback);
    return () => {
      const callbacks = this._callbacksMap.get(eventName)!;
      this._callbacksMap.set(
        eventName,
        callbacks.filter((h) => h !== callback)
      );
    };
  }

  latestValue<T = any>(eventName: string): T {
    return this._state[eventName];
  }
}
