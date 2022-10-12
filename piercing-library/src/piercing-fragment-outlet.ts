import { DOMAttributes } from "react";
import WritableDOMStream from "writable-dom";

import { PiercingEvent, piercingEventType } from "./piercing-events";
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
	private customEventListener: EventListener | null = null;

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

		this.initializeCustomEventListener(fragmentHost);
	}

	disconnectedCallback() {
		this.removePiercingEventListener();

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
		const response = await fetch(url);
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
		const fragmentFetchBase = `/piercing-fragment/${this.fragmentId}`;

		const fragmentFetchParams = this.getFragmentFetchParams();

		const searchParamsStr = fragmentFetchParams
			? `?${new URLSearchParams([
					...Object.entries(fragmentFetchParams),
			  ]).toString()}`
			: "";

		return `${fragmentFetchBase}${searchParamsStr}`;
	}

	private getFragmentFetchParams(): { [key: string]: string } | null {
		const attribute = this.getAttribute("fragment-fetch-params");
		if (!attribute) {
			return null;
		}

		try {
			return JSON.parse(attribute);
		} catch (error: any) {
			console.error(error);
			return null;
		}
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

	private initializeCustomEventListener(fragmentHost: PiercingFragmentHost) {
		const piercingEventListener = ({ type, payload }: PiercingEvent) => {
			const pascalCaseEventType = type
				.replace(/(^.)|(-.)/g, (c) => c.toUpperCase())
				.replaceAll("-", "");
			this.dispatchEvent(
				new CustomEvent(pascalCaseEventType, { detail: payload })
			);
		};
		this.customEventListener = (({ detail }: CustomEvent<PiercingEvent>) =>
			piercingEventListener(detail)) as EventListener;

		this.addEventListener(piercingEventType, this.customEventListener);

		setTimeout(() => fragmentHost.onPiercingComplete(this), initDelayForUi);
	}

	private removePiercingEventListener() {
		if (this.customEventListener) {
			const fragmentHost = this.getFragmentHost(true);
			fragmentHost?.removeEventListener(
				piercingEventType,
				this.customEventListener
			);
		}
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
