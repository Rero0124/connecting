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

<<<<<<< HEAD
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false);
  const [profiles, setProfiles] = useState<{
    id: number;
    userTag: string;
    userName?: string;
    isCompany: boolean;
    information?: string;
    image: string;
    createdAt: Date;
  }[]>();
=======
export default function RootLayout({children}: {children: React.ReactNode}) {
    const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [loginModalKey, setLoginModalKey] = useState(0);
    const [profiles, setProfiles] = useState<any[]>([]);
>>>>>>> 8d7cbae3435b75188e345cfe1eda49768fe672d5

    const saveData = useAppSelector((state) => state.saveData);
    const dispatch = useAppDispatch();

    async function getSaveData() {
        const [profileRes, roomRes, messageRes, friendRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/profile`, {cache: "no-store"}),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {cache: "no-store"}),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/message`, {cache: "no-store"}),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend`, {cache: "no-store"}),
        ]);

<<<<<<< HEAD
  async function changeProfile () {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check/profile`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'force-cache',
    })

    const data: {
      result?: boolean;
      message: string;
      profiles?: {
        id: number;
        userTag: string;
        userName?: string;
        isCompany: boolean;
        information?: string;
        image: string;
        createdAt: Date;
      }[];
    } = await res.json()

    if(res.status === 200) {
      setOpenChangeProfileModal(true);
      setProfiles(data.profiles);
    }
  }

  async function selectProfile (profileId: number) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'force-cache',
      body: JSON.stringify({
        profileId
      })
    })

    const data: {
      result?: boolean;
      message: string;
    } = await res.json()

    if(res.status === 200) {
      location.reload();
    }
  }

  const closeChangeProfileModal = () => {
    setOpenChangeProfileModal(false);
  }

  useEffect(() => {
    if(!saveData.initLoad) {
      getSaveData().then(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
          cache: 'no-store',
        }).then(res => res.json()).then(data => {
          socket.emit('send', 'userId', data.userId)
        })
      })
    }
    
    if(socket.connected) {
      onConnect()
    }
=======
        if ([profileRes, roomRes, messageRes, friendRes].every((res) => res.status === 200)) {
            const [profileData, roomData, messageData, friendData] = await Promise.all([
                profileRes.json(),
                roomRes.json(),
                messageRes.json(),
                friendRes.json(),
            ]);
>>>>>>> 8d7cbae3435b75188e345cfe1eda49768fe672d5

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

<<<<<<< HEAD
  return (
    <div className="flex flex-col h-full">
      { saveData.initLoad ? (
        <>
          <div className="flex flex-row justify-between h-16 leading-16">
            <div className="w-12 h-12 mx-3 my-2 px-2 py-1 text-[2.5rem] leading-9 bg-background-room-icon rounded-xl" onClick={changeProfile}>
              ↻
            </div>
            <p>개인 - {saveData.profile?.userName ?? saveData.profile?.userTag} - {saveData.title}</p>
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
          {
            openChangeProfileModal && (
              <div className="absolute flex flex-col justify-center items-center p-12 border-[1px] rounded-lg bg-background">
                <div className="absolute top-0 right-0 p-3 cursor-pointer" onClick={closeChangeProfileModal}>X</div>
                <div className="h-14 mb-4 text-4xl text-center">
                  <p>Select Profile</p>
                </div>
                <div className="flex flex-col min-w-60">
                  {
                    profiles ? profiles.map((profile) => {
                      return (
                        <div key={`login_user_profile_${profile.id}`} className="flex flex-row w-full h-10 p-2 mt-2 border-[1px] rounded" onClick={() => { selectProfile(profile.id) }}>
                          <img className="mr-2" src={profile.image} />
                          <span className="mr-2">{profile.isCompany ? '업무' : '개인'} - </span>
                          <span>{profile.userName ? `${profile.userName}(${profile.userTag})` : profile.userTag}</span>
                        </div>
                      )
                    }) : <></>
                  }
                </div>
              </div>
            )
          }
        </>
      ) : (
        <div>
          로딩중입니다.
=======
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
>>>>>>> 8d7cbae3435b75188e345cfe1eda49768fe672d5
        </div>
    );
}
