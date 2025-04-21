'use client'
import { setSelectedFriendSubMenu } from "@/lib/features/saveData/saveDataSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function FriendList () {
  const { friends } = useSelector((state: RootState) => state.friendsData);
  const { selectedFriendSubMenu } = useSelector((state: RootState) => state.saveData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if(!(selectedFriendSubMenu === 'all' || selectedFriendSubMenu === 'online' || selectedFriendSubMenu === 'favorite')) {
      dispatch(setSelectedFriendSubMenu('all'))
    } 
  }, [])

  function Menu ({ children, name, classname = '' }: { 
    children: React.ReactNode;
    name: string; 
    classname?: string;
  }) {
    const onClick = () => {
      dispatch(setSelectedFriendSubMenu(name))
    }
  
    return (
      <div className={`hover:bg-background-light w-22 h-9 p-2 ml-2 my-2 rounded text-center leading-6 ${classname}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row h-13 border-b-[1px]">
        <Menu name="all" classname={selectedFriendSubMenu === 'all' ? 'bg-background-light' : 'hover:bg-background-light'}>모두</Menu>
        <Menu name="online" classname={selectedFriendSubMenu === 'online' ? 'bg-background-light' : 'hover:bg-background-light'}>온라인</Menu>
        <Menu name='favorite' classname={selectedFriendSubMenu === 'favorite' ? 'bg-background-light' : 'hover:bg-background-light'}>친한친구</Menu>
      </div>
      <div className="flex flex-col grow">
        {friends.map((friend) => {
          return (
            <div key={`key_friend_` + friend.userTag} className="block">
              <p>{friend.userName ?? friend.userTag}</p>
            </div>
          );
        })}
      </div>
    </div>
  )
}