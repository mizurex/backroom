import { Copy, LogOut } from 'lucide-react';

type Props = {
  roomId: string;
  copied: boolean;
  isConnected: boolean;
  onCopy: () => void;
  onToggleMembers: () => void;
  onLeave: () => void;
};

export default function ChatHeader({
  roomId,
  copied,
  isConnected,
  onCopy,
  onToggleMembers,
  onLeave,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-700">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 font-mono">{roomId}</span>
        {copied ? (
          <span className="text-xs text-neutral-400 font-mono">Copied</span>
        ) : (
          <Copy
            className="w-3 h-3 text-neutral-400 cursor-pointer mr-3 sm:mr-0"
            onClick={onCopy}
          />
        )}
      </div>
      <div className="flex items-center gap-2 ml-8">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-xs text-neutral-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
        <button
          onClick={onToggleMembers}
          className="ml-2 text-xs cursor-pointer text-neutral-300 hover:text-neutral-100 border border-neutral-700 px-2 py-1 rounded-sm"
        >
          Members
        </button>
      </div>
      <button
        onClick={onLeave}
        className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
        title="Leave room"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}


