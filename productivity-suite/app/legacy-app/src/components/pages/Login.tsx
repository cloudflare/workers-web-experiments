import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  let from = (location.state as { from: Location })?.from?.pathname ?? "/";

  return (
    <div>
      <piercing-fragment-outlet
        fragment-id="login"
        onLogin={({
          detail: { username },
        }: {
          detail: { username: string };
        }) => {
          auth.login(username);
          navigate(from, { replace: true });
        }}
      />
    </div>
  );
}
