// @refresh reload
import { Suspense } from "solid-js";
import { HydrationScript, isServer } from "solid-js/web";
import { ErrorBoundary, Routes, useServerContext, Route } from "solid-start";
import { PageEvent } from "solid-start/server";
import { createContext, useContext } from "solid-js";
import "./root.css";
import { News } from "./routes";

export const ServerContext = createContext<PageEvent>({} as any);

type ManifestEntry = {
  type: "script" | "style";
  href: string;
};

export default function Root() {
  const context = useServerContext();

  let script: ManifestEntry = null;
  let style: ManifestEntry = null;

  if (isServer) {
    const manifestEntries = context.env.manifest[
      "entry-client"
    ] as ManifestEntry[];
    script = manifestEntries.find((e) => e.type === "script");
    style = manifestEntries.find((e) => e.type === "style");
  }

  const isSSR = import.meta.env.START_SSR;

  return (
    <div>
      {isServer && (
        <link rel="stylesheet" href={`/_fragment/news/public${style.href}`} />
      )}

      <ErrorBoundary>
        <Suspense fallback={<div class="news-list-nav">Loading...</div>}>
          <Routes>
            <Route path="/*" component={News} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {isSSR && <HydrationScript />}

      {isServer && (
        <script
          type="module"
          async
          src={`/_fragment/news/public${script.href}`}
        />
      )}
    </div>
  );
}
