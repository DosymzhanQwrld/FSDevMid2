'use client';
import { useEffect, useState, useRef } from 'react';

export default function useWebSocket(token, onMessage) {
  const [status, setStatus] = useState('disconnected');
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token) return;

    const url = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000') + '/ws';
    const socket = new WebSocket(url, token);

    socket.onopen = () => setStatus('connected');
    socket.onclose = () => setStatus('disconnected');
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch (err) {}
    };

    return () => socket.close();
  }, [token]);

  return status;
}