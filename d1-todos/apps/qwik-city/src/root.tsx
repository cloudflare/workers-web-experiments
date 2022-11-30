import { component$, useStyles$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";

import styles from "shared/src/styles.css?inline";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  useStyles$(styles);

  return (
    <QwikCityProvider>
      <head>
        <title>D1 Todos QwikCity</title>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body lang="en">
        <header class="app-header">
          <img src="qwik-logo.svg" alt="Qwik logo" />
        </header>
        <RouterOutlet />
        <ServiceWorkerRegister />
        <footer class="app-footer">
          <span>
            D1 todos demo. For more details check out the{" "}
            {/* href to update when the blog-post url is known */}
            <a
              href="https://blog.cloudflare.com/404"
              target="_blank"
              rel="noreferrer"
            >
              blog post
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="48"
                width="48"
                viewBox="0 0 48 48"
              >
                <path d="M9.9 41q-1.2 0-2.05-.85Q7 39.3 7 38.1V9.9q0-1.2.85-2.05Q8.7 7 9.9 7h12.55v2.25H9.9q-.25 0-.45.2t-.2.45v28.2q0 .25.2.45t.45.2h28.2q.25 0 .45-.2t.2-.45V25.55H41V38.1q0 1.2-.85 2.05-.85.85-2.05.85Zm9.3-10.6-1.6-1.6L37.15 9.25H26.5V7H41v14.5h-2.25V10.9Z" />
              </svg>
            </a>
            .
          </span>
          <span class="copyright">&copy; 2023 Cloudflare.com</span>
        </footer>
      </body>
    </QwikCityProvider>
  );
});
