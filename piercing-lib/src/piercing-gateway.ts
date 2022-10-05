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
    const newRequest = new Request(`${getBaseUrl(env)}${assetPath}`, request);
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
  '<script id="qwikloader">(()=>{function e(e){return"object"==typeof e&&e&&"Module"===e[Symbol.toStringTag]}((t,n)=>{const o="__q_context__",r=window,a=(e,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),t.querySelectorAll("[on"+e+"\\\\:"+n+"]").forEach((t=>l(t,e,n,o)))},i=(e,t)=>new CustomEvent(e,{detail:t}),s=e=>{throw Error("QWIK "+e)},c=(e,n)=>(e=e.closest("[q\\\\:container]"),new URL(n,new URL(e?e.getAttribute("q:base"):t.baseURI,t.baseURI))),l=async(n,a,l,d)=>{var u;n.hasAttribute("preventdefault:"+l)&&d.preventDefault();const b="on"+a+":"+l,v=null==(u=n._qc_)?void 0:u.li[b];if(v){for(const e of v)await e.getFn([n,d],(()=>n.isConnected))(d,n);return}const p=n.getAttribute(b);if(p)for(const a of p.split("\\n")){const l=c(n,a);if(l){const a=f(l),c=(r[l.pathname]||(w=await import(l.href.split("#")[0]),Object.values(w).find(e)||w))[a]||s(l+" does not export "+a),u=t[o];if(n.isConnected)try{t[o]=[n,d,l],await c(d,n)}finally{t[o]=u,t.dispatchEvent(i("qsymbol",{symbol:a,element:n}))}}}var w},f=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",d=async e=>{let t=e.target;for(a("-document",e.type,e);t&&t.getAttribute;)await l(t,"",e.type,e),t=e.bubbles&&!0!==e.cancelBubble?t.parentElement:null},u=e=>{a("-window",e.type,e)},b=()=>{const e=t.readyState;if(!n&&("interactive"==e||"complete"==e)){n=1,a("","qinit",i("qinit"));const e=t.querySelectorAll("[on\\\\:qvisible]");if(e.length>0){const t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),l(n.target,"","qvisible",i("qvisible",n)))}));e.forEach((e=>t.observe(e)))}}},v=new Set,p=e=>{for(const t of e)v.has(t)||(document.addEventListener(t,d,{capture:!0}),r.addEventListener(t,u),v.add(t))};if(!t.qR){const e=r.qwikevents;Array.isArray(e)&&p(e),r.qwikevents={push:(...e)=>p(e)},t.addEventListener("readystatechange",b),b()}})(document)})();</script>';
