import { getBus } from "piercing-library";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ReframedOutlet } from "../ReframedOutlet";

export function News() {
  useEffect(() => {
    return () => {
      // @ts-ignore
      window._$HY = null;
    };
  });

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const page = getPageNumber(searchParams);
    getBus().dispatch("news-page", { page });
  }, [searchParams]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return getBus().listen<{ page: number }>("change-news-page", ({ page }) => {
      if (page) {
        setSearchParams({
          page: `${page}`,
        });
      }
    });
  }, [ref.current]);

  return (
    <div>
      <ReframedOutlet fragmentId="news" />
    </div>
  );
}

function getPageNumber(searchParams: URLSearchParams) {
  const n = parseInt(searchParams.get("page") ?? "");
  return n > 0 ? n : 1;
}
