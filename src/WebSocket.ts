import { useEffect, useState } from 'react';
import { browserWindowId } from './BrowserWindowId';

export function useWebSocket(
  path: string,
  onMessage: (data: string) => void,
  onMessageDeps: any[],
  props?: {
    onOpen?(socket: WebSocket, e: Event): void;
    onClose?(socket: WebSocket, e: Event): void;
  },
) {
  const { onOpen, onClose } = props || {};
  const [refresh, setRefresh] = useState(false);
  const [socket, setSocket] = useState<WebSocket | undefined>();

  useEffect(() => {
    const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';

    const pathParts = path.split('?');
    if (pathParts.length === 1) {
      pathParts.push('');
    }

    const query = new URLSearchParams(pathParts[1]);
    query.set('browser-window-id', browserWindowId);
    pathParts[1] = query.toString();

    path = pathParts.join('?');

    const s = new WebSocket(protocol + '//' + window.location.host + path);
    setSocket(s);

    return () => {
      try {
        s.close();
      } catch (e) {}
    };
  }, [refresh, path]);

  useEffect(() => {
    if (!socket) return;
    if (!onOpen) return;

    const callback = (e: Event) => {
      onOpen(socket, e);
    };

    socket.addEventListener('open', callback);
    return () => {
      socket.removeEventListener('open', callback);
    };
  }, [socket, onOpen]);

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener('close', (e) => {
      if (onClose) onClose(socket, e);
      setTimeout(() => {
        setRefresh((old) => !old);
      }, 1000);
    });
  }, [socket, onClose]);

  useEffect(() => {
    if (!socket) return;

    const callback = (e) => onMessage(e.data);
    socket.addEventListener('message', callback);

    return () => {
      socket.removeEventListener('message', callback);
    };
  }, [socket, onMessage]);

  return socket;
}
