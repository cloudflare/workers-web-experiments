const cookieBytesLimit = 4096;
const millisInAMonth = 2628e6;
const cookiesPrefix = "piercingDemoSuite_";
import { parse } from "cookie";

export function saveCookie(name: string, value: string) {
  if (new Blob([`${cookiesPrefix}${name}`, value]).size > cookieBytesLimit) {
    alert(
      `Error: The cookie bytes limit is not enough to hold the data for cookie \"${name}\",` +
        " expect something not to work as it should"
    );
    return;
  }

  const expirationDate = new Date(
    new Date().getTime() + millisInAMonth
  ).toUTCString();
  const cookieName = encodeURIComponent(`${cookiesPrefix}${name}`);
  document.cookie = `${cookieName}=${encodeURIComponent(
    value
  )}; expires=${expirationDate}; path=/`;
}

export function deleteCookie(name: string) {
  const expirationDate = new Date(0).toUTCString();
  const cookieName = encodeURIComponent(`${cookiesPrefix}${name}`);
  document.cookie = `${cookieName}=; expires=${expirationDate}; path=/`;
}

export function getCookie(name: string) {
  const cookie = parse(document.cookie || "");
  const cookieName = encodeURIComponent(`${cookiesPrefix}${name}`);
  return cookie[cookieName] ?? null;
}
