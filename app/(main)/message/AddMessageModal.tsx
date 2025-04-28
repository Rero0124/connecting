'use client'
import { useAppSelector } from '@/src/lib/hooks';
import Image from 'next/image';
import { useState } from 'react';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
  const saveData = useAppSelector(state => state.saveData);

  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState(saveData.profile?.image ?? '')
	const [imageEncoded, setImageEncoded] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchedUsers, setSearchedUsers] = useState<{
    image: string;
    id: number;
    userId: number;
    userTag: string;
    isCompany: boolean;
    userName: string | null;
    isOnline: boolean;
    statusName: string | null;
    information: string | null;
    createdAt: Date;
  }[]>([]);
  

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setRecipients(selectedOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			const result = reader.result as string
			if (result?.startsWith('data:image')) {
				setImagePreview(result)
				setImageEncoded(result) // 전체 data:image/... 문자열 저장
			} else {
				setImagePreview('')
				setImageEncoded(null)
			}
		}
		reader.onerror = () => {
			setImagePreview('')
			setImageEncoded(null)
		}
		reader.readAsDataURL(file)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/message`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        profileData: imageEncoded,
        profileIds: recipients,
      })
    })
    onClose();
  };


  const handleSearchUserTag = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchText(e.currentTarget.value);
    if(e.currentTarget.value !== '') {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/user/${e.currentTarget.value}`);
      const users: {
        image: string;
        id: number;
        userId: number;
        userTag: string;
        isCompany: boolean;
        userName: string | null;
        isOnline: boolean;
        statusName: string | null;
        information: string | null;
        createdAt: Date;
      }[] = await res.json();
      
      if(res.status === 200) {
        setSearchedUsers(users);
      }
    }

  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50">
      <div className="bg-background-light rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-semibold mb-4">새 DM 생성</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>
              <Image alt="DM 이미지" src={imagePreview} width={0} height={0} className="w-14 h-14" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">수신자 선택</label>
            <div className="flex flex-col border">
              <input className="m-2 border" value={searchText} onChange={handleSearchUserTag} />
              <select
                multiple
                className="w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={recipients}
                onChange={handleRecipientsChange}
                required
              >
                {
                  searchedUsers.length === 0 ? (
                    <option>사용자가 없습니다.</option>
                  ) : (
                    searchedUsers.map(searchedUser => (
                      <option key={`add_message_modal_search_user_tag_${searchedUser.userTag}`} value={searchedUser.userId}>{searchedUser.userName ?? searchedUser.userTag}</option>
                    ))
                  )
                }
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}