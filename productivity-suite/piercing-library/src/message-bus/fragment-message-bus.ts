import { getBus } from "./get-bus";
import type { MessageBus, MessageHandler } from "./message-bus";

export class FragmentMessageBus implements MessageBus {
  private parentBus: MessageBus;
  private handlerRemovers: (() => void)[] = [];

  constructor(host: Element) {
    this.parentBus = getBus(host.parentElement!);
  }

  get state() {
    return this.parentBus.state;
  }

  dispatch(eventName: string, detail: any) {
    return this.parentBus.dispatch(eventName, detail);
  }

  listen(handler: MessageHandler) {
    const handlerRemover = this.parentBus.listen(handler);
    if (handlerRemover) {
      this.handlerRemovers.push(handlerRemover);
    }
    return handlerRemover;
  }

  clearAllHandlers() {
    for (const handlerRemover of this.handlerRemovers) {
      handlerRemover();
    }
    this.handlerRemovers = [];
  }
}
