import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export function useSocket(
  socketUrl: string,
  callbacks: { [key: string]: (data: any) => void }
) {
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) {
      setUuid(uuidv4());
    }
  }, [uuid]);

  const [socket, setSocket] = useState<Socket | null>(null);

  const url =
    "ws://" + socketUrl.replace("http://", "").replace("https://", "");

  useEffect(() => {
    console.log("Connecting to Socket URL: ", url);
    const s = io(url, { transports: ["websocket"] });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [socketUrl, uuid]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected...");
        socket.emit("register", uuid);
      });

      Object.entries(callbacks).forEach(([event, callback]) => {
        socket.on(event, callback);
      });

      return () => {
        Object.entries(callbacks).forEach(([event, callback]) => {
          socket.off(event, callback);
        });
      };
    }
  }, [socket, callbacks, uuid]);

  return uuid;
}
