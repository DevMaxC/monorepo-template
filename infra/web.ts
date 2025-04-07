import { domainName } from './express';

export const web = new sst.aws.Nextjs('Web', {
  path: 'packages/web',
  link: [],
  domain: `${domainName}`,
  environment: {
    NEXT_PUBLIC_VOICE_API_URL: `https://voice.${domainName}`,
  },
});
