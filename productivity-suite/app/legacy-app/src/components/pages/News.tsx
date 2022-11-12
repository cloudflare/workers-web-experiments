import { getBus } from "piercing-library";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export function News() {
  const currentPageRef = useRef<number>();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    return () => {
      // @ts-ignore
      window.e = window._$HY = null;

      // @ts-ignore
      window.t = function () {};
    };
  });

  useEffect(() => {
    if (currentPageRef.current === undefined) {
      const pageDetails = getBus().latestValue<{ page: number }>(
        "update-news-page-number"
      );
      if (
        pageDetails?.page !== undefined &&
        currentPageRef.current !== pageDetails.page
      ) {
        currentPageRef.current = pageDetails.page;
        setSearchParams({
          page: `${pageDetails.page}`,
        });
      }
    }

    // reset the page 1 one when soft navigating to some other section of the app
    return () => getBus().dispatch("update-news-page-view", { page: 1 });
  }, []);

  useEffect(() => {
    const page = getPageNumberFromSearchParams(searchParams);
    getBus().dispatch("update-news-page-view", { page });
  }, [searchParams]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return getBus().listen<{ page: number }>(
      "update-news-page-number",
      ({ page }) => {
        setSearchParams({
          page: `${page}`,
        });
      }
    );
  }, [ref.current]);

  return (
    <div>
      <piercing-fragment-outlet fragment-id="news" />
    </div>
  );
}

function getPageNumberFromSearchParams(searchParams: URLSearchParams) {
  const searchParamPage = searchParams.get("page");
  const searchParamPageNum = searchParamPage ? +searchParamPage : 1;
  const newsPageNum =
    isFinite(searchParamPageNum) && searchParamPageNum > 0
      ? searchParamPageNum
      : 1;
  return newsPageNum;
}
