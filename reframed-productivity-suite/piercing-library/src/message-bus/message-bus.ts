export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: JSONValue;
    }
  | Array<JSONValue>;

export type MessageBusState = Record<string, JSONValue>;

export type MessageBusCallback<T extends JSONValue> = (value: T) => void;

/**
 * Interface representing a generic isomorphic message bus.
 */
export interface MessageBus {
  /** The state of the message bus instance. */
  state: MessageBusState;
  /**
   * Dispatches a new event to the message bus.
   *
   * @param eventName The name of the event type to dispatch.
   * @param value The value of the event to dispatch
   *              (note: this needs to be a JSON value so
   *               that it can be serialized into a string).
   */
  dispatch(eventName: string, value: JSONValue): void;
  /**
   * Registers a listener to the message bus for a specific event type.
   *
   * @param eventName The name of the event type to listen to.
   * @param callback The function to register (which will be invoked every time a
   *                 new value for the event type is dispatched).
   * @returns a remover function to call when the listener is no longer necessary
   *          (needed to avoid memory leaks).
   */
  listen<T extends JSONValue>(
    eventName: string,
    callback: (value: T) => void
  ): () => void;
  /**
   * Gets the latest value present in the message bus state for an event type.
   *
   * @param eventName The name of the event type.
   * @returns The last value for the event, or `undefined` if such value is not present.
   */
  latestValue<T extends JSONValue>(eventName: string): T | undefined;
}

export class GenericMessageBus implements MessageBus {
  protected _callbacksMap: Map<string, MessageBusCallback<JSONValue>[]> =
    new Map();

  constructor(protected _state: MessageBusState = {}) {}

  get state(): MessageBusState {
    return JSON.parse(JSON.stringify(this._state));
  }

  dispatch(eventName: string, value: JSONValue) {
    this._state[eventName] = value;
    const callbacksForEvent = this._callbacksMap.get(eventName) ?? [];
    setTimeout(
      () => callbacksForEvent.forEach((callback) => callback(value)),
      1
    );
  }

  listen<T extends JSONValue>(
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
    this._callbacksMap
      .get(eventName)!
      .push(callback as MessageBusCallback<JSONValue>);
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

  latestValue<T extends JSONValue>(eventName: string) {
    return this._state[eventName] as T | undefined;
  }
}
