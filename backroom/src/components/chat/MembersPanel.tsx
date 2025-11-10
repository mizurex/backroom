type Member = { userId: string; username: string };

type Props = {
  open: boolean;
  members: Member[];
  ownerId: string | null;
  isOwner: boolean;
  onKick: (userId: string) => void;
  className?: string;
};

export default function MembersPanel({
  open,
  members,
  ownerId,
  isOwner,
  onKick,
  className,
}: Props) {
  if (!open) return null;
  return (
    <div className={className}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 ">
        <div className="text-xs text-neutral-400 mb-2">Members</div>
        <div className="flex flex-col gap-2">
          {members.length === 0 ? (
            <div className="text-xs text-neutral-600">No members online</div>
          ) : (
            members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-200">{m.username}</span>
                  {ownerId && m.userId === ownerId && (
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-sm border border-violet-500/30">ADMIN</span>
                  )}
                </div>
                {isOwner && ownerId !== m.userId && (
                  <button
                    onClick={() => onKick(m.userId)}
                    className="text-[10px] text-red-300 hover:text-red-200 border border-red-300/30 px-1.5 py-0.5 rounded-sm"
                  >
                    Kick
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


