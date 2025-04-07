'use client'

import { setFriends, setInitLoadEnd, setRooms } from "@/lib/features/savedata/savedataSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function RootLayout({
  children,
  nav
}: Readonly<{
  children: React.ReactNode;
  nav: React.ReactNode;
}>) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const savedata = useSelector((state: RootState) => state.savedata);
  const dispatch = useAppDispatch();

  const getRoomInfo = async () => {
    const roomRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, { next: { tags: ["rooms"] } });
    const friendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, { next: { tags: ["friends"] } });
    if(roomRes.status === 200 && friendRes.status === 200) {
      const roomData = await roomRes.json()
      const friendData = await friendRes.json()
      dispatch(setRooms(roomData))
      dispatch(setFriends(friendData))
      dispatch(setInitLoadEnd())
    }
  }

  if(!savedata.initLoad) {
    getRoomInfo()
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      { savedata.initLoad ? <>
        {nav}
        {children}
      </> : <>
        <div>
          로딩중입니다.
        </div>
      </> }      
    </div>
  );
}
