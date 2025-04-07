# SST Monorepo + OpenAI Twilio Realtime Voice API Demo

![image](https://github.com/user-attachments/assets/4c80d7e6-c617-4a10-bc0a-9e1c6c7d4338)


Based upon the SST Template to create a monorepo SST v3 project. [Learn more](https://sst.dev/docs/set-up-a-monorepo).

This repo features a web page which can spawn a voice call and display the transcription and function calls.

## Deploying

IMPORTANT: Replace the `domainName` in the `infra/express.ts` file with your own domain with route53.

To run locally, fill the .env in express with your own credentials.
You must have a twilio account and a phone number.

Then run the following commands to deploy the app:

```bash
npm run sst:deploy
```

## Running the app locally

```bash
sst dev
```
