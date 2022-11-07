import {
  getMessageBusInlineScript,
  piercingFragmentHostInlineScript,
} from "./index";
import { concatenateStreams, wrapStreamInText } from "./stream-utilities";
import qwikloader from "@builder.io/qwik/qwikloader.js?raw";
import { MessageBusState } from "./message-bus/message-bus";
import { getMessageBusState } from "./message-bus/server-side-message-bus";

/**
 * Configuration object for the registration of a fragment in the app's gateway worker.
 */
export interface FragmentConfig<Env> {
  /**
   * Unique Id for the fragment.
   */
  fragmentId: string;
  /**
   * Styles to apply to the fragment before it gets pierced, their purpose
   * is to style the fragment in such a way to make it look as close as possible
   * to the final pierced view (so that the piercing operation can look seamless).
   *
   * For best results they should use the following selector:
   * :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="fragmentId"]
   */
  prePiercingStyles: string;
  /**
   * Function which transforms all the requests for the fetching of a fragment using
   * custom logic. This can be used to convert url paths into search parameters (or
   * vice versa), to provide to the fragment request in the format more convenient
   * for it to consume (instead of delegating any conversions to the fragment itself).
   *
   * Note: this only applies to requests that are fetching the fragment view, requests
   * to specific assets (such as js, css, images, etc...) don't get transformed.
   */
  transformRequest?: (
    request: Request,
    env: Env,
    fragmentConfig: FragmentConfig<Env>
  ) => Request;
  /**
   * Function which on HTML requests, based on the current request, environment and
   * context returns a boolean (or a promise of a boolean) indicating whether the
   * fragment should be included ("pre-pierced") in the current HTML response.
   */
  shouldBeIncluded: (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => boolean | Promise<boolean>;
}

/**
 * Configuration object for the implementation of the app's gateway worker.
 */
export interface PiercingGatewayConfig<Env> {
  /**
   * Function which based on the current environment returns
   * the base url for the base/legacy application.
   */
  getBaseAppUrl: (env: Env) => string;
  /**
   * Generates the message bus state for the current request.
   */
  generateMessageBusState: (
    requestMessageBusState: MessageBusState,
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => MessageBusState | Promise<MessageBusState>;
}

export class PiercingGateway<Env> {
  private fragmentConfigs: Map<string, FragmentConfig<Env>> = new Map();

  constructor(private config: PiercingGatewayConfig<Env>) {}

  /**
   * Registers a fragment in the gateway worker so that it can be integrated
   * with the gateway worker.
   *
   * @param fragmentConfig Configuration object for the fragment.
   */
  registerFragment(fragmentConfig: FragmentConfig<Env>) {
    if (this.fragmentConfigs.has(fragmentConfig.fragmentId)) {
      console.warn(
        "\x1b[31m Warning: you're trying to register a fragment with id" +
          ` "${fragmentConfig.fragmentId}", but a fragment with the same fragmentId` +
          ` has already been registered, thus this` +
          " duplicate registration will be ignored. \x1b[0m"
      );
      return;
    }
    this.fragmentConfigs.set(fragmentConfig.fragmentId, fragmentConfig);
  }

