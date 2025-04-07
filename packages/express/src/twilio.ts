import twilio from 'twilio';

const { TWILIO_ACCOUNT_SID: accountSid, TWILIO_AUTH_TOKEN: authToken } = process.env;

if (!accountSid || !authToken) {
  console.warn('Twilio credentials not set. Twilio client will be disabled.');
}

export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;
export default twilioClient;
