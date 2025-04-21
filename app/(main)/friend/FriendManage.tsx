'use client'
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

export default function FriendManage () {
  const friendsData = useSelector((state: RootState) => state.friendsData);

  return (
    <div className="flex flex-col">
      {friendsData.friends.map((friend) => {
        return (
          <div key={`key_friend_` + friend.userTag} className="block">
            <p>{friend.userName ?? friend.userTag}</p>
          </div>
        );
      })}
    </div>
  )
}