import { useEffect, useState, useRef } from 'react';
import { browserWindowId } from './BrowserWindowId';
import { useAuthenticated } from './Auth';

export function useWebSocket(
  path: string,
  onMessage: (data: string) => void,
  onMessageDeps: any[],
  props?: {
    onOpen?(socket: WebSocket, e: Event): void;
    onClose?(socket: WebSocket, e: Event): void;
  },
) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const [refresh, setRefresh] = useState(false);
  const [socket, setSocket] = useState<WebSocket | undefined>();
  const [ready, setReady] = useState(false);
  const auth = useAuthenticated();
  const isAuthenticated = auth.authenticated;

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
        if (s.readyState === WebSocket.CLOSED || s.readyState === WebSocket.CLOSING) {
          return;
        }

        s.close();
      } catch (e) {}
    };
  }, [refresh, path, isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const callback = (e: Event) => {
      setReady(true);

      if (!propsRef.current?.onOpen) return;
      propsRef.current.onOpen(socket, e);
    };

    socket.addEventListener('open', callback);
    return () => {
      socket.removeEventListener('open', callback);
    };
  }, [socket, propsRef]);

  const lastRefreshRef = useRef([]);

  useEffect(() => {
    if (!socket) return;
    let timeout: any = 0;

    socket.addEventListener('close', (e) => {
      setReady(false);
      if (propsRef.current?.onClose) propsRef.current.onClose(socket, e);

      let retryIn = 1000;
      if(e.code === 1006) {
        retryIn = 10 * 1000;

        const now = new Date().getTime();
        const last5min = lastRefreshRef.current.filter(r => r > now - 5 * 60 * 1000);
        if(last5min.length > 5) {
          retryIn = 30 * 1000;
        }
      }

      timeout = setTimeout(
        () => {
          lastRefreshRef.current.push(new Date().getTime());
          setRefresh((old) => !old);
        },
        retryIn,
      );
    });

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [socket, propsRef]);

  useEffect(() => {
    if (!socket) return;

    const callback = (e) => onMessage(e.data);
    socket.addEventListener('message', callback);

    return () => {
      socket.removeEventListener('message', callback);
    };
  }, [socket, onMessage]);

  // only return socket once it's ready to make things more straightforward for people
  // doing stuff like `useEffect(() => {}, [socket, projectId]);`
  return ready ? socket : undefined;
}
