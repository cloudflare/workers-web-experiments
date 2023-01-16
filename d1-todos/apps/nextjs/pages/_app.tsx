/* eslint-disable @next/next/no-img-element */
import { blogPostUrl } from "shared";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>D1 Todos NextJS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="app-header">
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <img src="next-logo.svg" alt="Remix logo" />
        </a>
      </header>
      <Component {...pageProps} />
      <footer className="app-footer">
        <span>
          D1 todos demo. For more details check out the{" "}
          <a href={blogPostUrl} target="_blank" rel="noreferrer">
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
        <span className="copyright">&copy; 2023 Cloudflare.com</span>
      </footer>
    </>
  );
}
