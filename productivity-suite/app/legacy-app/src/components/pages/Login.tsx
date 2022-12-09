import { getBus } from "piercing-library";
import { useEffect, useRef } from "react";

export function Login() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      return (
        getBus(ref.current).listen<{ username: string }>(
          "authentication",
          (authDetails) => {
            if (authDetails?.username) {
              getBus().dispatch("login", authDetails);
            }
          }
        ) ?? undefined
      );
    }
  }, [ref.current]);

  return (
    <div className="login-page" ref={ref}>
      <piercing-fragment-outlet fragment-id="login" />
    </div>
  );
}
