/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'monorepo-template',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          profile: 'default',
        },
      },
    };
  },
  async run() {
    const express = await import('./infra/express');
    const web = await import('./infra/web');

    return {
      ExpressServiceUrl: express.url,
      WebUrl: web.web.url,
    };
  },
});