  fetch = async (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> => {
    this.validateFragmentConfigs(env);

    request = await this.createSSRMessageBusAndUpdateRequest(request, env, ctx);

    const fragmentResponse = await this.handleFragmentFetch(request, env);
    if (fragmentResponse) return fragmentResponse;

    const fragmentAssetResponse = await this.handleFragmentAssetFetch(
      request,
      env
    );
    if (fragmentAssetResponse) return fragmentAssetResponse;

    const htmlResponse = await this.handleHtmlRequest(request, env, ctx);
    if (htmlResponse) return htmlResponse;

    return this.forwardFetchToBaseApp(request, env);
  };

  private async handleHtmlRequest(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) {
    const requestIsForHtml = request.headers
      .get("Accept")
      ?.includes("text/html");

    if (requestIsForHtml) {
      const baseUrl = this.config.getBaseAppUrl(env).replace(/\/$/, "");
      const indexBodyResponse = this.fetchBaseIndexHtml(
        new Request(baseUrl, request)
      ).then((response) => response.text());

      const fragmentStreamOrNullPromises: Promise<ReadableStream | null>[] =
        Array.from(this.fragmentConfigs.values()).map((fragmentConfig) => {
          const shouldBeIncluded = fragmentConfig.shouldBeIncluded(
            request,
            env,
            ctx
          );

          const shouldBeIncludedPromise =
            shouldBeIncluded instanceof Promise
              ? shouldBeIncluded
              : new Promise<boolean>((resolve) => resolve(shouldBeIncluded));

          return shouldBeIncludedPromise.then((shouldBeIncluded) =>
            shouldBeIncluded
              ? this.fetchSSRedFragment(env, fragmentConfig, request)
              : null
          );
        });

      const [indexBody, ...fragmentStreamsOrNulls] = await Promise.all([
        indexBodyResponse,
        ...fragmentStreamOrNullPromises,
      ]);

      const fragmentStreamsToInclude = fragmentStreamsOrNulls.filter(
        (streamOrNull) => streamOrNull !== null
      ) as ReadableStream<any>[];

      return this.returnCombinedIndexPage(
        indexBody,
        concatenateStreams(fragmentStreamsToInclude)
      );
    }
  }

  private async createSSRMessageBusAndUpdateRequest(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Request> {
    const requestMessageBusState = getMessageBusState(request);

    const updatedMessageBusState = await this.config.generateMessageBusState(
      requestMessageBusState,
      request,
      env,
      ctx
    );

    const updatedRequest = new Request(request);
    updatedRequest.headers.set(
      "message-bus-state",
      JSON.stringify(updatedMessageBusState)
    );
    return updatedRequest;
  }

  private async handleFragmentFetch(request: Request, env: Env) {
    const match = request.url.match(
      /^https?:\/\/[^/]*\/piercing-fragment\/([^?/]+)\/?(?:\?.+)?/
    );

    if (match?.length !== 2) return null;

    const fragmentId = match[1];
    const fragmentConfig = this.fragmentConfigs.get(fragmentId);
    if (!fragmentConfig) {
      return new Response(
        `<p style="color: red;">configuration for fragment with id "${match[1]}" not found` +
          " did you remember to register the fragment in the gateway?</p>"
      );
    }

    const fragmentStream = await this.fetchSSRedFragment(
      env,
      fragmentConfig,
      request,
      false
    );

    return new Response(fragmentStream, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  private async handleFragmentAssetFetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const regex = /\/_fragment\/([^/]*)\/?.*$/;
    const match = path.match(regex);
    if (match?.length !== 2) return null;
    const fragmentId = match[1];
    const fragmentConfig = this.fragmentConfigs.get(fragmentId);
    if (!fragmentConfig) return null;
    // if the request has an extra base we need to remove it here
    const adjustedReq = new Request(
      new URL(`${url.protocol}//${url.host}${match[0]}`),
      request
    );
    return this.proxyAssetRequestToFragmentWorker(
      env,
      fragmentConfig,
      adjustedReq
    );
  }

  private forwardFetchToBaseApp(request: Request, env: Env) {
    const url = new URL(request.url);
    const baseUrl = this.config.getBaseAppUrl(env).replace(/\/$/, "");
    const newRequest = new Request(`${baseUrl}${url.pathname}`);
    return fetch(newRequest, request);
  }

  private async returnCombinedIndexPage(
    indexBody: string,
    streamToInclude: ReadableStream
  ): Promise<Response> {
    const indexOfEndBody = indexBody.indexOf("</body>");
    const preStream = indexBody.substring(0, indexOfEndBody);
    const postStream = indexBody.substring(indexOfEndBody);

    const stream = wrapStreamInText(preStream, postStream, streamToInclude);

    return new Response(stream, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  private async fetchBaseIndexHtml(request: Request) {
    // Note: we make sure to handle/proxy Upgrade requests, so
    //       that Vite's HMR can work for local development
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader) {
      const { webSocket } = (await fetch(request)) as unknown as {
        webSocket: WebSocket;
      };

      return new Response(null, {
        status: 101,
        webSocket,
      });
    }

    const response = await fetch(request);

    const requestIsForHtml = request.headers
      .get("Accept")
      ?.includes("text/html");
    if (requestIsForHtml) {
      const stateHeaderStr = request.headers.get("message-bus-state");
      let indexBody = (await response.text()).replace(
        "</head>",
        `${getMessageBusInlineScript(stateHeaderStr ?? "{}")}\n` +
          `${piercingFragmentHostInlineScript}\n` +
          "</head>"
      );

      // We need to include the qwikLoader script here
      // this is a temporary bugfix, see: https://jira.cfops.it/browse/DEVDASH-51
      indexBody = indexBody.replace("</head>", `\n${qwikloaderScript}</head>`);
      return new Response(indexBody, response);
    }

    return response;
  }

  private async fetchSSRedFragment(
    env: Env,
    fragmentConfig: FragmentConfig<Env>,
    request: Request,
    prePiercing = true
  ): Promise<ReadableStream> {
    const service = this.getFragmentFetcher(env, fragmentConfig.fragmentId);
    const newRequest = this.getRequestForFragment(request, fragmentConfig, env);
    const response = await service.fetch(newRequest);
    const fragmentStream = response.body!;

    let preFragment = `<piercing-fragment-host fragment-id=${fragmentConfig.fragmentId}>`;
    let postFragment = "</piercing-fragment-host>";

    if (prePiercing) {
      preFragment = `
                ${preFragment}
                <style>
                    ${fragmentConfig.prePiercingStyles}
                </style>`;
    }

    return wrapStreamInText(preFragment, postFragment, fragmentStream);
  }

  private getRequestForFragment(
    request: Request,
    fragmentConfig: FragmentConfig<Env>,
    env: Env
  ) {
    const url = new URL(
      request.url.replace(`piercing-fragment/${fragmentConfig.fragmentId}`, "")
    );

    const transformRequest =
      fragmentConfig.transformRequest ?? this.defaultTransformRequest;
    const newRequest = transformRequest(
      new Request(url, request),
      env,
      fragmentConfig
    );
    return newRequest;
  }

  private getFragmentFetcher(env: Env, fragmentId: string): Fetcher {
    return (env as any)[`${fragmentId}-fragment`];
  }

  private proxyAssetRequestToFragmentWorker(
    env: Env,
    { fragmentId }: FragmentConfig<Env>,
    request: Request
  ) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const fragmentBasePathRegex = new RegExp(
      `^\\/_fragment\\/${fragmentId}(?:\\/?)(.*)$`
    );
    const match = fragmentBasePathRegex.exec(pathname);
    const assetPath = match?.[1] ?? "";
    const service = this.getFragmentFetcher(env, fragmentId);
    url.pathname = `/${assetPath}`;
    const newRequest = new Request(url, request);
    return service.fetch(newRequest);
  }

  private validateFragmentConfigs(env: Env): void {
    const missingBindingFragmentIds = [...this.fragmentConfigs.keys()].filter(
      (fragmentId) => !this.getFragmentFetcher(env, fragmentId)
    );
    if (missingBindingFragmentIds.length) {
      throw new Error(
        "Some fragments have been configured in the gateway but their services aren't" +
          " registered in the toml file, please correct the fragment id provided or" +
          " make sure that the toml file contains the following services: " +
          missingBindingFragmentIds.map((id) => `${id}-fragment`).join(", ")
      );
    }
  }

  private defaultTransformRequest(request: Request) {
    return request;
  }
}

const qwikloaderScript = `<script id="qwikloader">${qwikloader}</script>`;
