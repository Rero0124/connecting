"use client";

import DragAbleDiv, {DragAbleDivOption} from "@/app/_components/DragAbleDiv";
import {setNavSize, setSelectedMessageMenu, setTitle} from "@/lib/features/saveData/saveDataSlice";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {useEffect, useRef} from "react";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const {navSize, title, selectedMessageMenu} = useAppSelector((state) => state.saveData);
    const dispatch = useAppDispatch();

    const navRef = useRef<HTMLDivElement>(null);

    const messageMenus: {
        name: string;
        title?: string;
    }[] = [
        {
            name: "allow",
            title: "메세지 요청",
        },
        {
            name: "send",
            title: "메세지",
        },
    ];

    const getMessageMenuTitle = (name: string) => messageMenus.find((v) => v.name === name)?.title;

    const onDragEnd = ({x}: {x: number}) => {
        dispatch(setNavSize(x));
    };

    const onDragging = ({x}: {x: number}) => {
        if (navRef.current) {
            navRef.current.style.width = `${x}px`;
        }
    };

    useEffect(() => {
        if (!selectedMessageMenu) {
            dispatch(setSelectedMessageMenu("send"));
            dispatch(setTitle(getMessageMenuTitle("send") ?? "send"));
        } else {
            dispatch(setTitle(getMessageMenuTitle(selectedMessageMenu) ?? selectedMessageMenu));
        }
    }, []);

    useEffect(() => {
        document.title = title;
    }, [title]);

    const dragAbleDivOption: DragAbleDivOption = {
        direction: "right",
        hoverSize: 8,
        onDraggingInterval: 0,
        minWidth: 180,
        maxWidth: 300,
        hoverColor: "background-light",
    };

    function Menu({children, name, classname = ""}: {children?: React.ReactNode; name: string; classname?: string}) {
        const onClick = () => {
            dispatch(setSelectedMessageMenu(name));
            dispatch(setTitle(getMessageMenuTitle(name) ?? name));
        };

        return (
            <div className={`block h-12 px-2.5 py-0.5 leading-12 mb-1 rounded ${classname}`} onClick={onClick}>
                {children}
            </div>
        );
    }

    return (
        <>
            <DragAbleDiv
                classname="bg-background border-r-[1px]"
                option={dragAbleDivOption}
                onDragging={onDragging}
                onDragEnd={onDragEnd}
            >
                <div
                    ref={navRef}
                    className="bg-background flex flex-col h-full pl-2.5 pr-1 py-2"
                    style={{width: navSize}}
                >
                    <Menu
                        name="allow"
                        classname={
                            selectedMessageMenu === "allow" ? "bg-background-light" : "hover:bg-background-light"
                        }
                    >
                        메세지 요청 & 스팸
                    </Menu>
                    <hr className="" />
                    <div className="flex flex-row px-2.5 py-0.5 mb-1 justify-between min-h-12 leading-12">
                        <span>메세지</span>
                        <div className="flex flex-row justify-between w-8">
                            <span>+</span>
                            <span>∇</span>
                        </div>
                    </div>
                    <Menu name="send" classname="flex h-auto"></Menu>
                </div>
            </DragAbleDiv>
            <div className="grow">{children}</div>
            <div className="flex flex-col w-72 border-l-[1px]">
                <div className="block h-12 px-2.5 py-0.5 leading-12">중요 알림 (친한친구 채팅 및 약속)</div>
            </div>
        </>
    );
}
