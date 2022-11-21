import { useEffect } from "react";

export function News() {
  useEffect(() => {
    return () => {
      // @ts-ignore
      window._$HY = null;
    };
  });

  return (
    <div>
      <piercing-fragment-outlet fragment-id="news" />
    </div>
  );
}
