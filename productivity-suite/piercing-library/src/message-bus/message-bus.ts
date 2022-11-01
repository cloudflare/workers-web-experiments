export type MessageBusCallback = (value: any) => void;

export type MessageBusState = Record<string, any>;

export interface MessageBus {
  state: MessageBusState;
  dispatch(eventName: string, value: any): void;
  listen(
    eventName: string,
    callback: (value: any) => void
  ): (() => void) | null;
  latestValue(eventName: string): any;
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
    callbacksForEvent.forEach((callback) => callback(value));
  }

  listen(eventName: string, callback: MessageBusCallback) {
    const latestValue = this.latestValue(eventName);
    if (latestValue) {
      callback(latestValue);
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

  latestValue(eventName: string) {
    return this._state[eventName];
  }
}
