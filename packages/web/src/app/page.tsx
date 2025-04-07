'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface CallStatus {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected';
  transcription: string;
  functionResults: string[];
}

export default function Home(): React.JSX.Element {
  type Dialogue = {
    role: 'user' | 'assistant';
    content: string;
  };
  const [dialogue, setDialogue] = useState<Dialogue[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>({
    status: 'idle',
    transcription: '',
    functionResults: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isConnected,
    sendMessage,
    lastMessage,
    error: wsError,
  } = useWebSocket(`wss://${process.env.NEXT_PUBLIC_VOICE_API_URL?.replace('https://', '')}/logs`);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'input_audio_buffer.speech_started':
        setCallStatus(prev => ({ ...prev, status: 'connected' }));
        break;
      case 'response.audio.delta':
        // Handle audio response if needed
        break;
      case 'response.audio_transcript.done':
        setDialogue(prev => [
          ...prev,
          { role: 'assistant', content: lastMessage.transcript as string },
        ]);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        setDialogue(prev => [...prev, { role: 'user', content: lastMessage.transcript as string }]);

        break;
    }
  }, [lastMessage]);

  const handleStartCall = async (): Promise<void> => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setCallStatus(prev => ({ ...prev, status: 'connecting' }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_VOICE_API_URL}/twilio/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate call');
      }

      // Send session configuration to WebSocket
      sendMessage({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          turn_detection: { type: 'server_vad' },
          voice: 'ash',
          input_audio_transcription: { model: 'whisper-1' },
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
        },
      });

      setCallStatus(prev => ({ ...prev, status: 'connecting' }));
    } catch (err) {
      setError(`Failed to initiate call: ${err instanceof Error ? err.message : String(err)}`);
      setCallStatus(prev => ({ ...prev, status: 'idle' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Phone Call Demo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {wsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          WebSocket Error: {wsError}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <div className="max-w-md w-full bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Make a Phone Call</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter a phone number to initiate a call. The number should be in E.164 format (e.g.,
            +1234567890).
          </p>
          <div className="space-y-4">
            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="w-full px-4 py-2 border text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading || callStatus.status !== 'idle'}
              />
            </div>
            <button
              onClick={handleStartCall}
              disabled={isLoading || !phoneNumber || callStatus.status !== 'idle'}
              className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading || !phoneNumber || callStatus.status !== 'idle'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Initiating Call...' : 'Start Call'}
            </button>
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-sm text-gray-600">
                  WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    callStatus.status === 'connected'
                      ? 'bg-green-500'
                      : callStatus.status === 'connecting'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  Call Status:{' '}
                  {callStatus.status.charAt(0).toUpperCase() + callStatus.status.slice(1)}
                </span>
              </div>
            </div>
            {callStatus.transcription && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-semibold mb-2">Transcription</h3>
                <p className="text-sm text-gray-600">{callStatus.transcription}</p>
              </div>
            )}
            {callStatus.functionResults.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-semibold mb-2">Function Results</h3>
                {callStatus.functionResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-2">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {dialogue.length > 0 && (
          <div className=" p-4 bg-gray-50 rounded-lg max-h-[500px] overflow-y-auto w-full max-w-md">
            <h3 className="text-sm font-semibold mb-2 text-gray-900">Dialogue</h3>
            {dialogue.map((item, index) => (
              <div
                key={index}
                className={`text-sm p-4 rounded-lg ${
                  item.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                } mb-2`}
              >
                {item.role}: {item.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
