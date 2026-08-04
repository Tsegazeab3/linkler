import { useState, useEffect, useCallback, useRef } from 'react';

const useChatWebSocket = (conversationId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      console.warn('No valid token found, skipping WebSocket connection');
      return;
    }
    const socketUrl = `${protocol}//${host}/ws/chat/${conversationId}/?token=${token}`;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastEvent(data);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [conversationId]);

  const sendEvent = useCallback((type, payload = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type,
        ...payload
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  return { isConnected, sendEvent, lastEvent };
};

export default useChatWebSocket;
