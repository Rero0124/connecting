'use client'

import DragAbleDiv, { DragAbleDivOption } from "@/app/_components/DragAbleDiv";
import { setNavSize } from "@/lib/features/savedata/savedataSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { navSize } = useSelector((state: RootState) => state.savedata);
  const dispatch = useAppDispatch();

  const onDragEnd = ({ movedPx }: { movedPx: number }) => {
    dispatch(setNavSize(navSize + movedPx))
  }

  useEffect(() => {
    document.title = '친구'
  }, [])

  const dragAbleDivOption: DragAbleDivOption = {
    direction: 'right',
    borderSize: 3
  }

  return (
    <>
      <DragAbleDiv classname="bg-foreground pr-[3px]" option={dragAbleDivOption} onDragEnd={onDragEnd}>
        <div className="bg-background flex flex-col h-full" style={{ width: navSize }}>
          <div className="block h-12 px-2.5 py-0.5 leading-12">
            친구목록
          </div>
          <hr className="my-1" />
          <div className="block h-12 px-2.5 py-0.5 leading-12">
            친구추가
          </div>
          <hr className="my-1" />
          <div className="block h-12 px-2.5 py-0.5 leading-12">
            친구관리
          </div>
          <hr className="my-1" />
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
