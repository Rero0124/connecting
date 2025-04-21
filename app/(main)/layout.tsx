"use client";

import {setInitLoadEnd, setProfile} from "@/lib/features/saveData/saveDataSlice";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {socket} from "@/lib/socket";
import {useEffect, useState} from "react";
import Nav from "@/app/(main)/Nav";
import {setRooms} from "@/lib/features/roomData/roomDataSlice";
import {setAllowedMessages, setNotAllowedMessages} from "@/lib/features/messageData/messageDataSlice";
import {setFriends} from "@/lib/features/friendData/friendDataSlice";
import ChangeProfileModal from "./ChangeProfileModal";
import LoginModal from "./LoginModal";

export default function RootLayout({children}: {children: React.ReactNode}) {
    const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [loginModalKey, setLoginModalKey] = useState(0);
    const [profiles, setProfiles] = useState<any[]>([]);

    const saveData = useAppSelector((state) => state.saveData);
    const dispatch = useAppDispatch();

    async function getSaveData() {
        const [profileRes, roomRes, messageRes, friendRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/profile`, {cache: "no-store"}),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {cache: "no-store"}),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/message`, {cache: "no-store"}),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend`, {cache: "no-store"}),
        ]);

        if ([profileRes, roomRes, messageRes, friendRes].every((res) => res.status === 200)) {
            const [profileData, roomData, messageData, friendData] = await Promise.all([
                profileRes.json(),
                roomRes.json(),
                messageRes.json(),
                friendRes.json(),
            ]);

            dispatch(setProfile(profileData));
            dispatch(setRooms(roomData));
            dispatch(setAllowedMessages(messageData));
            dispatch(setNotAllowedMessages(messageData));
            dispatch(setFriends(friendData));
            dispatch(setInitLoadEnd());
        }
    }

    async function changeProfile() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check/profile`, {
            headers: {"Content-Type": "application/json"},
            cache: "no-store",
        });

        const data = await res.json();

        if (res.status === 200) {
            setOpenChangeProfileModal(true);
            setProfiles(data.profiles);
        }
    }

    async function selectProfile(profileId: number) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            cache: "no-store",
            body: JSON.stringify({profileId}),
        });

        if (res.status === 200) {
            location.reload();
        }
    }

    const handleRefresh = () => {
        location.reload();
    };

    useEffect(() => {
        if (!saveData.initLoad) {
            getSaveData().then(() => {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {cache: "no-store"})
                    .then((res) => res.json())
                    .then((data) => {
                        socket.emit("send", "userId", data.userId);
                    });
            });
        }
    }, []);

    return (
        <div className="flex flex-col h-full">
            {saveData.initLoad ? (
                <>
                    <header className="flex flex-row items-center justify-between h-16 border-b border-foreground px-4">
                        {/* 왼쪽 영역 */}
                        <div className="flex-1 flex items-center pl-4">
                            <p className="text-base font-medium">
                                {saveData.profile?.userName ?? saveData.profile?.userTag}
                            </p>
                        </div>

                        {/* 중앙 제목 */}
                        <div className="flex-none text-center">
                            <h1 className="text-lg font-semibold">{saveData.title}</h1>
                        </div>

                        {/* 오른쪽 버튼들 */}
                        <div className="flex-1 flex items-center justify-end gap-4 pr-4">
                            <label className="flex items-center gap-2">
                                <span>검색</span>
                                <input
                                    className="h-10 px-3 py-1 rounded border border-gray-500"
                                    placeholder="검색어 입력"
                                />
                            </label>

                            <div className="w-10 h-10 flex items-center justify-center rounded bg-background-room-icon text-sm border border-gray-600">
                                알림
                            </div>

                            <div className="w-10 h-10 flex items-center justify-center rounded bg-background-room-icon text-sm border border-gray-600">
                                ?
                            </div>

                            <button
                                onClick={changeProfile}
                                className="px-3 py-1 text-sm border border-gray-400 rounded hover:bg-gray-800"
                            >
                                프로필 변경
                            </button>

                            {/* <button
                                onClick={handleRefresh}
                                className="w-10 h-10 text-lg font-bold rounded border border-gray-400 hover:bg-gray-800 flex items-center justify-center"
                                title="새로고침"
                            >
                                ↻
                            </button> */}
                        </div>
                    </header>

                    <div className="flex flex-row grow">
                        <Nav />
                        {children}
                    </div>

                    <ChangeProfileModal
                        open={openChangeProfileModal}
                        profiles={profiles}
                        onClose={() => setOpenChangeProfileModal(false)}
                        onSelect={selectProfile}
                        onLoginAnotherAccount={() => {
                            setOpenChangeProfileModal(false);
                            setOpenLoginModal(true);
                        }}
                    />

                    <LoginModal key={loginModalKey} open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
                </>
            ) : (
                <div className="flex items-center justify-center h-screen bg-black text-white">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400">로딩 중입니다...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
