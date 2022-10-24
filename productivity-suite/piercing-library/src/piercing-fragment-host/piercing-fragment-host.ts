import type { PiercingEvent } from "../piercing-events";
import { piercingEventType } from "../piercing-events";

// Important: we only need to import the type, do not import the class itself
//            as it would bloat the script (which needs to be very light)
import type { PiercingFragmentOutlet } from "../piercing-fragment-outlet";

export class PiercingFragmentHost extends HTMLElement {
	fragmentId!: string;
	piercingEventsQueue: CustomEvent<PiercingEvent>[] = [];
	queueEventListener?: (event: Event) => void;
	stylesEmbeddingObserver?: MutationObserver;

	constructor() {
		super();
	}

	async connectedCallback() {
		this.fragmentId = this.getAttribute("fragment-id")!;

		this.setQueueEventListener();

		if (!this.fragmentIsPierced) {
			this.setStylesEmbeddingObserver();
		}
	}

	async onPiercingComplete(outlet: PiercingFragmentOutlet) {
		await this.flushPiercingEventsQueue(outlet);
		this.removeQueueEventListener();
		this.removeStylesEmbeddingObserver();
	}

	private get fragmentIsPierced() {
		return (this.parentElement as any).piercingFragmentOutlet;
	}

	private async flushPiercingEventsQueue(outlet: PiercingFragmentOutlet) {
		while (this.piercingEventsQueue.length) {
			const piercingEvent = this.piercingEventsQueue.shift()!;
			await new Promise<void>((resolve) => {
				outlet.dispatchEvent(piercingEvent);
				resolve();
			});
		}
	}

	private setQueueEventListener() {
		if (!this.fragmentIsPierced) {
			this.queueEventListener = (event: Event) => {
				if (event.type === piercingEventType) {
					event.stopPropagation();
					this.piercingEventsQueue.push(event as CustomEvent<PiercingEvent>);
				}
			};
			this.addEventListener(piercingEventType, this.queueEventListener);
		}
	}

	private removeQueueEventListener() {
		if (this.queueEventListener) {
			this.removeEventListener(piercingEventType, this.queueEventListener);
			this.queueEventListener = undefined;
		}
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
