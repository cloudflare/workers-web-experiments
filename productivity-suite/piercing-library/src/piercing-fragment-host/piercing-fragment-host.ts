// Important: we only need to import the type, do not import the class itself
//            as it would bloat the script (which needs to be very light)
import type { PiercingFragmentOutlet } from "../piercing-fragment-outlet";

// The following two files are to be kept lean as well to keep the inline script small
import { messageBusProp } from "../message-bus/message-bus-prop";
import { FragmentMessageBus } from "../message-bus/fragment-message-bus";
import { getBus } from "../message-bus/get-bus";

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
      increaseFragmentsToPierceCount();
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
    decreaseFragmentsToPierceCount();
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

function increaseFragmentsToPierceCount() {
  const fragmentsToPierce =
    getBus().latestValue<number>("fragmentsToPierce") ?? 0;
  getBus().dispatch("fragmentsToPierce", fragmentsToPierce + 1);
}

function decreaseFragmentsToPierceCount() {
  const fragmentsToPierce =
    getBus().latestValue<number>("fragmentsToPierce") ?? 0;
  getBus().dispatch("fragmentsToPierce", Math.max(0, fragmentsToPierce - 1));
}
