import { useState, useEffect, useCallback, useRef } from 'react';

const useChatWebSocket = (conversationId, onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('token');
    const socketUrl = `${protocol}//${host}/ws/chat/${conversationId}/?token=${token}`;

    console.log(`Connecting to WebSocket: ${socketUrl}`);
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (onMessageReceived) {
        onMessageReceived(data.message);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
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
  }, [conversationId, onMessageReceived]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        message: message
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  return { isConnected, sendMessage };
};

export default useChatWebSocket;
