'use client'

import { RootState } from "@/lib/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";


export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { navSize } = useSelector((state: RootState) => state.savedata);

  useEffect(() => {
    document.title = 'DM'
  }, [])

  return (
    <>
      <div className="flex flex-col border-r-[1px]" style={{ width: navSize }}>
        <div className="block h-12 px-2.5 py-0.5 leading-12">
          메세지 요청 & 스팸
        </div>
        <hr className="my-1" />
        <div className="flex flex-col min-h-12 px-2.5 py-0.5">
          <div className="flex flex-row justify-between min-h-12 leading-12">
            <span>메세지</span>
            <div className="flex flex-row justify-between w-8">
              <span>+</span>
              <span>∇</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grow">
        {children}
      </div>
      <div className="flex flex-col w-72 border-l-[1px]">
        <div className="block h-12 px-2.5 py-0.5 leading-12">
          중요 알림 (친한친구 채팅 및 약속)
        </div>
      </div>
    </>
  );
}
