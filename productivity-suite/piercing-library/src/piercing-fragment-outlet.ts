import { DOMAttributes } from "react";
import WritableDOMStream from "writable-dom";
import { getBus } from "./message-bus/get-bus";

import { PiercingFragmentHost } from "./piercing-fragment-host/piercing-fragment-host";

/**
 * Some functions dispatching events need to be delayed so that consumers
 * of the web-component won't receive events immediately as soon as the component
 * is added to the DOM, such behavior can cause different type of issues in ui
 * frameworks.
 *
 * The initDelayForUi variable is used to provide such delay, and it can be set when
 * the outlet is registered via `registerPiercingFragmentOutlet` allowing different
 * delays for different frameworks if need be (via experimentation it seems like 1
 * millisecond is enough for React applications, that is why that is the default value)
 */
const defaultInitDelayForUi = 1;
let initDelayForUi = defaultInitDelayForUi;

/**
 * Registers the "piercing-fragment-outlet" web component so that it can be used throughout
 * the application.
 *
 * @param Options Configuration object which can contain an optional initial delay for the
 *                interactivity of fragments. Needed in case the fragment outlets' consumer
 *                can't accept (queued) events as soon as fragments are added to the DOM.
 */
export function registerPiercingFragmentOutlet({
  initDelay,
}: { initDelay?: number } = {}) {
  initDelayForUi = initDelay ?? defaultInitDelayForUi;
  window.customElements.define(
    "piercing-fragment-outlet",
    PiercingFragmentOutlet
  );
}

/**
 * Set of ids of fragments that have been previously unmounted.
 *
 * We keep track of this for a single purpose, preventing the
 * extra running of type module scripts for newly fetched fragments.
 *
 * (Meaning that when we fetch a fragment, we check if its id is in the
 * set, if it is then we need to run its type module scripts manually,
 * otherwise the scripts get normally evaluated by the browser).
 *
 */
const unmountedFragmentIds: Set<string> = new Set();

export class PiercingFragmentOutlet extends HTMLElement {
  // this field can be read from the outside to check if this element
  // is a PiercingFragmentOutlet (without relying on `instanceof`)
  // @ts-ignore - the following field is not only being used by the `isPiercingFragmentOutlet` guard
  private readonly piercingFragmentOutlet = true;

  private fragmentId!: string;

  constructor() {
    super();
  }

  async connectedCallback() {
    const fragmentId = this.getAttribute("fragment-id");

    if (!fragmentId) {
      throw new Error(
        "The fragment outlet component has been applied without" +
          " providing a fragment-id"
      );
    }

    this.fragmentId = fragmentId;

    let fragmentHost = this.getFragmentHost();

    if (fragmentHost) {
      this.pierceFragmentIntoDOM(fragmentHost);
    } else {
      const fragmentStream = await this.fetchFragmentStream();
      await this.streamFragmentIntoOutlet(fragmentStream);
      fragmentHost = this.getFragmentHost(true);
    }

    if (!fragmentHost) {
      throw new Error(
        `The fragment with id "${this.fragmentId}" is not present and` +
          " it could not be fetched"
      );
    }
  }

  disconnectedCallback() {
    unmountedFragmentIds.add(this.fragmentId);
  }

  private pierceFragmentIntoDOM(contentWrapper: Element) {
    this.innerHTML == "";

    const activeElementWithinFragmentContent = contentWrapper.contains(
      document.activeElement
    )
      ? (document.activeElement as HTMLElement)
      : null;

    this.appendChild(contentWrapper);
    activeElementWithinFragmentContent?.focus();
  }

  private async fetchFragmentStream() {
    const url = this.getFragmentUrl();
    setTimeout(
      () => this.dispatchEvent(new CustomEvent("FetchingStarted")),
      initDelayForUi
    );

    const state = getBus(null).state;

    const req = new Request(url, {
      headers: {
        "message-bus-state": JSON.stringify(state),
      },
    });
    const response = await fetch(req);
    this.dispatchEvent(new CustomEvent("FetchingCompleted"));
    if (!response.body) {
      throw new Error(
        "An empty response has been provided when fetching" +
          `the fragment with id ${this.fragmentId}`
      );
    }
    return response.body;
  }

  private getFragmentUrl(): string {
    return `/piercing-fragment/${this.fragmentId}`;
  }

  private async streamFragmentIntoOutlet(fragmentStream: ReadableStream) {
    await fragmentStream
      .pipeThrough(new TextDecoderStream())
      .pipeTo(new WritableDOMStream(this as ParentNode));

    this.reapplyFragmentModuleScripts();
  }

  private reapplyFragmentModuleScripts() {
    const fragmentHasPreviouslyBeenUnmounted = unmountedFragmentIds.has(
      this.fragmentId
    );

    if (fragmentHasPreviouslyBeenUnmounted) {
      this.querySelectorAll("script").forEach((script) => {
        if (script.src && script.type === "module") {
          import(/* @vite-ignore */ script.src).then((scriptModule) =>
            scriptModule.default?.()
          );
        }
      });
    }
  }

  private getFragmentHost(insideOutlet = false): PiercingFragmentHost | null {
    return (insideOutlet ? this : document).querySelector(
      `piercing-fragment-host[fragment-id="${this.fragmentId}"]`
    );
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "piercing-fragment-outlet": PiercingFragmentOutletAttributes;
    }

    type PiercingFragmentOutletAttributes = { "fragment-id": string } & Partial<
      PiercingFragmentOutlet &
        DOMAttributes<PiercingFragmentOutlet> & {
          "fragment-fetch-params"?: string;
          [onProp: `on${string}`]: Function | undefined;
        }
    >;
  }
}
