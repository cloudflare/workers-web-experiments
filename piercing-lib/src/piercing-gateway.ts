import { piercingFragmentHostInlineScript } from "./index";
import { concatenateStreams, wrapStreamInText } from "./stream-utilities";

export interface FragmentConfig<Env> {
  fragmentId: string;
  getBaseUrl: (env: Env) => string;
  prePiercingStyles: string;
  shouldBeIncluded: (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => boolean | Promise<boolean>;
}

export interface PiercingGatewayConfig<Env> {
  getBaseAppUrl: (env: Env) => string;
}

export class PiercingGateway<Env> {
  private fragmentConfigs: Map<string, FragmentConfig<Env>> = new Map();

  constructor(private config: PiercingGatewayConfig<Env>) {}

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

  /*
		We're assigning fetch to the object itself so that user can do:
			`export default gateway;`
		this shouldn't be necessary and we should be able to have fetch
		as a normal method in the class, but that doesn't seem to
		currently being recognized correctly:
			https://chat.google.com/room/AAAADFUqSgo/njWMATzSHG4
	*/
  fetch = async (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> => {
    this.validateFragmentConfigs(env);

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
      const fragmentStreamsToInclude: ReadableStream[] = [];
      for (const fragmentConfig of this.fragmentConfigs.values()) {
        const shouldBeIncluded = await fragmentConfig.shouldBeIncluded(
          request,
          env,
          ctx
        );
        if (shouldBeIncluded) {
          fragmentStreamsToInclude.push(
            await this.fetchSSRedFragment(env, fragmentConfig, request)
          );
        }
      }
      return this.getIndexPage(
        env,
        request,
        concatenateStreams(fragmentStreamsToInclude)
      );
    }
    return null;
  }

  private async handleFragmentFetch(request: Request, env: Env) {
    const match = request.url.match(
      /^https?:\/\/[^/]*\/piercing-fragment\/([^?/]*)/
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
    const regex = /^\/_fragment\/([^/]*)(?:\/?)(?:.*)$/;
    const match = path.match(regex);
    if (match?.length !== 2) return null;
    const fragmentId = match[1];
    const fragmentConfig = this.fragmentConfigs.get(fragmentId);
    if (!fragmentConfig) return null;
    return this.proxyAssetRequestToFragmentWorker(env, fragmentConfig, request);
  }

  private forwardFetchToBaseApp(request: Request, env: Env) {
    const url = new URL(request.url);
    const baseUrl = this.config.getBaseAppUrl(env).replace(/\/$/, "");
    const newRequest = new Request(`${baseUrl}${url.pathname}`);
    return fetch(newRequest, request);
  }

  private async getIndexPage(
    env: Env,
    request: Request,
    streamToInclude: ReadableStream
  ): Promise<Response> {
    const baseUrl = this.config.getBaseAppUrl(env).replace(/\/$/, "");
    const newRequest = new Request(baseUrl, {
      ...request,
      headers: { Accept: "text/html" },
    });
    const indexHtmlResponse = await this.fetchBaseIndexHtml(newRequest);

    const indexBody = await indexHtmlResponse.text();

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
      let indexBody = (await response.text()).replace(
        "</head>",
        `${piercingFragmentHostInlineScript}\n</head>`
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
    const url = new URL(request.url);
    const service = this.getFragmentFetcher(env, fragmentConfig.fragmentId);
    const searchParams = `${url.searchParams}`;
    const searchParamsStr = searchParams ? `?${searchParams}` : "";
    const newBaseUrl = fragmentConfig.getBaseUrl(env).replace(/\/$/, "");
    const fragmentPathUrl = url.pathname.replace(
      `piercing-fragment/${fragmentConfig.fragmentId}`,
      ""
    );
    const newUrl = `${newBaseUrl}${fragmentPathUrl}${searchParamsStr}`;
    const response = await service.fetch(newUrl, request);
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

  private getFragmentFetcher(env: Env, fragmentId: string): Fetcher {
    return (env as any)[`${fragmentId}-fragment`];
  }

  private proxyAssetRequestToFragmentWorker(
    env: Env,
    { fragmentId, getBaseUrl }: FragmentConfig<Env>,
    request: Request
  ) {
    const pathname = new URL(request.url).pathname;
    const fragmentBasePathRegex = new RegExp(
      `^\\/_fragment\\/${fragmentId}(?:\\/?)(.*)$`
    );
    const match = fragmentBasePathRegex.exec(pathname);
    const assetPath = match?.[1] ?? "";
    const service = this.getFragmentFetcher(env, fragmentId);
    const baseUrl = getBaseUrl(env);
    const divisor = baseUrl.endsWith("/") ? "" : "/";
    const newRequest = new Request(
      `${getBaseUrl(env)}${divisor}${assetPath}`,
      request
    );
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
}

const qwikloaderScript =
  '<script id="qwikloader">((e,t)=>{const n="__q_context__",o=window,a=new Set,i=t=>e.querySelectorAll(t),r=(e,t,n=t.type)=>{i("[on"+e+"\\\\:"+n+"]").forEach((o=>c(o,e,t,n)))},s=(e,t)=>new CustomEvent(e,{detail:t}),l=(t,n)=>(t=t.closest("[q\\\\:container]"),new URL(n,new URL(t.getAttribute("q:base"),e.baseURI))),c=async(t,o,a,i=a.type)=>{const r="on"+o+":"+i;t.hasAttribute("preventdefault:"+i)&&a.preventDefault();const s=t._qc_,c=null==s?void 0:s.li.filter((e=>e[0]===r));if(c&&c.length>0){for(const e of c)await e[1].getFn([t,a],(()=>t.isConnected))(a,t);return}const u=t.getAttribute(r);if(u)for(const o of u.split("\\n")){const i=l(t,o),r=d(i),s=performance.now(),c=b(await import(i.href.split("#")[0]))[r],u=e[n];if(t.isConnected)try{e[n]=[t,a,i],f("qsymbol",{symbol:r,element:t,reqTime:s}),await c(a,t)}finally{e[n]=u}}},f=(t,n)=>{e.dispatchEvent(s(t,n))},b=e=>Object.values(e).find(u)||e,u=e=>"object"==typeof e&&e&&"Module"===e[Symbol.toStringTag],d=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",p=e=>e.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),v=async e=>{let t=p(e.type),n=e.target;for(r("-document",e,t);n&&n.getAttribute;)await c(n,"",e,t),n=e.bubbles&&!0!==e.cancelBubble?n.parentElement:null},w=e=>{r("-window",e,p(e.type))},y=()=>{var n;const r=e.readyState;if(!t&&("interactive"==r||"complete"==r)&&(t=1,f("qinit"),(null!=(n=o.requestIdleCallback)?n:o.setTimeout).bind(o)((()=>f("qidle"))),a.has("qvisible"))){const e=i("[on\\\\:qvisible]"),t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),c(n.target,"",s("qvisible",n)))}));e.forEach((e=>t.observe(e)))}},q=(e,t,n,o=!1)=>e.addEventListener(t,n,{capture:o}),g=t=>{for(const n of t)a.has(n)||(q(e,n,v,!0),q(o,n,w),a.add(n))};if(!e.qR){const t=o.qwikevents;Array.isArray(t)&&g(t),o.qwikevents={push:(...e)=>g(e)},q(e,"readystatechange",y),y()}})(document);</script>';
