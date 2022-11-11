import { getBus } from "piercing-library";
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  deleteCurrentUser,
  getCurrentUser,
  getUserData,
  saveCurrentUser,
  setUserData,
} from "shared";
import { initialPlaceholderTodoList } from "./initialPlaceholderTodoList";

export const AUTH_LOADING = Symbol("Auth Loading");
export type AuthContextType = { user: string | null } | undefined;

let AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<string | null | typeof AUTH_LOADING>(
    AUTH_LOADING
  );

  useEffect(() => {
    getCurrentUser().then((username) => setUser(username));
  }, []);

  useEffect(() => {
    return getBus().listen<{ username: string }>("login", ({ username }) => {
      setUser(username);
      addUserDataIfMissing(username);
      getBus().dispatch("authentication", { username });
      saveCurrentUser(username);
      navigate((location.state as { from: Location })?.from?.pathname ?? "/", {
        replace: true,
      });
    });
  }, []);

  useEffect(() => {
    return getBus().listen<{ username: string }>("logout", () => {
      setUser(null);
      getBus().dispatch("authentication", null);
      navigate("/login");
      deleteCurrentUser();
    });
  }, []);

  const value = user !== AUTH_LOADING ? { user } : undefined;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const location = useLocation();

  // Don't redirect if the auth has not yet been initialized.
  if (auth && !auth.user) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireNotAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Don't redirect if the auth has not yet been initialized.
  if (auth && auth.user) {
    return <Navigate to={"/"} replace />;
  }

  return <>{children}</>;
}

async function addUserDataIfMissing(user: string) {
  const data = getUserData(user);
  if (!data) {
    const newDataStr = JSON.stringify({
      todoLists: [initialPlaceholderTodoList],
    });
    setUserData(user, newDataStr);
  }
}
