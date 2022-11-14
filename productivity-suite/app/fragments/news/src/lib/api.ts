import { isServer } from "solid-js/web";

const story = (path: string) => `https://node-hnapi.herokuapp.com/${path}`;

export default async function fetchAPI(path: string) {
  const url = story(path);
  const headers = isServer ? { "User-Agent": "chrome" } : {};

  try {
    const response = await fetch(url, { headers });
    const text = await response.text();
    try {
      if (text === null) {
        return { error: "Not found" };
      }
      return JSON.parse(text);
    } catch (e) {
      console.error(`Recevied from API: ${text}`);
      console.error(e);
      return { error: e };
    }
  } catch (error) {
    return { error };
  }
}
