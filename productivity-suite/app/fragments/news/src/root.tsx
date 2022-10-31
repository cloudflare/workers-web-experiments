// @refresh reload
import { Suspense } from "solid-js";
import { HydrationScript, isServer, NoHydration } from "solid-js/web";
// import {
//   ErrorBoundary,
//   Routes,
//   Scripts,
//   Route,
// } from "solid-start";

import {
  A,
  Body,
  ErrorBoundary,
  // FileRoutes,
  useServerContext,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";

import { PageEvent } from "solid-start/server";
import { createContext, useContext } from "solid-js";
import "./root.css";
import { News } from "./routes";
import { FileRoutes } from "solid-start";

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
      <NoHydration>
        {isServer && (
          <link rel="stylesheet" href={`/_fragment/news${style.href}`} />
        )}
      </NoHydration>

      <Suspense fallback={<div class="news-list-nav">Loading...</div>}>
        <ErrorBoundary>
          <Routes>
            <FileRoutes />
          </Routes>
          {/* <News /> */}
        </ErrorBoundary>
      </Suspense>
      {/* <Scripts /> */}

      {isSSR && <HydrationScript />}
      <NoHydration>
        {isServer && (
          <script type="module" async src={`/_fragment/news${script.href}`} />
        )}
      </NoHydration>
    </div>
  );
}

// export default function Root() {
//   return (
//     <>
//       <Suspense>
//         <ErrorBoundary>
//           <Routes>
//             <FileRoutes />
//           </Routes>
//         </ErrorBoundary>
//       </Suspense>
//       <Scripts />
//     </>
//   );
// }
