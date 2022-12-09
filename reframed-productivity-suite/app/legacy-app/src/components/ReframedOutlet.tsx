import { useEffect } from "react";

let destroyIframe = function noop(noop = false) {
  void noop;
};

export function reframedInit(
  containerId: string,
  options: { src: string } | { srcdoc: string }
) {
  const target = document.getElementById(containerId)!;

  const iframe = document.createElement("iframe");
  if ("srcdoc" in options) {
    iframe.srcdoc = options.srcdoc;
  } else {
    iframe.src = options.src;
  }

  // Hide the iframe before it gets reframed
  iframe.setAttribute("style", "display: none");

  document.body.appendChild(iframe);

  const reframedContainerSymbol = Symbol.for(containerId);
  const iWindow = iframe.contentWindow!;
  Reflect.set(iWindow, reframedContainerSymbol, target);

  return function destroyIframe(clearReframedContainer = true) {
    iframe.remove();
    if (clearReframedContainer) {
      target.innerHTML = "";
    }
  };
}

type OutletProps = {
  fragmentId: string;
};

export const ReframedOutlet: React.FC<OutletProps> = ({ fragmentId }) => {
  const containerId = `reframedContainer_${fragmentId}`;

  useEffect(() => {
    destroyIframe = reframedInit(containerId, {
      src: `/piercing-fragment/${fragmentId}`,
    });

    return () => {
      destroyIframe();
    };
  }, []);

  return <div id={containerId} />;
};
