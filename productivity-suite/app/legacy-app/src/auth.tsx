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

export type LoginMessage = { username: string };
export type AuthenticationMessage = { username: string | null };

const AuthContext = createContext<AuthenticationMessage | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    getBus().latestValue<AuthenticationMessage>("authentication")
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
    return getBus().listen("logout", () => {
      setUser({ username: null });
      deleteCurrentUser();
      getBus().dispatch("authentication", { username: null });
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

  assertDefined(auth);
  return !auth.username ? <Navigate to={"/login"} replace /> : <>{children}</>;
}

export function RequireNotAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  assertDefined(auth);
  return auth.username ? <Navigate to={"/"} replace /> : <>{children}</>;
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

function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error("Programming error: Value should not be undefined");
  }
}
