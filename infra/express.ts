import { vpc } from './vpc';

const openaiApiKey = new sst.Secret('OpenAI');
const twilioAccountSid = new sst.Secret('TwilioSID');
const twilioAuthToken = new sst.Secret('TwilioAuthToken');
const twilioPhoneNumber = new sst.Secret('TwilioPhoneNumber');

export const domainName = 'yourdomain.com';

const cluster = new sst.aws.Cluster('MyCluster', { vpc });

const service = new sst.aws.Service('MyService', {
  image: {
    context: './packages/express',
    dockerfile: 'Dockerfile',
  },

  link: [openaiApiKey],
  environment: {
    OPENAI_API_KEY: openaiApiKey.value,
    TWILIO_ACCOUNT_SID: twilioAccountSid.value,
    TWILIO_AUTH_TOKEN: twilioAuthToken.value,
    TWILIO_PHONE_NUMBER: twilioPhoneNumber.value,
  },
  cluster,
  serviceRegistry: {
    port: 80,
  },
  loadBalancer: {
    domain: `voice.${domainName}`,
    rules: [{ listen: '80/http' }, { listen: '443/https', forward: '80/http' }],
  },
  dev: {
    command: 'npm run dev',
  },
});

export const url = service.url || 'http://localhost:80';
