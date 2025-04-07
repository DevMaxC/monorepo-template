import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { handleCallConnection, handleFrontendConnection } from './sessionManager.js';
import functions from './functionHandlers.js';
import twilio, { twilioClient, twilioPhoneNumber } from './twilio.js';
dotenv.config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log('Request received', req.url);
  next();
});

const server = http.createServer(app);
const wss = new WebSocketServer({
  server,
  verifyClient: (info, callback) => {
    console.log('WebSocket connection attempt:', info.req.url);
    // Accept all connections for now
    callback(true);
  },
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const twimlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connected</Say>
  <Connect>
    <Stream url="{{WS_URL}}" />
  </Connect>
  <Say>Disconnected</Say>
</Response>`;

app.post('/twilio/call', async (req, res) => {
  console.log('req.body', req.body);
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  console.log('phoneNumber', phoneNumber);

  if (!twilioClient) {
    res.status(500).send('Twilio client not initialized');
    return;
  }

  const call = await twilioClient.calls.create({
    url: `${req.protocol}://${req.get('host')}/twiml`,
    to: phoneNumber,
    from: twilioPhoneNumber,
  });

  res.json({ callSid: call.sid });
});

app.get('/public-url', (req, res) => {
  res.json({ publicUrl: req.protocol + '://' + req.get('host') + '/' });
});

app.all('/twiml', (req, res) => {
  // const wsUrl = new URL(PUBLIC_URL);
  const wsUrl = new URL(req.protocol + '://' + req.get('host') + '/');
  wsUrl.protocol = 'wss:';
  wsUrl.pathname = `/call`;

  const twimlContent = twimlTemplate.replace('{{WS_URL}}', wsUrl.toString());

  console.log('WS URL', wsUrl.toString());
  res.type('text/xml').send(twimlContent);
});

// New endpoint to list available tools (schemas)
app.get('/tools', (req, res) => {
  res.json(functions.map(f => f.schema));
});

let currentCall: WebSocket | null = null;
let currentLogs: WebSocket | null = null;

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  console.log('Connection received');
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length < 1) {
    ws.close();
    return;
  }

  const type = parts[0];

  if (type === 'call') {
    console.log('Call WebSocket connected');
    if (currentCall) currentCall.close();
    currentCall = ws;
    handleCallConnection(currentCall, OPENAI_API_KEY);
  } else if (type === 'logs') {
    console.log('Logs WebSocket connected');
    if (currentLogs) currentLogs.close();
    currentLogs = ws;
    handleFrontendConnection(currentLogs);
  } else {
    ws.close();
  }
});

server.listen(PORT, () => {
  console.log(`v4. corrected ws. Server running on http://localhost:${PORT}`);
});
