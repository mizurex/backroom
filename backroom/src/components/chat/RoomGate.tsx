import { ArrowRight, Plus } from 'lucide-react';
import type { ChangeEvent } from 'react';

type Props = {
  joinRoomId: string;
  onJoinRoomIdChange: (v: string) => void;
  onJoin: () => void;
  onCreate: () => void;
  onLogout: () => void;
};

export default function RoomGate({
  joinRoomId,
  onJoinRoomIdChange,
  onJoin,
  onCreate,
  onLogout,
}: Props) {
  return (
    <div className="p-8">
      {/* User info and logout */}
      <div className="flex justify-end mb-6">
        <button
          onClick={onLogout}
          className="text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-2 text-sm"
        >
          Logout
        </button>
      </div>
      <div className="mb-8">
        <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-3">
          Enter Room ID
        </label>
        <div className="flex gap-2">
          <input
            value={joinRoomId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onJoinRoomIdChange(e.target.value)}
            type="text"
            placeholder="room id"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-sm px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && onJoin()}
          />
          <button
            onClick={onJoin}
            disabled={!joinRoomId.trim()}
            className="bg-neutral-800 relative hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500 text-neutral-200 px-5 rounded-sm transition-colors duration-200 flex items-center gap-2 border border-neutral-800"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-800 px-3 text-neutral-500 tracking-wider">or</span>
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-3">
          Create New Room
        </label>
        <button
          onClick={onCreate}
          className="w-full bg-violet-300 hover:bg-violet-400 text-neutral-900 py-3 rounded-sm transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          New Backroom
        </button>
      </div>
    </div>
  );
}


