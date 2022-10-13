import { createContext } from "@builder.io/qwik";

export const BaseContext = createContext<{ base: string }>("base");
