export const appsDetails = {
    NextJS: {
      path: './apps/nextjs',
      devScript: 'dev',
      deployScript: 'deploy',
      port: 8699,
    },
    QwikCity: {
      path: './apps/qwik-city',
      devScript: 'dev',
      deployScript: 'deploy',
      port: 8700,
    },
    Remix: {
      path: './apps/remix',
      devScript: 'dev',
      deployScript: 'deploy',
      port: 8701,
    },
    SolidStart: {
      path: './apps/solid-start',
      devScript: 'dev',
      deployScript: 'deploy',
      port: 8710,
    },
    SvelteKit: {
      path: './apps/svelte-kit',
      devScript: 'dev',
      deployScript: 'deploy',
      port: 8711,
    },
};

export const appNames = Object.keys(appsDetails);