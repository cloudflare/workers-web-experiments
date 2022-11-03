// @refresh reload
import { Suspense } from "solid-js";
import { isServer, NoHydration } from "solid-js/web";
import {
  ErrorBoundary,
  FileRoutes,
  useServerContext,
  Routes,
  Scripts,
} from "solid-start";
import { PageEvent } from "solid-start/server";
import { createContext, useContext } from "solid-js";
import "./root.css";

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

  return (
    <div>
      <NoHydration>
        {isServer && <link rel="stylesheet" href={`${style.href}`} />}
      </NoHydration>

      <Suspense fallback={<div class="news-list-nav">Loading...</div>}>
        <ErrorBoundary>
          <Routes>
            <FileRoutes />
          </Routes>
        </ErrorBoundary>
      </Suspense>
      <Scripts />
    </div>
  );
}
