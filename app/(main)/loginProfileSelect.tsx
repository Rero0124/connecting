export default function LoginProfileSelect({
    profiles,
    onSelect,
    onCancel,
}: {
    profiles: any[];
    onSelect: (profileId: number) => void;
    onCancel: () => void;
}) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-4">프로필 선택</h2>
            <div className="flex flex-col gap-2">
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-700 cursor-pointer"
                        onClick={() => onSelect(profile.id)}
                    >
                        <img src={profile.image} className="w-8 h-8 rounded-full" />
                        <span>{profile.userName ?? profile.userTag}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={onCancel}
                className="mt-4 w-full text-sm text-blue-400 underline hover:text-blue-300 text-center"
            >
                로그인 취소
            </button>
        </div>
    );
}
