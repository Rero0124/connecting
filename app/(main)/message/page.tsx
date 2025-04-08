"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Link from "next/link";
import { useAppDispatch } from "@/lib/hooks";
import { setTitle } from "@/lib/features/savedata/savedataSlice";
import { useEffect } from "react";

export default function Main() {
  const savedata = useSelector((state: RootState) => state.savedata);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setTitle('friends'))
  }, [])

  return (
    <div className="">
      <main className="">
        <div className="flex flex-col">
          {savedata.friends.map((friend) => {
            return (
              <Link key={`key_friend_` + friend.id} href={`/friends/${friend.id}`} className="block">
                <p>{friend.name}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
