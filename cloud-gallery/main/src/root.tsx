import { FragmentPlaceholder } from "helpers";
import "./global.css";
import "./normalize.css";
import "./layout.css";

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content="A demo showcasing the Qwik framework on Cloudflare Workers"
        />
        <title>Qwik Multi Worker Demo</title>
      </head>
      <body>
        <div class="page-container">
          <div class="header-fragment">
            <FragmentPlaceholder name="header" />
          </div>
          <div class="body-fragment">
            <FragmentPlaceholder name="body" />
          </div>
          <div class="footer-fragment">
            <FragmentPlaceholder name="footer" />
          </div>
        </div>
      </body>
    </>
  );
};
