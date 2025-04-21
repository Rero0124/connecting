"use client";

import {setInitLoadEnd, setProfile} from "@/lib/features/savedata/saveDataSlice";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {socket} from "@/lib/socket";
import {useEffect, useState} from "react";
import Nav from "@/app/(main)/Nav";
import {setRooms} from "@/lib/features/roomData/roomDataSlice";
import {setAllowedMessages, setNotAllowedMessages} from "@/lib/features/messageData/messageDataSlice";
import {setFriends} from "@/lib/features/friendData/friendDataSlice";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");

    const saveData = useAppSelector((state) => state.saveData);
    const dispatch = useAppDispatch();

    async function getSaveData() {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/profile`, {
            cache: "no-store",
        });
        const roomRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
            cache: "no-store",
        });
        const messageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message`, {
            cache: "no-store",
        });
        const friendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend`, {
            cache: "no-store",
        });
        if (
            profileRes.status === 200 &&
            roomRes.status === 200 &&
            messageRes.status === 200 &&
            friendRes.status === 200
        ) {
            const profileData = await profileRes.json();
            const roomData = await roomRes.json();
            const messageData = await messageRes.json();
            const friendData = await friendRes.json();
            dispatch(setProfile(profileData));
            dispatch(setRooms(roomData));
            dispatch(setAllowedMessages(messageData));
            dispatch(setNotAllowedMessages(messageData));
            dispatch(setFriends(friendData));
            dispatch(setInitLoadEnd());
        }
    }

    useEffect(() => {
        if (!saveData.initLoad) {
            getSaveData().then(() => {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
                    cache: "no-store",
                })
                    .then((res) => res.json())
                    .then((data) => {
                        socket.emit("send", "userId", data.userId);
                    });
            });
        }

        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });

            socket.on("updated", (type: string) => {
                switch (type) {
                    case "profile":
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/profile`, {
                            cache: "no-store",
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                dispatch(setProfile(data));
                            });
                        break;
                    case "messageList":
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/message`, {
                            cache: "no-store",
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                dispatch(setAllowedMessages(data));
                                dispatch(setNotAllowedMessages(data));
                            });
                        break;
                    case "roomList":
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
                            cache: "no-store",
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                dispatch(setRooms(data));
                            });
                        break;
                    case "friendList":
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend`, {
                            cache: "no-store",
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                dispatch(setFriends(data));
                            });
                        break;
                }
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return (
        <div className="flex flex-col h-full">
            {saveData.initLoad ? (
                <>
                    <div className="flex flex-row justify-between h-16 leading-16">
                        <div className="w-12 h-12 mx-3 my-2 px-2 py-1 text-[2.5rem] leading-9 bg-background-room-icon rounded-xl">
                            ↻
                        </div>
                        <p>
                            개인 - {saveData.profile?.userName ?? saveData.profile?.userTag} - {saveData.title}
                        </p>
                        <div className="flex flex-row mx-3 my-2">
                            <label className="flex">
                                <span className="leading-9 mr-2">⇲</span>
                                <input className="block h-10" placeholder="검색" />
                            </label>
                            <div className="w-12 h-12 mx-1 px-2 py-1 leading-9 bg-background-room-icon rounded-xl">
                                알람
                            </div>
                            <div className="w-12 h-12 mx-1 px-2 py-1 leading-9 text-center bg-background-room-icon rounded-xl">
                                ?
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row grow border-t-2 border-foreground">
                        <Nav />
                        {children}
                    </div>
                </>
            ) : (
                <div>로딩중입니다.</div>
            )}
        </div>
    );
}
