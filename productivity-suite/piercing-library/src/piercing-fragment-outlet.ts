import { DOMAttributes } from "react";
import WritableDOMStream from "writable-dom";
import { getBus } from "./message-bus/get-bus";

import { PiercingFragmentHost } from "./piercing-fragment-host/piercing-fragment-host";

/**
 * Registers the "piercing-fragment-outlet" web component so that it can be used throughout
 * the application.
 */
export function registerPiercingFragmentOutlet() {
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
    // We need to dispatch a qinit so that Qwik can run different necessary
    // checks/logic on Qwik fragments (which it would otherwise not with this
    // fragments implementation).
    // (for more info see: https://github.com/BuilderIO/qwik/issues/1947)
    document.dispatchEvent(new Event("qinit"));
  }

  disconnectedCallback() {
    unmountedFragmentIds.add(this.fragmentId);
  }

  private pierceFragmentIntoDOM(fragmentHost: PiercingFragmentHost) {
    this.innerHTML == "";
    fragmentHost.pierceInto(this);
    const fragmentsToPierce =
      getBus().latestValue<number>("fragmentsToPierce")!;
    getBus().dispatch("fragmentsToPierce", fragmentsToPierce - 1);
  }

  private async fetchFragmentStream() {
    const url = this.getFragmentUrl();
    const state = getBus().state;

    const req = new Request(url, {
      headers: {
        "message-bus-state": JSON.stringify(state),
      },
    });
    const response = await fetch(req);
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
