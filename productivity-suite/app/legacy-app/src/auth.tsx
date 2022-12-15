import { getBus } from "piercing-library";
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  deleteCurrentUser,
  getUserData,
  saveCurrentUser,
  setUserData,
} from "shared";
import { initialPlaceholderTodoList } from "./initialPlaceholderTodoList";

/** Message sent to indicate that a user has just logged in. */
export type LoginMessage = { username: string };
/** Message sent to indicate that a user has just logged out. */
export type LogoutMessage = {};
/**
 * Message indiciating the authentication state of the current user.
 *
 * `null` means not logged in.
 */
export type AuthenticationMessage = { username: string } | null;

const AuthContext = createContext<AuthenticationMessage>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthenticationMessage>(
    getBus().latestValue<AuthenticationMessage>("authentication") ?? null
  );

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
    return getBus().listen<LogoutMessage>("logout", () => {
      setUser(null);
      deleteCurrentUser();
      getBus().dispatch("authentication", null);
      navigate("/login");
    });
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return !auth?.username ? <Navigate to={"/login"} replace /> : <>{children}</>;
}

export function RequireNotAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return auth?.username ? <Navigate to={"/"} replace /> : <>{children}</>;
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
