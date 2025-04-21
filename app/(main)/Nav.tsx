import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import Link from "next/link";
import { useSelector } from "react-redux";

const NavButton = ({ href, children, className = '' }: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Link href={href} className={`block w-12 h-12 mx-3 my-1.5 p-0.5 bg-background-room-icon rounded-lg ` + className}>
      {children}
    </Link>
  )
}

const NavSepar = () => {
  return (
    <hr className="w-10 mx-4 m-3" />
  )
}

export default function Nav () {
  const roomDate = useAppSelector(state => state.roomDate);

  return (
    <div className="flex flex-col h-full w-18 py-2 border-r-[1px]">
      <div className="flex flex-col grow overflow-y-auto h-0">
        <div className="relative inset-0 overflow-y-auto">
          <NavButton href="/friend">
            친구
          </NavButton>
          <NavButton href="/message">
            DM
          </NavButton>
          <NavSepar />
          {
            roomDate.rooms.map((room) => {
              return (
                <NavButton key={`nav_room_link_${room.id}`} href={`/room/${room.id}`}>
                  {room.name}
                </NavButton>
              )
            })
          }
          { roomDate.rooms.length > 0 && <NavSepar /> } 
          <NavButton href="/">
            생성
          </NavButton>
          <NavButton href="/">
            검색
          </NavButton>
        </div>
      </div>
      <NavButton href="/">
        설정
      </NavButton>
      <NavButton href="/">
        프로필
      </NavButton>
    </div>
  )
}