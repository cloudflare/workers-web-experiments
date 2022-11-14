import { PiercingGateway } from "piercing-library";
import { getCurrentUser, getTodoLists } from "shared";

export interface Env {
  APP_BASE_URL: string;
}

const gateway = new PiercingGateway<Env>({
  getLegacyAppBaseUrl(env) {
    return env.APP_BASE_URL;
  },
  shouldPiercingBeEnabled(request: Request) {
    const match = request.headers
      .get("Cookie")
      ?.match(/piercingEnabled=(true|false)/);
    const piercingEnabled = !match ? null : match[1] === "true" ? true : false;
    return piercingEnabled === null ? true : piercingEnabled;
  },
  async generateMessageBusState(requestMessageBusState, request) {
    const requestCookie = request.headers.get("Cookie");
    const currentUser = requestCookie
      ? await getCurrentUser(requestCookie)
      : null;

    if (!("authentication" in requestMessageBusState)) {
      requestMessageBusState["authentication"] = {
        username: currentUser,
      };
    }

    if (!("todo-list-selected" in requestMessageBusState) && currentUser) {
      const match = /\/todos\/([^/]+)$/.exec(request.url);
      let listName = match?.[1] && decodeURIComponent(match[1]);

      const lists = await getTodoLists(currentUser, requestCookie!);
      // make sure that the provided listName is the name of an existing list
      listName = lists.find(({ name }) => name === listName)?.name;

      if (!listName) {
        if (lists.length) {
          listName = lists[lists.length - 1].name;
        }
      }

      requestMessageBusState["todo-list-selected"] = { name: listName } ?? null;
    }
    return requestMessageBusState;
  },
});

async function isUserAuthenticated(request: Request) {
  const currentUser = await getCurrentUser(request.headers.get("Cookie") || "");
  return !!currentUser;
}

gateway.registerFragment({
  fragmentId: "login",
  prePiercingStyles: `
    :not(piercing-fragment-outlet) > piercing-fragment-host {
      position: absolute;
      top: 10.45rem;
      left: 1rem;
      right: 1rem;
      max-width: min(30rem, 80vw);
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host {
        top: 10.57rem;
      }
    }
    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host {
        top: 13.05rem;
      }
    }
    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host {
        top: 13.4rem;
      }
    }
    `,
  async shouldBeIncluded(request: Request) {
    return !(await isUserAuthenticated(request));
  },
});

gateway.registerFragment({
  fragmentId: "todo-lists",
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
      position: absolute;
      top: 14.7rem;
      left: 2rem;
      right: 2rem;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
        top: 14.85rem;
      }
    }
    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
        top: 21.135rem;
      }
    }
    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
        top: 21.4rem;
      }
    }
    `,
  async shouldBeIncluded(request: Request) {
    return (
      (await isUserAuthenticated(request)) &&
      /^\/(todos(\/[^/]+)?)?$/.test(new URL(request.url).pathname)
    );
  },
  transformRequest(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const match = /^\/todos\/([^/]+)$/.exec(path);

    if (!match) return request;

    const listName = decodeURIComponent(match[1]);
    const params = url.searchParams;
    if (listName) {
      params.append("listName", listName);
    }
    url.pathname = "";
    return new Request(url, request);
  },
});

gateway.registerFragment({
  fragmentId: "todos",
  prePiercingStyles: `
    :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
      position: absolute;
      top: 23.7rem;
      left: 2rem;
      right: 2rem;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
        top: 23.97rem;
      }
    }
    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
        top: 30.295rem;
      }
    }
    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
        top: 33.565rem;
      }
    }
    `,
  async shouldBeIncluded(request: Request) {
    return (
      (await isUserAuthenticated(request)) &&
      /^\/(todos(\/[^/]+)?)?$/.test(new URL(request.url).pathname)
    );
  },
  transformRequest(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const match = /\/todos\/([^/]+)$/.exec(path);
    const listName = match?.[1] && decodeURIComponent(match[1]);
    const params = url.searchParams;
    if (listName) {
      params.append("listName", listName);
    }
    url.pathname = "";
    return new Request(url, request);
  },
});

gateway.registerFragment({
  fragmentId: "news",
  prePiercingStyles: `
    :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
      position: absolute;
      margin: 0 auto;
      top: 13.9rem;
      left: 0;
      right: 0;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
        top: 14.05rem;
      }
    }

    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
        top: 20.13rem;
      }
    }

    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
        top: 20.41rem;
      }
    }
    `,
  async shouldBeIncluded(request: Request) {
    return (
      (await isUserAuthenticated(request)) &&
      /^\/news(\/[^/]+)?$/.test(new URL(request.url).pathname)
    );
  },
});

export default gateway;
