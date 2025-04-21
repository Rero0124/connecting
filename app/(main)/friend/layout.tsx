'use client'

import DragAbleDiv, { DragAbleDivOption } from "@/app/_components/DragAbleDiv";
import { setNavSize, setSelectedFriendMenu, setTitle } from "@/lib/features/saveData/saveDataSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useRef } from "react";

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { navSize, title, selectedFriendMenu } = useAppSelector(state => state.saveData);
  const dispatch = useAppDispatch();

  const navRef = useRef<HTMLDivElement>(null);

  const onDragEnd = ({ x }: { x: number }) => {
    dispatch(setNavSize(x))
  }

  const onDragging = ({ x }: { x: number }) => {
    if(navRef.current) {
      navRef.current.style.width = `${x}px`;
    }
  }

  const friendMenus: {
    name: string;
    title?: string;
  }[] = [{
    name: 'list',
    title: '친구 목록'
  }, {
    name: 'add',
    title: '친구 추가'
  }, {
    name: 'manage',
    title: '친구 관리'
  }];
  
  const getFriendMenuTitle = (name: string) => friendMenus.find(v => name.endsWith(v.name))?.title

  useEffect(() => {
    if(!selectedFriendMenu) {
      dispatch(setSelectedFriendMenu(friendMenus[0].name))
      dispatch(setTitle(friendMenus[0].title ?? friendMenus[0].name))
    } else {
      dispatch(setTitle(getFriendMenuTitle(selectedFriendMenu) ?? selectedFriendMenu))
    }
  }, [])

  useEffect(() => {
    document.title = title
  }, [title])

  const dragAbleDivOption: DragAbleDivOption = {
    direction: 'right',
    hoverSize: 8,
    onDraggingInterval: 0,
    minWidth: 180,
    maxWidth: 300,
    hoverColor: 'background-light'
  }

  function Menu ({ children, name, classname = '' }: { 
    children: React.ReactNode;
    name: string; 
    classname?: string;
  }) {
    const onClick = () => {
      dispatch(setSelectedFriendMenu(name))
      dispatch(setTitle(getFriendMenuTitle(name) ?? name))
    }
  
    return (
      <div className={`block h-12 px-2.5 py-0.5 leading-12 mb-1 rounded ${classname}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <>
      <DragAbleDiv classname="bg-background" option={dragAbleDivOption} onDragging={onDragging} onDragEnd={onDragEnd}>
        <div ref={navRef} className="bg-background flex flex-col h-full pl-2.5 pr-1 py-2" style={{ width: navSize }}>
          <Menu name="list" classname={selectedFriendMenu === 'list' ? 'bg-background-light' : 'hover:bg-background-light'}>
            친구목록
          </Menu>
          <Menu name="add" classname={selectedFriendMenu === 'add' ? 'bg-background-light' : 'hover:bg-background-light'}>
            친구추가
          </Menu>
          <Menu name="manage" classname={selectedFriendMenu === 'manage' ? 'bg-background-light' : 'hover:bg-background-light'}>
            친구 관리
          </Menu>
        </div>
      </DragAbleDiv>
      <div className="grow">
        {children}
      </div>
      <div className="flex flex-col w-72 border-l-[1px]">
        <div className="block h-12 px-2.5 py-0.5 leading-12">
          현재 활동중
        </div>
      </div>
    </>
  );
}
