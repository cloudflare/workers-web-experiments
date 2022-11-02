import { getBus } from "./get-bus";
import type {
  MessageBus,
  MessageBusCallback,
  MessageBusValue,
} from "./message-bus";

export class FragmentMessageBus implements MessageBus {
  private parentBus: MessageBus;
  private callbackRemovers: (() => void)[] = [];

  constructor(host: Element) {
    this.parentBus = getBus(host.parentElement!);
  }

  get state() {
    return this.parentBus.state;
  }

  dispatch(eventName: string, value: any) {
    return this.parentBus.dispatch(eventName, value);
  }

  listen<T extends MessageBusValue>(
    eventName: string,
    callback: MessageBusCallback<T>
  ) {
    const callbackRemover = this.parentBus.listen(eventName, callback);
    this.callbackRemovers.push(callbackRemover);
    return () => {
      this.callbackRemovers = this.callbackRemovers.filter(
        (remover) => remover !== callbackRemover
      );
      callbackRemover();
    };
  }

  clearAllHandlers() {
    for (const callbackRemover of this.callbackRemovers) {
      callbackRemover();
    }
    this.callbackRemovers = [];
  }

  latestValue<T extends MessageBusValue>(eventName: string) {
    return this.parentBus.latestValue<T>(eventName);
  }
}
