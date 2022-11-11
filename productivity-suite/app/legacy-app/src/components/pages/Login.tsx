import { getBus } from "piercing-library";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import "./Login.css";

export function Login() {
  const ref = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
