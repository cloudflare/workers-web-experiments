import { createContext } from "react";

export const EnvContext = createContext<{ currentUser: string | null }>({
  currentUser: null,
});
