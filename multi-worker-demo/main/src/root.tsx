import { FragmentPlaceholder } from "helpers";
import "./global.css";
import "./normalize.css";

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
        <FragmentPlaceholder name="header" />
        <FragmentPlaceholder name="body" />
        <FragmentPlaceholder name="footer" />
      </body>
    </>
  );
};
