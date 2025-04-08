'use client'

import { setFriends, setInitLoadEnd, setRooms } from "@/lib/features/savedata/savedataSlice";
import { useAppDispatch } from "@/lib/hooks";
import { socket } from "@/lib/socket";
import { RootState } from "@/lib/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Nav from "@/app/_components/Nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const savedata = useSelector((state: RootState) => state.savedata);
  const dispatch = useAppDispatch();

  async function getRoomInfo () {
    const roomRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, { next: { tags: ["rooms"] } });
    const friendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend`, { next: { tags: ["friends"] } });
    if(roomRes.status === 200 && friendRes.status === 200) {
      const roomData = await roomRes.json()
      const friendData = await friendRes.json()
      dispatch(setRooms(roomData))
      dispatch(setFriends(friendData))
      dispatch(setInitLoadEnd())
    }
  }

  useEffect(() => {
    if(!savedata.initLoad) {
      getRoomInfo()
    }
    
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
    <div className="flex flex-col h-full">
      { savedata.initLoad ? <>
        <div className="flex flex-row justify-center h-14">
          <p>{savedata.title}</p>
        </div>
        <div className="flex flex-row grow border-t-2 border-foreground">
          <Nav />
          {children}
        </div>
      </> : <>
        <div>
          로딩중입니다.
        </div>
      </> }     
    </div>
  );
}
