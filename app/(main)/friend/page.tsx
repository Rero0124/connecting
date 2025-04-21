"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import FriendList from "./FriendList";
import FriendAdd from "./FriendAdd";
import FriendManage from "./FriendManage";

export default function Main() {
  const { selectedFriendMenu } = useSelector((state: RootState) => state.saveData);

  return (
    <>
      { selectedFriendMenu === 'list' ? <FriendList /> : selectedFriendMenu === 'add' ? <FriendAdd /> : selectedFriendMenu === 'manage' ? <FriendManage /> : <></> }
    </>
  );
}
