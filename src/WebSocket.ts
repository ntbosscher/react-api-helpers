import { useEffect, useState } from "react";

export function useWebSocket(path: string, onMessage: (data: string) => void, onMessageDeps: any[], props?: {
  onOpen?(): void;
  onClose?(): void;
}) {
  const {onOpen, onClose} = (props || {});
  const [refresh, setRefresh] = useState(false);
  const [socket, setSocket] = useState<WebSocket|undefined>();

  useEffect(() => {
    const protocol = window.location.protocol === "http:" ? "ws:" : "wss:";
    const s = new WebSocket(
      protocol + "//" + window.location.host + path
    );
    setSocket(s);

    return () => {
      try {
        s.close();
      } catch (e) {}
    };
  }, [refresh, path]);

  useEffect(() => {
    if(!socket) return;
    if(!onOpen) return;

    socket.addEventListener("open", onOpen);
    return () => {
      socket.removeEventListener("open", onOpen);
    }
  }, [socket, onOpen])

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener("close", () => {
      if(onClose) onClose();
      setTimeout(() => {
        setRefresh((old) => !old);
      }, 1000);
    });
  }, [socket, onClose]);

  useEffect(() => {
    if (!socket) return;

    const callback = (e) => onMessage(e.data);
    socket.addEventListener("message", callback);

    return () => {
      socket.removeEventListener("message", callback);
    };
  }, [socket, onMessage]);

  return null;
}
