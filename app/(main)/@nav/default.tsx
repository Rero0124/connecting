'use client'

import { RootState } from "@/lib/store";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Nav() {
  const { rooms } = useSelector((state: RootState) => state.savedata);

  return (
    <div className="w-18">
      <Link href={`/friends/`} className="block w-12 h-12 m-3 p-0.5 bg-background-room-icon rounded-lg">
        DM
      </Link>
      <hr className="w-10 mx-4 mb-3" />
      {
        rooms.map((room) => {
          return (
            <Link key={`nav_room_link_${room.id}`} href={`/room/${room.id}`} className="block w-12 h-12 mx-3 my-2 p-0.5 bg-background-room-icon rounded-lg">
              {room.name}
            </Link>
          )
        })
      }
      { rooms.length > 0 ? <hr className="w-10 mx-4 m-3" /> : <></> } 
      <Link href="/" className="block w-12 h-12 mx-3 my-2 p-0.5 bg-background-room-icon rounded-lg">
        생성
      </Link>
      <Link href="/" className="block w-12 h-12 mx-3 my-2 p-0.5 bg-background-room-icon rounded-lg">
        검색
      </Link>
    </div>
  )
}