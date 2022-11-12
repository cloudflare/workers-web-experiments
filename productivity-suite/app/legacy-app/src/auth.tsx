import { getBus } from "piercing-library";
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  deleteCurrentUser,
  getCurrentUser,
  getUserData,
  saveCurrentUser,
  setUserData,
} from "shared";
import { initialPlaceholderTodoList } from "./initialPlaceholderTodoList";

export type LoginMessage = { username: string };
export type AuthenticationMessage = { username: string | null };
export type AuthenticationState = AuthenticationMessage | undefined;

const AuthContext = createContext<AuthenticationState>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthenticationState>(undefined);

  useEffect(() => {
    getCurrentUser().then((username) => setUser({ username }));
  }, []);

  useEffect(() => {
    return getBus().listen<LoginMessage>("login", async (user) => {
      setUser(user);
      await addUserDataIfMissing(user.username);
      await saveCurrentUser(user.username);
      getBus().dispatch("authentication", user);
      navigate("/", {
        replace: true,
      });
    });
  }, []);

  useEffect(() => {
    return getBus().listen("logout", () => {
      setUser({ username: null });
      getBus().dispatch("authentication", { username: null });
      navigate("/login");
      deleteCurrentUser();
    });
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // If `auth` is undefined then it has not yet been initialized
  // so we should avoid making any premature redirect navigation.
  if (auth && !auth.username) {
    return <Navigate to={"/login"} replace />;
  }

  return <>{children}</>;
}

export function RequireNotAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // If `auth` is undefined then it has not yet been initialized
  // so we should avoid making any premature redirect navigation.
  if (auth && auth.username) {
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
