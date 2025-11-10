import type { ChatMessage } from '@/types/chat';
import { ArrowRight } from 'lucide-react';
import type { ChangeEvent } from 'react';

type Props = {
  input: string;
  quoted: ChatMessage | null;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClearQuote: () => void;
};

export default function MessageInput({
  input,
  quoted,
  onInputChange,
  onSend,
  onClearQuote,
}: Props) {
  return (
    <>
      {quoted && (
        <div className="mb-2 w-60">
          <div className="flex items-center justify-between bg-neutral-900 border border-neutral-700 rounded-sm p-2">
            <div className="text-xs text-neutral-300">
              <span className="uppercase text-neutral-400">{quoted.username}</span>: {quoted.text}
            </div>
            <button onClick={onClearQuote} className="text-neutral-500 hover:text-neutral-300 text-xs">
              X
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          type="text"
          placeholder="message..."
          className="flex-1 border border-neutral-800 rounded-sm px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
        />
        <button
          onClick={onSend}
          disabled={!input.trim()}
          className="cursor-pointer bg-violet-300 hover:bg-violet-400  text-neutral-900 py-1 px-3 transition-colors duration-200"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}


