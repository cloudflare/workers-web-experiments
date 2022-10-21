const cookieBytesLimit = 4096;
const millisInAMonth = 2628e6;
const cookiesPrefix = "multi_worker_demo__";
import { useEnvData } from "@builder.io/qwik";
import { parse } from "cookie";
import { isBrowser } from "./isBrowser";

export function saveCookie(name: string, value: string) {
  if (new Blob([`${cookiesPrefix}${name}`, value]).size > cookieBytesLimit) {
    alert(
      `Error: The cookie bytes limit is not enough to hold the data for cookie "${name}",` +
        " expect something not to work as it should"
    );
    return;
  }

  const expirationDate = new Date(
    new Date().getTime() + millisInAMonth
  ).toUTCString();
  document.cookie = `${cookiesPrefix}${name}=${value}; expires=${expirationDate}; path=/`;
}

export function deleteCookie(name: string) {
  const expirationDate = new Date(0).toUTCString();
  document.cookie = `${cookiesPrefix}${name}=; expires=${expirationDate}; path=/`;
}

export function getCookie(name: string) {
  let cookieString;

  if (isBrowser()) {
    cookieString = document.cookie || "";
  } else {
    const request = useEnvData<Request>("request")!;
    const cookie = request.headers.get("cookie");
    cookieString = cookie ?? "";
  }

  const cookie = parse(cookieString);
  return cookie[`${cookiesPrefix}${name}`] ?? null;
}
