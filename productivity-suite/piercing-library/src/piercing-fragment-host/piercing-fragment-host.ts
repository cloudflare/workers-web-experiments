import {
  DispatchOptions,
  getBus,
  MessageBus,
  MessageHandler,
} from "../message-bus";

// Important: we only need to import the type, do not import the class itself
//            as it would bloat the script (which needs to be very light)
import type { PiercingFragmentOutlet } from "../piercing-fragment-outlet";

export class PiercingFragmentHost extends HTMLElement implements MessageBus {
  private parentMessageBus!: MessageBus;
  fragmentId!: string;
  queueEventListener?: (event: Event) => void;
  stylesEmbeddingObserver?: MutationObserver;

  constructor() {
    super();
  }

  private messageHandlerRemovers: (() => void)[] = [];

  listen(handler: MessageHandler) {
    const remover = this.parentMessageBus.listen(handler);
    this.messageHandlerRemovers.push(remover);
    return remover;
  }

  dispatch(
    eventName: any,
    details: any,
    dispatchOptions: DispatchOptions = {}
  ) {
    this.parentMessageBus.dispatch(eventName, details, dispatchOptions);
  }

  connectedCallback() {
    this.parentMessageBus = getBus(this);
    this.fragmentId = this.getAttribute("fragment-id")!;

    if (!this.fragmentIsPierced) {
      this.setStylesEmbeddingObserver();
    }
  }

  disconnectedCallback() {
    this.messageHandlerRemovers.forEach((remover) => remover());
  }

  async onPiercingComplete(outlet: PiercingFragmentOutlet) {
    this.removeStylesEmbeddingObserver();
  }

  private get fragmentIsPierced() {
    return (this.parentElement as any).piercingFragmentOutlet;
  }

  private setStylesEmbeddingObserver() {
    this.stylesEmbeddingObserver = new MutationObserver((mutationsList) => {
      const elementsHaveBeenAdded = mutationsList.some((mutationRecord) => {
        for (const addedNode of mutationRecord.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            return true;
          }
        }
        return false;
      });
      if (elementsHaveBeenAdded) {
        // if any element has been added then we need to make sure that
        // there aren't external css links (and embed them if there are)
        this.embedStyles();
      }
    });
    this.stylesEmbeddingObserver.observe(this, {
      childList: true,
      subtree: true,
    });
  }

  private removeStylesEmbeddingObserver() {
    this.stylesEmbeddingObserver?.disconnect();
    this.stylesEmbeddingObserver = undefined;
  }

  private embedStyles() {
    this.querySelectorAll('link[href][rel="stylesheet"]').forEach((el) => {
      const styleLink = el as HTMLStyleElement;
      if (styleLink.sheet) {
        let rulesText = "";
        for (const { cssText } of styleLink.sheet.cssRules) {
          rulesText += cssText + "\n";
        }
        const styleElement = document.createElement("style");
        styleElement.textContent = rulesText;
        styleLink.replaceWith(styleElement);
      }
    });
  }
}
