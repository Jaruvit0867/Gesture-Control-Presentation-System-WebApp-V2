import { useState, useEffect, useCallback, useRef } from 'react';
import * as Ably from 'ably';

// TODO: Implement Token Authentication for production
// Currently using API key directly for development
// See: https://ably.com/docs/auth/token

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useRemoteSession = ({ onCommand, currentPage, totalPages }) => {
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const ablyRef = useRef(null);
  const channelRef = useRef(null);

  const initializeAbly = useCallback(async () => {
    const apiKey = import.meta.env.VITE_ABLY_API_KEY;
    if (!apiKey) {
      console.error('VITE_ABLY_API_KEY is not set');
      return null;
    }

    try {
      const ably = new Ably.Realtime({
        key: apiKey,
        clientId: `presenter-${Date.now()}`,
      });

      return new Promise((resolve, reject) => {
        ably.connection.on('connected', () => {
          setIsConnected(true);
          resolve(ably);
        });
        ably.connection.on('failed', (err) => {
          console.error('Ably connection failed:', err);
          setIsConnected(false);
          reject(err);
        });
        ably.connection.on('disconnected', () => setIsConnected(false));
      });
    } catch (error) {
      console.error('Failed to initialize Ably:', error);
      return null;
    }
  }, []);

  const startSession = useCallback(async () => {
    if (ablyRef.current) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      return newSessionId;
    }

    try {
      const ably = await initializeAbly();
      if (!ably) return null;

      ablyRef.current = ably;
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      setIsEnabled(true);
      return newSessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [initializeAbly]);

  const stopSession = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.presence.leave();
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (ablyRef.current) {
      ablyRef.current.close();
      ablyRef.current = null;
    }
    setSessionId(null);
    setIsConnected(false);
    setRemoteConnected(false);
    setIsEnabled(false);
  }, []);

  const toggleRemoteMode = useCallback(async () => {
    if (isEnabled) {
      stopSession();
    } else {
      await startSession();
    }
  }, [isEnabled, startSession, stopSession]);

  useEffect(() => {
    if (!sessionId || !ablyRef.current) return;

    const channelName = `presenter-${sessionId}`;
    const channel = ablyRef.current.channels.get(channelName);
    channelRef.current = channel;

    channel.subscribe('command', (message) => {
      const { action } = message.data;
      if (onCommand) onCommand(action);
    });

    channel.presence.enter({ role: 'presenter' });

    channel.presence.subscribe('enter', (member) => {
      if (member.data?.role === 'remote') {
        setRemoteConnected(true);
        channel.publish('sync', { currentPage, totalPages });
      }
    });

    channel.presence.subscribe('leave', (member) => {
      if (member.data?.role === 'remote') setRemoteConnected(false);
    });

    channel.presence.get((err, members) => {
      if (!err && members) {
        setRemoteConnected(members.some(m => m.data?.role === 'remote'));
      }
    });

    return () => {
      channel.unsubscribe();
      channel.presence.leave();
    };
  }, [sessionId, onCommand]);

  useEffect(() => {
    if (!channelRef.current || !remoteConnected) return;
    channelRef.current.publish('sync', { currentPage, totalPages });
  }, [currentPage, totalPages, remoteConnected]);

  useEffect(() => {
    return () => {
      if (ablyRef.current) ablyRef.current.close();
    };
  }, []);

  return {
    sessionId,
    isConnected,
    remoteConnected,
    isEnabled,
    startSession,
    stopSession,
    toggleRemoteMode,
  };
};

export const useRemoteController = (sessionId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [presenterConnected, setPresenterConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [connectionError, setConnectionError] = useState(null);

  const ablyRef = useRef(null);
  const channelRef = useRef(null);

  const sendCommand = useCallback((action) => {
    if (!channelRef.current || !presenterConnected) return;
    channelRef.current.publish('command', { action });
  }, [presenterConnected]);

  useEffect(() => {
    if (!sessionId) return;

    const apiKey = import.meta.env.VITE_ABLY_API_KEY;
    if (!apiKey) {
      setConnectionError('API key not configured');
      return;
    }

    const ably = new Ably.Realtime({
      key: apiKey,
      clientId: `remote-${Date.now()}`,
    });
    ablyRef.current = ably;

    ably.connection.on('connected', () => {
      setIsConnected(true);
      setConnectionError(null);

      const channelName = `presenter-${sessionId}`;
      const channel = ably.channels.get(channelName);
      channelRef.current = channel;

      channel.subscribe('sync', (message) => {
        setCurrentPage(message.data.currentPage);
        setTotalPages(message.data.totalPages);
      });

      channel.presence.enter({ role: 'remote' });

      channel.presence.subscribe('enter', (member) => {
        if (member.data?.role === 'presenter') setPresenterConnected(true);
      });

      channel.presence.subscribe('leave', (member) => {
        if (member.data?.role === 'presenter') setPresenterConnected(false);
      });

      channel.presence.get((err, members) => {
        if (!err && members) {
          setPresenterConnected(members.some(m => m.data?.role === 'presenter'));
        }
      });
    });

    ably.connection.on('failed', () => {
      setIsConnected(false);
      setConnectionError('Connection failed. Please try again.');
    });

    ably.connection.on('disconnected', () => setIsConnected(false));

    return () => {
      if (channelRef.current) {
        channelRef.current.presence.leave();
        channelRef.current.unsubscribe();
      }
      if (ablyRef.current) ablyRef.current.close();
    };
  }, [sessionId]);

  return {
    isConnected,
    presenterConnected,
    currentPage,
    totalPages,
    sendCommand,
    connectionError,
  };
};

export default useRemoteSession;
