// The following two files are to be kept lean as well to keep the inline script small
import { messageBusProp } from "../message-bus/message-bus-prop";
import { FragmentMessageBus } from "../message-bus/fragment-message-bus";

export class PiercingFragmentHost extends HTMLElement {
  private [messageBusProp] = new FragmentMessageBus(this);
  private cleanup = true;

  fragmentId!: string;
  queueEventListener?: (event: Event) => void;
  stylesEmbeddingObserver?: MutationObserver;

  connectedCallback() {
    const fragmentId = this.getAttribute("fragment-id");

    if (!fragmentId) {
      throw new Error(
        "The fragment outlet component has been applied without" +
          " providing a fragment-id"
      );
    }

    this.fragmentId = fragmentId;

    if (!this.fragmentIsPierced) {
      this.setStylesEmbeddingObserver();
    }
  }

  disconnectedCallback() {
    if (this.cleanup) {
      // Only remove handlers if we are actually in cleanup mode.
      this[messageBusProp].clearAllHandlers();
    }
  }

  pierceInto(element: Element) {
    const activeElement = this.contains(document.activeElement)
      ? (document.activeElement as HTMLElement)
      : null;

    // When we are simply moving the fragment (rather than destroying it)
    // we do not want to cleanup the event listeners.
    this.cleanup = false;
    element.appendChild(this);
    this.cleanup = true;

    activeElement?.focus();
  }

  onPiercingComplete() {
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
    this.querySelectorAll<HTMLStyleElement>(
      'link[href][rel="stylesheet"]'
    ).forEach((styleLink) => {
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
