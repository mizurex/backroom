import { Quote } from 'lucide-react';
import { forwardRef } from 'react';
import type { ChatMessage } from '@/types/chat';

type Props = {
  messages: ChatMessage[];
  ownerId: string | null;
  onQuote: (msg: ChatMessage) => void;
};

function parseQuotedText(text: string): { quote: string | null; body: string } {
  const parts = text.split('\n');
  const first = parts[0] ?? '';
  if (first.startsWith('> ')) {
    return { quote: first.slice(2), body: parts.slice(1).join('\n') };
  }
  return { quote: null, body: text };

}

const MessagesList = forwardRef<HTMLDivElement, Props>(function MessagesList(
  { messages, ownerId, onQuote },
  ref
) {
  return (
    <div ref={ref} className="mb-2 h-[61vh] md:h-[66vh] overflow-y-auto space-y-3 scrollbar-hidden px-3">
      {messages.length === 0 ? (
        <div className="text-center text-neutral-600 text-sm py-12">No messages yet.</div>
      ) : (
        messages.map((msg, i) => (
          <div key={i} className={msg.userId === 'system' ? 'text-center' : ''}>
            {msg.userId === 'system' ? (
              <span className="text-xs text-neutral-600 italic">{msg.text}</span>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-50 border-b border-neutral-700 w-fit uppercase">
                    {msg.username.toUpperCase()}
                  </div>
                  {ownerId && msg.userId === ownerId && (
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-sm border border-violet-500/30">
                      ADMIN
                    </span>
                  )}
                  {msg.ts && (
                    <div className="text-[10px] text-neutral-500">
                      {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                {(() => {
                  const parsed = parseQuotedText(msg.text);
                  return (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-black w-fit px-4 py-2 bg-gray-50 rounded-md">
                        {parsed.quote && (
                          <div className="mb-2 pl-2 border-l-2 border-neutral-300 text-neutral-600 text-xs">
                            {parsed.quote}
                          </div>
                        )}
                        <div>{parsed.body}</div>
                      </div>
                      <div>
                        <Quote
                          className="size-3 text-neutral-400 cursor-pointer"
                          onClick={() => onQuote(msg)}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
});

export default MessagesList;


