"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import type { Prisma } from "@prisma/client";

export default function Main() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [users, setUsers] = useState<Prisma.UserSelect[]>([]);

  useEffect(() => {
    if(socket.connected) {
      onConnect()
    }

    function onConnect () {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect () {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [])

  return (
    <div className="">
      <main className="">
        <p>Status: { isConnected ? "connected" : "disconnected" }</p>
        <p>Transport4: { transport }</p>
        <div>
          {users.map((user) => {
            return (
              <div key={`key_user_` + user.id}>
                <p>{user.id}</p>
                <p>{user.name}</p>
                <p>{user.email}</p>
                <p>{user.createdAt}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
