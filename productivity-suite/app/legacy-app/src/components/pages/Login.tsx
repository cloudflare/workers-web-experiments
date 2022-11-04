import { getBus } from "piercing-library";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

export function Login() {
  const ref = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  let from = (location.state as { from: Location })?.from?.pathname ?? "/";

  useEffect(() => {
    if (ref.current) {
      return (
        getBus(ref.current).listen<{ username: string }>(
          "authentication",
          (authDetails) => {
            if (authDetails?.username) {
              auth.login(authDetails.username);
              navigate(from, { replace: true });
            }
          }
        ) ?? undefined
      );
    }
  }, [ref.current]);

  return (
    <div ref={ref}>
      <piercing-fragment-outlet fragment-id="login" />
    </div>
  );
}
