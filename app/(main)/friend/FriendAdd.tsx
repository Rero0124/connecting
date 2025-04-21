"use client";
import {useState} from "react";
import FriendAddPage from "./FriendAddPage";
import FriendSendPage from "./FriendSendPage";
import FriendReceivePage from "./FriendReceivePage";

export default function FriendAdd() {
    const [selectedMenu, setSelectedMenu] = useState<string>("send");

    function Menu({children, name, classname = ""}: {children: React.ReactNode; name: string; classname?: string}) {
        const onclick = () => {
            setSelectedMenu(name);
        };

        return (
            <div
                className={`hover:bg-background-light w-22 h-9 p-2 ml-2 my-2 rounded text-center leading-6 cursor-pointer ${classname}`}
                onClick={onclick}
            >
                {children}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row h-13 border-b-[1px]">
                <Menu name="send" classname={selectedMenu === "send" ? "bg-background-light" : ""}>
                    받은 신청
                </Menu>
                <Menu name="recive" classname={selectedMenu === "recive" ? "bg-background-light" : ""}>
                    보낸 신청
                </Menu>
                <Menu name="add" classname={selectedMenu === "add" ? "bg-background-light" : ""}>
                    친구 추가
                </Menu>
            </div>

            <div className="flex flex-col grow">
                {selectedMenu === "send" && <FriendReceivePage />}
                {selectedMenu === "recive" && <FriendSendPage />}
                {selectedMenu === "add" && <FriendAddPage />}
            </div>
        </div>
    );
}
