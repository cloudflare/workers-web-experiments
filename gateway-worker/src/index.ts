import { PiercingGateway } from "piercing-lib";

export interface Env {
  APP_BASE_URL: string;
}

const gateway = new PiercingGateway<Env>({
  getBaseAppUrl: (env) => env.APP_BASE_URL,
});

gateway.registerFragment({
  fragmentId: "login",
  getBaseUrl: (env) => `http:0.0.0.0/build`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host {
			position: absolute;
    }`,
  shouldBeIncluded: async () => true,
});

export default gateway;
